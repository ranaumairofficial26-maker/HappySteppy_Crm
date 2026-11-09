import { Routes } from '@angular/router';
import { StorefrontComponent } from './features/storefront/storefront.component';

export const routes: Routes = [
  {
    path: '',
    component: StorefrontComponent,
    title: 'Happy Steppy - Health Supplements & Autism Sensory Care'
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent),
    title: 'Happy Steppy - Admin Dashboard'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
