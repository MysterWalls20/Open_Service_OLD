import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComprobanteService } from '../../services/comprobante.service';

// IMPORTACIONES PARA EL PDF
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-comprobantes-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comprobantes-page.html',
  styleUrl: './comprobantes-page.scss',
})
export class ComprobantesPageComponent implements OnInit {
  comprobantes: any[] = [];
  filteredComprobantes: any[] = [];
  loading = true;
  fechaInicio = '';
  fechaFin = '';
  filtroDocumento = '';

  // --- PAGINACIÓN ---
  currentPage: number = 1;
  itemsPerPage: number = 10;

  constructor(
    private cdr: ChangeDetectorRef,
    private comprobanteService: ComprobanteService
  ) {}

  ngOnInit() {
    this.cargarComprobantes();
  }

  // --- LÓGICA DE PAGINACIÓN ---
    // ¡OJO! Hacemos slice a filteredComprobantes
    get comprobantesPaginados() {
      const inicio = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredComprobantes.slice(inicio, inicio + this.itemsPerPage);
    }

    get totalPages() { return Math.max(1, Math.ceil(this.filteredComprobantes.length / this.itemsPerPage)); }
    nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }
    prevPage() { if (this.currentPage > 1) this.currentPage--; }
    // ----------------------------

  cargarComprobantes() {
    this.loading = true;
    this.comprobanteService.getAll().subscribe({
      next: (data) => {
        this.comprobantes = data;
        this.aplicarFiltros();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  aplicarFiltros() {
    this.filteredComprobantes = this.comprobantes.filter(c => {
      if (this.filtroDocumento && !c.tipoDocumento.toLowerCase().includes(this.filtroDocumento.toLowerCase())) {
        return false;
      }
      if (this.fechaInicio && c.venta?.fechaVenta) {
        const fecha = new Date(c.venta.fechaVenta).toISOString().slice(0, 10);
        if (fecha < this.fechaInicio) return false;
      }
      if (this.fechaFin && c.venta?.fechaVenta) {
        const fecha = new Date(c.venta.fechaVenta).toISOString().slice(0, 10);
        if (fecha > this.fechaFin) return false;
      }
      return true;
    });
    this.currentPage = 1; // Reiniciar la paginación al aplicar filtros
  }

  get totalSubtotal(): number {
    return this.filteredComprobantes.reduce((sum, c) => sum + c.subTotal, 0);
  }

  get totalIgv(): number {
    return this.filteredComprobantes.reduce((sum, c) => sum + c.montoIgv, 0);
  }

  get totalGeneral(): number {
    return this.filteredComprobantes.reduce((sum, c) => sum + (c.subTotal + c.montoIgv), 0);
  }

  // ==========================================
  // FUNCIÓN MÁGICA PARA GENERAR EL PDF
  // ==========================================
  generarPDF(comprobante: any) {
    const doc = new jsPDF();
    const fechaEmision = new Date(comprobante.venta.fechaVenta).toLocaleDateString('es-PE');
    
    // 1. Título y Cabecera de la Empresa
    doc.setFontSize(22);
    doc.setTextColor(68, 82, 204); // Azul corporativo
    doc.setFont('helvetica', 'bold');
    doc.text('OPEN SERVICE', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('Servicios Tecnico de Electrodomésticos Autorizado', 14, 26);
    doc.text('RUC: 20605659846 | Estete 365, Trujillo', 14, 31);

    // 2. Cuadro del Comprobante (Lado derecho)
    doc.setDrawColor(68, 82, 204);
    doc.setLineWidth(0.5);
    doc.rect(130, 12, 65, 25);
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(`R.U.C. 20605659846`, 140, 19);
    doc.text(`${comprobante.tipoDocumento.toUpperCase()} ELECTRÓNICA`, 133, 26);
    doc.text(`${comprobante.serie} - ${comprobante.correlativo}`, 145, 33);

    // 3. Datos del Cliente
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DATOS DEL CLIENTE:', 14, 45);
    doc.setFont('helvetica', 'normal');
    
    const cliente = comprobante.venta?.cliente;
    const nombreCliente = cliente ? `${cliente.nombres} ${cliente.apellidos}` : 'Cliente Genérico';
    const correoCliente = cliente?.correo || 'No registrado';
    const metodoPago = comprobante.venta?.tipoPago?.descripcion || 'Efectivo';
    
    doc.text(`Señor(es): ${nombreCliente}`, 14, 52);
    doc.text(`Correo: ${correoCliente}`, 14, 58);
    doc.text(`Fecha de Emisión: ${fechaEmision}`, 130, 52);
    doc.text(`Método de Pago: ${metodoPago}`, 130, 58);

    // 4. Preparar la Tabla de Detalles
    // (Si es una venta directa, listamos los productos. Si es un servicio técnico, lo ponemos como un concepto global)
    let cuerpoTabla: any[] = [];
    
    if (comprobante.venta?.detalles && comprobante.venta.detalles.length > 0) {
      // Venta de Productos
      cuerpoTabla = comprobante.venta.detalles.map((d: any) => [
        d.cantidad,
        d.articulo,
        `S/ ${d.precioUnitario.toFixed(2)}`,
        `S/ ${d.subtotal.toFixed(2)}`
      ]);
    } else {
      // Cobro de un Servicio
      cuerpoTabla = [[
        1,
        `Pago por: ${comprobante.venta.origenVenta}`,
        `S/ ${(comprobante.subTotal).toFixed(2)}`,
        `S/ ${(comprobante.subTotal).toFixed(2)}`
      ]];
    }

    // 5. Dibujar la Tabla
    autoTable(doc, {
      startY: 68,
      head: [['Cant.', 'Descripción', 'Precio Unitario', 'Subtotal']],
      body: cuerpoTabla,
      theme: 'striped',
      headStyles: { fillColor: [68, 82, 204], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { halign: 'center', cellWidth: 20 },
        2: { halign: 'right', cellWidth: 35 },
        3: { halign: 'right', cellWidth: 35 }
      }
    });

    // 6. Sección de Totales (Abajo a la derecha)
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    const totalPagar = comprobante.subTotal + comprobante.montoIgv;
    
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', 140, finalY);
    doc.text(`S/ ${comprobante.subTotal.toFixed(2)}`, 175, finalY, { align: 'right' });
    
    doc.text('IGV (18%):', 140, finalY + 8);
    doc.text(`S/ ${comprobante.montoIgv.toFixed(2)}`, 175, finalY + 8, { align: 'right' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 167, 69); // Verde para el total
    doc.text('TOTAL:', 140, finalY + 18);
    doc.text(`S/ ${totalPagar.toFixed(2)}`, 175, finalY + 18, { align: 'right' });

    // Mensaje de cierre
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(150, 150, 150);
    doc.text('¡Gracias por confiar en Open Service!', 105, finalY + 30, { align: 'center' });

    // 7. Descargar el archivo automáticamente
    doc.save(`${comprobante.tipoDocumento}_${comprobante.serie}-${comprobante.correlativo}.pdf`);
  }
}