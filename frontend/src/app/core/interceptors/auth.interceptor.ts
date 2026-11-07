import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.accessToken();

  let clonedReq = req.clone({
    withCredentials: true // send httpOnly cookies (for refresh token)
  });

  if (token && !req.headers.has('Authorization')) {
    clonedReq = clonedReq.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(clonedReq).pipe(
    catchError((err: any) => {
      // If 401 Unauthorized and not already calling login/refresh endpoint, auto-relogin and retry
      if (err instanceof HttpErrorResponse && err.status === 401 && !req.url.includes('/api/admin/auth/')) {
        return authService.autoLogin().pipe(
          switchMap(loginRes => {
            if (loginRes?.accessToken) {
              const retriedReq = req.clone({
                withCredentials: true,
                setHeaders: {
                  Authorization: `Bearer ${loginRes.accessToken}`
                }
              });
              return next(retriedReq);
            }
            return throwError(() => err);
          }),
          catchError(() => throwError(() => err))
        );
      }
      return throwError(() => err);
    })
  );
};

