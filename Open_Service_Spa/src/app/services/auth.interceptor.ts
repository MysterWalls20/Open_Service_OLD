import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Buscamos si hay un token guardado
  const token = localStorage.getItem('token');

  // 2. Si existe, clonamos la petición original y le inyectamos el Token en la cabecera
  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedRequest); // Petición viaja con la llave JWT
  }

  // 3. Si no hay token, la petición viaja normal (ej: registrarse o ver productos públicos)
  return next(req);
};