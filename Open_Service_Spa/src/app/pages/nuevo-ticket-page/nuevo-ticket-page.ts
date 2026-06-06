import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { PedidoService } from '../../services/pedido.service';

@Component({
  selector: 'app-nuevo-ticket-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './nuevo-ticket-page.html',
  styleUrl: './nuevo-ticket-page.scss',
})
export class NuevoTicketPageComponent implements OnInit {
  form = {
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    direccion: '',
    idMarca: 0, // 0 = Ninguna seleccionada por defecto
    nombreMarca: '', // Para cuando eligen "Otra"
    electrodomestico: '',
    modelo: '',
    tipoServicio: 'Reparacion',
    descripcion: ''
  };

  marcas: any[] = [];

  tiposServicio = [
    { valor: 'Reparacion', label: 'Reparación' },
    { valor: 'Mantenimiento', label: 'Mantenimiento' },
    { valor: 'Instalacion', label: 'Instalación' },
    { valor: 'Repuesto', label: 'Repuesto' }
  ];

  mensajeExito = false;
  errorMsg = '';
  enviando = false;

  constructor(private pedidoService: PedidoService, private router: Router) { }

  ngOnInit() {
    this.cargarMarcas();
  }

  // Carga las marcas reales desde SQL Server
  cargarMarcas() {
    this.pedidoService.getMarcas().subscribe({
      next: (data) => {
        this.marcas = data;
      },
      error: (err) => {
        console.error('Error al cargar marcas desde la BD:', err);
        this.errorMsg = 'No se pudieron cargar las marcas disponibles. Verifica tu conexión.';
      }
    });
  }

  onMarcaChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.form.idMarca = Number(select.value);
  }

  guardarTicket() {
    // Validaciones de campos obligatorios
    if (!this.form.nombres || !this.form.apellidos || !this.form.email || !this.form.direccion || !this.form.descripcion || !this.form.electrodomestico) {
      this.errorMsg = 'Por favor, completa todos los campos obligatorios (*).';
      return;
    }

    if (this.form.idMarca === 0) {
      this.errorMsg = 'Por favor, selecciona una marca de la lista.';
      return;
    }

    if (this.form.idMarca === -1 && !this.form.nombreMarca) {
      this.errorMsg = 'Por favor, escribe el nombre de la marca del equipo.';
      return;
    }

    this.enviando = true;
    this.errorMsg = '';

    // Extraemos el texto de la marca según lo que eligió el usuario
    const marcaSeleccionada = this.form.idMarca === -1
      ? this.form.nombreMarca
      : this.marcas.find(m => m.idMarca === this.form.idMarca)?.nombreMarca;

    const pedidoDto = {
      nombres: this.form.nombres,
      apellidos: this.form.apellidos,
      correo: this.form.email,
      telefono: this.form.telefono,
      direccion: this.form.direccion,
      nombreMarca: marcaSeleccionada,
      electrodomestico: this.form.electrodomestico,
      modelo: this.form.modelo,
      descripcion: this.form.descripcion,
      tipoDeServicio: this.form.tipoServicio,
      urlImagenAdjunta: null // Nulo porque ya no usamos Firebase por ahora
    };

    // Enviamos a la API
    this.pedidoService.createPedidoPublico(pedidoDto).subscribe({
      next: () => {
        this.mensajeExito = true;
        this.enviando = false;

        localStorage.setItem('ultimo_correo_cliente', this.form.email);

        // Redirige al historial de servicios en 3 segundos
        setTimeout(() => this.router.navigate(['/mis-servicios']), 3000);
      },
      error: (err: any) => {
        console.error("Error al guardar el ticket:", err);
        this.enviando = false;
        this.errorMsg = 'Ocurrió un error al intentar enviar el ticket. Inténtalo de nuevo.';
      }
    });
  }
}