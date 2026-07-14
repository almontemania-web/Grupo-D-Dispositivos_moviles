import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/splash/splash.page').then(m => m.SplashPage)
  },
  {
    path: 'splash',
    loadComponent: () => import('./pages/splash/splash.page').then(m => m.SplashPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/registro/registro.page').then(m => m.RegistroPage)
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./home/home.page').then(m => m.HomePage)
  },
  {
    path: 'medicamentos',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/medicamentos/medicamentos.page').then(m => m.MedicamentosPage)
  },
  {
    path: 'agregar-medicamento',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/agregar-medicamento/agregar-medicamento.page').then(m => m.AgregarMedicamentoPage)
  },
  {
    path: 'historial',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/historial/historial.page').then(m => m.HistorialPage)
  },
  {
    path: 'citas',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/citas/citas.page').then(m => m.CitasPage)
  },
  {
    path: 'perfil-medico',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/perfil-medico/perfil-medico.page').then(m => m.PerfilMedicoPage)
  },
  {
    path: 'emergencia',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/emergencia/emergencia.page').then(m => m.EmergenciaPage)
  },
  {
  path: 'carne-digital',
  canActivate: [authGuard],
  loadComponent: () => import('./pages/carne-digital/carne-digital.page').then(m => m.CarneDigitalPage)
},
{
  path: 'control-salud',
  canActivate: [authGuard],
  loadComponent: () => import('./pages/control-salud/control-salud.page').then(m => m.ControlSaludPage)
},
  {
    path: 'escanear-receta',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/escanear-receta/escanear-receta.page').then(m => m.EscanearRecetaPage)
  },
  {
    path: 'escanear-qr',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/escanear-qr/escanear-qr.page').then(m => m.EscanearQrPage)
  },
  {
    path: 'multimedia',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/multimedia/multimedia.page').then(m => m.MultimediaPage)
  },
  {
    path: '**',
    redirectTo: ''
  },
];

