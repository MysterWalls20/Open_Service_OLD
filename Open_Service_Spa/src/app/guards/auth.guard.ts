import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private router = inject(Router);

  // =================================================================
  // MATRIZ DE PERMISOS (RBAC - Role Based Access Control)
  // Define qué roles pueden acceder a cada ruta URL
  // =================================================================
  private permisosRutas: { [key: string]: string[] } = {
    '/admin/dashboard': ['Administrador', 'Vendedor', 'Comprador_Inventario', 'Técnico', 'Inventario'],
    '/admin/clientes': ['Administrador', 'Técnico'],
    '/admin/productos': ['Administrador', 'Comprador_Inventario', 'Inventario'],
    '/admin/inventario': ['Administrador', 'Comprador_Inventario', 'Inventario'],
    '/admin/proveedor': ['Administrador', 'Comprador_Inventario'],
    '/admin/servicios': ['Administrador', 'Técnico'],
    '/admin/repuestos': ['Administrador', 'Comprador_Inventario', 'Inventario'],
    '/admin/pedidos': ['Administrador', 'Técnico'],
    '/admin/ventas': ['Administrador', 'Vendedor', 'Técnico'],
    '/admin/comprobantes': ['Administrador', 'Vendedor', 'Técnico'],
    '/admin/compras': ['Administrador', 'Comprador_Inventario'],
    '/admin/empleados': ['Administrador'],
    '/admin/categorias': ['Administrador', 'Comprador_Inventario'],
    '/admin/reporte': ['Administrador', 'Vendedor', 'Técnico']
  };

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('admin_user');

    // 1. VALIDACIÓN DE TOKEN: Si no hay token o no hay usuario, lo mandamos al login
    if (!token || !userStr) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    }

    // 2. EXTRAEMOS EL ROL DEL USUARIO
    const user = JSON.parse(userStr);
    const rolUsuario = user.rol;

    // 3. VALIDACIÓN DE ROLES (Evita accesos forzados por URL)
    // Buscamos a qué ruta principal intenta acceder (útil si hay rutas hijas como /admin/ventas/1)
    const rutaDestino = Object.keys(this.permisosRutas).find(rutaDefinida => state.url.startsWith(rutaDefinida));

    if (rutaDestino) {
      const rolesPermitidos = this.permisosRutas[rutaDestino];
      
      if (!rolesPermitidos.includes(rolUsuario)) {
        // Si tiene token pero su rol NO está en la lista de permitidos para esa URL
        console.warn(`ACCESO DENEGADO: El rol '${rolUsuario}' no tiene permisos para entrar a '${state.url}'`);
        
        // Lo redirigimos a una zona segura que todos pueden ver
        this.router.navigate(['/admin/dashboard']); 
        return false;
      }
    }

    // 4. Si tiene Token y su Rol está permitido, le abrimos la puerta
    return true;
  }
}