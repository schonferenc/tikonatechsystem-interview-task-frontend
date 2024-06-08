import { Routes } from '@angular/router';

// Pages
import { HomeComponent } from './features/home/home.component';
import { ProfileComponent } from './features/profile/profile.component';
import { AdminComponent } from './features/admin/admin.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'admin', component: AdminComponent },
  { path: '', redirectTo: '/profile', pathMatch: 'full' },
  // Wildcard route
  { path: '**', redirectTo: '/profile' },
];
