import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Swiper } from 'swiper';
import { Navigation, Pagination, EffectFade } from 'swiper/modules';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-inicio-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './inicio-page.html',
  styleUrl: './inicio-page.scss',
})
export class InicioPageComponent implements AfterViewInit {
  contactForm: FormGroup;

  products: Product[] = [
    { id: 1, name: 'Limpiador de Hornos 375 ml', image: 'assets/producto1.png' },
    { id: 2, name: 'Filtro de Papel Campana 60/90', image: 'assets/filtro.jpg' },
    { id: 3, name: 'Limpiador de Lavadoras 250ml', image: 'assets/producto2.png' },
    { id: 4, name: 'Limpiador para Estufas de Vitrocerámica 250 ml', image: 'assets/producto4.jpg' },
  ];

  @ViewChild('heroSwiper') heroSwiper!: ElementRef;
  @ViewChild('productsSwiper') productsSwiper!: ElementRef;

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      district: ['', Validators.required],
      message: [''],
    });
  }

  ngAfterViewInit() {
    new Swiper(this.heroSwiper.nativeElement, {
      modules: [Navigation, Pagination, EffectFade],
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      effect: 'fade',
      fadeEffect: {
        crossFade: true,
      },
    });

    new Swiper(this.productsSwiper.nativeElement, {
      modules: [Navigation],
      slidesPerView: 1,
      spaceBetween: 20,
      navigation: {
        nextEl: '.products-swiper-button-next',
        prevEl: '.products-swiper-button-prev',
      },
      breakpoints: {
        640: { slidesPerView: 2 },
        991: { slidesPerView: 4 },
      },
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      console.log('Form submitted:', this.contactForm.value);
      alert('Gracias por contactarnos. Nos comunicaremos pronto.');
      this.contactForm.reset();
    }
  }
}
