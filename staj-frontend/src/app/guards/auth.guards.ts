import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';


export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Kullanıcı giriş yapmış ve admin değilse, sayfaya erişime izin ver.
  if (authService.isLoggedIn() && !authService.isAdmin()) {
    return true;
  }
  
  // Yukarıdaki şart sağlanmıyorsa, kullanıcıyı login sayfasına yönlendir.
  return router.parseUrl('/login');
};