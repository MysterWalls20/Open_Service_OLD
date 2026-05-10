import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-productos-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos-page.html',
  styleUrl: './productos-page.scss',
})
export class ProductosPageComponent {
  searchQuery = '';
  selectedCategory = 'todas';

  categories = ['todas', 'refrigeracion', 'lavanderia', 'cocina', 'climatizacion', 'repuestos'];

  products: Product[] = [
    { id: 1, name: 'Refrigeradora Bosch Serie 4', image: 'assets/producto1.png', price: 2599, category: 'refrigeracion', description: 'Refrigeradora de acero inoxidable con tecnología FreshLife.', brand: 'Bosch' },
    { id: 2, name: 'Refrigeradora Coldex CR-520', image: 'assets/producto2.png', price: 1899, category: 'refrigeracion', description: 'Congelador superior con sistema de enfriamiento rápido.', brand: 'Coldex' },
    { id: 3, name: 'Lavadora Bosch WAN2820EE', image: 'assets/producto1.png', price: 2199, category: 'lavanderia', description: 'Lavadora de carga frontal 8 kg con ActiveWater.', brand: 'Bosch' },
    { id: 4, name: 'Lavadora Coldex CL-1000', image: 'assets/producto2.png', price: 1599, category: 'lavanderia', description: 'Lavadora de carga superior 10 kg con centrifugado potente.', brand: 'Coldex' },
    { id: 5, name: 'Cocina Bosch HSN656AS1', image: 'assets/producto1.png', price: 3299, category: 'cocina', description: 'Cocina empotrable con horno pirolítico y 4 fuegos.', brand: 'Bosch' },
    { id: 6, name: 'Cocina Coldex CG-400', image: 'assets/producto2.png', price: 1299, category: 'cocina', description: 'Cocina a gas 4 hornillas con horno de convección.', brand: 'Coldex' },
    { id: 7, name: 'Aire Acondicionado Bosch Climate 3000', image: 'assets/producto1.png', price: 2799, category: 'climatizacion', description: 'Split inverter 12000 BTU con control WiFi.', brand: 'Bosch' },
    { id: 8, name: 'Aire Acondicionado Coldex CA-9000', image: 'assets/producto2.png', price: 1899, category: 'climatizacion', description: 'Split 9000 BTU con gas ecológico R32.', brand: 'Coldex' },
    { id: 9, name: 'Termostato Bosch Smart', image: 'assets/producto1.png', price: 399, category: 'repuestos', description: 'Termostato digital programable para refrigeración.', brand: 'Bosch' },
    { id: 10, name: 'Filtro de agua Coldex CW-100', image: 'assets/producto2.png', price: 89, category: 'repuestos', description: 'Filtro de repuesto para refrigeradoras Coldex.', brand: 'Coldex' },
    { id: 11, name: 'Cable de alimentación universal', image: 'assets/producto1.png', price: 29, category: 'repuestos', description: 'Cable de alimentación para electrodomésticos 1.5m.', brand: 'Genérico' },
    { id: 12, name: 'Refrigeradora Bosch Serie 6', image: 'assets/producto2.png', price: 4599, category: 'refrigeracion', description: 'Refrigeradora French Door con dispenser de agua.', brand: 'Bosch' },
  ];

  get filteredProducts(): Product[] {
    return this.products.filter(p => {
      const matchCategory = this.selectedCategory === 'todas' || p.category === this.selectedCategory;
      const query = this.searchQuery.toLowerCase();
      const matchSearch = !query || p.name.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query);
      return matchCategory && matchSearch;
    });
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;
  }

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      'todas': 'Todas',
      'refrigeracion': 'Refrigeración',
      'lavanderia': 'Lavandería',
      'cocina': 'Cocina',
      'climatizacion': 'Climatización',
      'repuestos': 'Repuestos',
    };
    return labels[category] || category;
  }
}
