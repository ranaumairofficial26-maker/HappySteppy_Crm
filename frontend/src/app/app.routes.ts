import { Routes } from '@angular/router';
import { StorefrontComponent } from './features/storefront/storefront.component';
import { AdminComponent } from './features/admin/admin.component';

export const routes: Routes = [
  {
    path: '',
    component: StorefrontComponent,
    title: 'Happy Steppy - Health Supplements & Autism Sensory Care'
  },
  {
    path: 'admin',
    component: AdminComponent,
    title: 'Admin Management - Happy Steppy'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
