import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  // Agar request ke paas already Authorization header hai,
  // to usko overwrite MAT karo.
  if (req.headers.has('Authorization')) {
    return next(req);
  }

  const token = localStorage.getItem('token');

  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
  );
};