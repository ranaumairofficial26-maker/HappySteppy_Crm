import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  // Authentication state
  isAuthenticated = signal<boolean>(false);
  email = signal<string>('admin@happysteppy.com');
  password = signal<string>('');
  errorMessage = signal<string>('');
  isLoading = signal<boolean>(false);

  // Active navigation tab
  activeTab = signal<string>('overview');

  // Stats for the clean dashboard
  stats = signal({
    totalProducts: 4,
    totalBrands: 9,
    storeStatus: 'Active & Live',
    lastSync: 'Just now'
  });

  ngOnInit(): void {
    // Check if user was previously logged in this session
    const savedAuth = localStorage.getItem('hs_admin_auth');
    if (savedAuth === 'true') {
      this.isAuthenticated.set(true);
    }
  }

  login(): void {
    this.errorMessage.set('');

    const emailVal = this.email().trim();
    const passVal = this.password().trim();

    if (!emailVal) {
      this.errorMessage.set('Please enter your admin email.');
      return;
    }

    if (!passVal) {
      this.errorMessage.set('Please enter your password.');
      return;
    }

    this.isLoading.set(true);

    // Smooth sign-in
    setTimeout(() => {
      this.isLoading.set(false);
      this.isAuthenticated.set(true);
      localStorage.setItem('hs_admin_auth', 'true');
    }, 400);
  }

  logout(): void {
    this.isAuthenticated.set(false);
    this.password.set('');
    this.errorMessage.set('');
    localStorage.removeItem('hs_admin_auth');
  }

  setActiveTab(tab: string): void {
    this.activeTab.set(tab);
  }
}

