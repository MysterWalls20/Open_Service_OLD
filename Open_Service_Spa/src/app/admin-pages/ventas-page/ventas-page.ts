import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { VentaService } from '../../services/venta.service';
import { ProductoService } from '../../services/producto.service'; 
// 👇 AHORA SÍ IMPORTAMOS EL SERVICIO DE ÓRDENES
import { ServicioService } from '../../services/servicio.service'; 
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-ventas-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventas-page.html',
  styleUrl: './ventas-page.scss',
})
export class VentasPageComponent implements OnInit, OnDestroy {
  showForm = false;
  ventas: any[] = [];
  loading = false;
  private routerSubscription?: Subscription;

  totalVentasHoy: number = 0;
  ventasMes: number = 0;
  promedioVenta: number = 0;

  tipoOperacion: 'venta' | 'servicio' = 'venta';
  serviciosPendientes: any[] = []; 
  articulosInventario: any[] = [];
  
  form = {
    nombres: '', apellidos: '', correo: '', telefono: '', direccion: '',
    idTipoPago: 1, idServicio: null as number | null,
    idArticuloSeleccionado: null as number | null,
    cantidadSeleccionada: 1, carritoAdmin: [] as any[], 
    subtotal: 0, igv: 0, total: 0
  };

  constructor(
    private cdr: ChangeDetectorRef, 
    private ventaService: VentaService, 
    private productoService: ProductoService,
    private servicioService: ServicioService, // Inyectamos el Servicio
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarVentas();
    this.cargarDatosParaCombobox();

    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event.url === '/admin/ventas') {
          this.cargarVentas();
        }
      });
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
  }

  cargarVentas() {
    this.loading = true;
    this.ventaService.getAll().subscribe({
      next: (data) => {
        this.calcularEstadisticas(data);

        this.ventas = data.map((v: any) => ({
          id: v.idVenta,
          cliente: v.idClienteNavigation ? `${v.idClienteNavigation.nombres} ${v.idClienteNavigation.apellidos}` : 'N/A',
          origen: v.origenVenta,
          // 👇 AGREGAMOS EL SUBTOTAL Y EL IGV A LA TABLA PRINCIPAL
          subtotal: v.montoTotal - (v.igv || 0),
          igv: v.igv || 0,
          total: v.montoTotal,
          fecha: v.fechaVenta ? new Date(v.fechaVenta).toLocaleDateString() : 'N/A',
          metodoPago: v.idTipoPagoNavigation?.descripcion || 'N/A',
          comprobante: v.tipoComprobante
        }));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar ventas:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // En ventas-page.ts
  deleteVenta(id: number) {
    if (confirm('¿Estás seguro de eliminar esta venta? Esto anulará el comprobante.')) {
      this.ventaService.delete(id).subscribe({
        next: () => {
          alert('Venta eliminada correctamente.');
          this.cargarVentas(); // Recarga la tabla
          this.cargarDatosParaCombobox(); // Recarga el combobox (el servicio volverá a aparecer)
        },
        error: (err) => {
          console.error(err);
          alert('Error al eliminar la venta.');
        }
      });
    }
  }

cargarDatosParaCombobox() {
    // 1. Cargar Productos
    this.productoService.getAll().subscribe({
      next: (data) => {
        this.articulosInventario = data.map((p: any) => ({
          idArticulo: p.idArticulo,
          nombre: p.idArticuloNavigation?.nombre || 'Producto sin nombre',
          precio: p.idArticuloNavigation?.precio || 0,
          stockDisponible: p.idArticuloNavigation?.stockDisponible || 0
        }));
      }
    });
    
    // 2. Cargar Servicios (Jalando los datos del Cliente a través del Pedido)
    this.servicioService.getAll().subscribe({
      next: (data) => {
        this.serviciosPendientes = data
          .filter((s: any) => s.estado === 'Activo') // Solo los servicios pendientes de cobro
          .map((s: any) => {
            
            // 👇 AQUÍ ATRAPAMOS AL CLIENTE QUE VINO DENTRO DEL PEDIDO
            const clienteDelPedido = s.idPedidoNavigation?.idClienteNavigation;

            return {
              idServicio: s.idServicio,
              diagnosticoTecnico: s.diagnosticoTecnico || 'Sin diagnóstico',
              totalServicio: s.totalServicio,
              cliente: {
                // Llenamos los datos automáticamente
                nombres: clienteDelPedido?.nombres || 'Cliente no asignado',
                apellidos: clienteDelPedido?.apellidos || '',
                correo: clienteDelPedido?.correo || '',
                telefono: clienteDelPedido?.telefono || '',
                direccion: clienteDelPedido?.direccion || ''
              }
            };
          });
      },
      error: (err) => console.error('Error al cargar servicios:', err)
    });
  }

  calcularMontos(montoGeneral: number) {
    this.form.total = montoGeneral;
    this.form.subtotal = montoGeneral / 1.18;
    this.form.igv = montoGeneral - this.form.subtotal;
  }

  onServicioSeleccionado() {
    const servicio = this.serviciosPendientes.find(s => s.idServicio == this.form.idServicio);
    if (servicio) {
      this.form.nombres = servicio.cliente.nombres;
      this.form.apellidos = servicio.cliente.apellidos;
      this.form.correo = servicio.cliente.correo;
      this.form.telefono = servicio.cliente.telefono;
      this.form.direccion = servicio.cliente.direccion;
      
      this.calcularMontos(servicio.totalServicio);
    }
  }

  // ... (Tus métodos agregarProductoVenta, quitarProductoVenta, calcularTotalVentaDirecta, calcularEstadisticas, openForm, closeForm y resetForm se mantienen exactamente igual) ...

  agregarProductoVenta() {
    if (!this.form.idArticuloSeleccionado) return;
    const articulo = this.articulosInventario.find(a => a.idArticulo == this.form.idArticuloSeleccionado);
    if (articulo) {
      if (this.form.cantidadSeleccionada > articulo.stockDisponible) {
        alert('No hay stock suficiente en inventario.');
        return;
      }
      this.form.carritoAdmin.push({
        idArticulo: articulo.idArticulo,
        nombre: articulo.nombre,
        cantidad: this.form.cantidadSeleccionada,
        precio: articulo.precio,
        subtotal: articulo.precio * this.form.cantidadSeleccionada
      });
      this.calcularTotalVentaDirecta();
      this.form.idArticuloSeleccionado = null;
      this.form.cantidadSeleccionada = 1;
    }
  }

  quitarProductoVenta(index: number) {
    this.form.carritoAdmin.splice(index, 1);
    this.calcularTotalVentaDirecta();
  }

  calcularTotalVentaDirecta() {
    const suma = this.form.carritoAdmin.reduce((sum, item) => sum + item.subtotal, 0);
    this.calcularMontos(suma);
  }

  calcularEstadisticas(data: any[]) {
    const hoy = new Date();
    let sumaHoy = 0; let contadorMes = 0; let sumaGeneral = 0;
    data.forEach(v => {
      const fechaVenta = new Date(v.fechaVenta);
      sumaGeneral += v.montoTotal;
      if (fechaVenta.toDateString() === hoy.toDateString()) sumaHoy += v.montoTotal;
      if (fechaVenta.getMonth() === hoy.getMonth() && fechaVenta.getFullYear() === hoy.getFullYear()) contadorMes++;
    });
    this.totalVentasHoy = sumaHoy;
    this.ventasMes = contadorMes;
    this.promedioVenta = data.length > 0 ? (sumaGeneral / data.length) : 0;
  }

  openForm() { this.showForm = true; this.tipoOperacion = 'venta'; this.resetForm(); }
  closeForm() { this.showForm = false; }
  resetForm() {
    this.form = { nombres: '', apellidos: '', correo: '', telefono: '', direccion: '', idTipoPago: 1, idServicio: null, idArticuloSeleccionado: null, cantidadSeleccionada: 1, carritoAdmin: [], subtotal: 0, igv: 0, total: 0 };
  }

  procesarTransaccion() {
    if (!this.form.nombres || !this.form.apellidos) {
      alert('Debe completar al menos nombres y apellidos del cliente.'); return;
    }
    if (this.tipoOperacion === 'venta' && this.form.carritoAdmin.length === 0) {
      alert('Debe agregar al menos un producto a la venta.'); return;
    }
    if (this.tipoOperacion === 'servicio' && !this.form.idServicio) {
      alert('Debe seleccionar un servicio a cobrar.'); return;
    }

    const payload = {
      nombres: this.form.nombres, apellidos: this.form.apellidos, correo: this.form.correo, telefono: this.form.telefono, direccion: this.form.direccion,
      idTipoPago: Number(this.form.idTipoPago), montoTotal: this.form.total,
      origenVenta: this.tipoOperacion === 'venta' ? 'Venta Directa Admin' : 'Servicio Técnico',
      idServicio: this.tipoOperacion === 'servicio' ? this.form.idServicio : null,
      items: this.tipoOperacion === 'venta' ? this.form.carritoAdmin : [] 
    };

    this.ventaService.checkout(payload).subscribe({
      next: (res: any) => {
        alert(`Transacción exitosa.\nComprobante generado: ${res.nroComprobante}`);
        this.cargarVentas(); // Recarga la tabla de ventas
        this.cargarDatosParaCombobox(); // Recarga los servicios (el completado desaparecerá)
        this.closeForm();
      },
      error: (err) => {
        console.error(err);
        alert('Error al procesar el pago. Revisa la consola para más detalles.');
      }
    });
  }
}