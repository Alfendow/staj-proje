import { Routes } from '@angular/router';

import { HomeComponent } from './components/home/home';
import { LoginComponent } from './auth/login/login';
import { AdminLoginComponent } from './auth/admin-login/admin-login';
import { RegisterComponent } from './auth/register/register';
import { MusteriListesiComponent } from './components/musteri/musteri-listesi';
import { KrediComponent } from './components/kredi/kredi.component';
import { ProfilComponent } from './components/profil/profil';

import { authGuard } from './guards/auth.guards';
import { calisanGuard } from './guards/calisan.guards';


export const routes: Routes = [

  { path: '', component: HomeComponent },
  
  { path: 'login', component: LoginComponent },
  { path: 'admin-login', component: AdminLoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: 'kredi', component: KrediComponent, canActivate: [authGuard] },
  { path: 'profil', component: ProfilComponent, canActivate: [authGuard] },

  { path: 'admin/musteri-listesi', component: MusteriListesiComponent, canActivate: [calisanGuard] },
  { path: 'admin/musteri-guncelle/:tckn', component: RegisterComponent, canActivate: [calisanGuard] },

  { path: '**', redirectTo: '', pathMatch: 'full' }

];