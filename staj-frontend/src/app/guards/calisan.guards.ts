import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const calisanGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const aktifKullanici = authService.getAktifKullanici();
  
  // Kullanıcı bir çalışansa (admin veya yetkili), izin ver.
  if (authService.isLoggedIn() && aktifKullanici.isAdmin !== undefined) {
    return true; 
  }

  // Değilse, admin/çalışan giriş sayfasına yönlendir.
  return router.parseUrl('/admin-login');
};