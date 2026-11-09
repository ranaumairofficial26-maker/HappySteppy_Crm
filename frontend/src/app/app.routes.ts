import { Routes } from '@angular/router';
import { StorefrontComponent } from './features/storefront/storefront.component';

export const routes: Routes = [
  {
    path: '',
    component: StorefrontComponent,
    title: 'Happy Steppy - Health Supplements & Autism Sensory Care'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
