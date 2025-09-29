import { Routes, CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { MainLayoutComponent } from './components/layout/main-layout.component';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'home',
        loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'buildings',
        loadComponent: () => import('./pages/buildings/buildings.page').then( m => m.BuildingsPage)
      },
      {
        path: 'buildings/new',
        loadComponent: () => import('./pages/buildings/form-building/form-building.page').then( m => m.FormBuildingPage)
      },
      {
        path: 'buildings/edit/:id',
        loadComponent: () => import('./pages/buildings/form-building/form-building.page').then( m => m.FormBuildingPage)
      },
      {
        path: 'buildings/view/:id',
        loadComponent: () => import('./pages/buildings/view-building/view-building.page').then( m => m.ViewBuildingPage)
      },
      {
        path: 'equipments',
        loadComponent: () => import('./pages/equipments/equipments.page').then( m => m.EquipmentsPage)
      },
      {
        path: 'equipments/new',
        loadComponent: () => import('./pages/equipments/form-equipment/form-equipment.page').then( m => m.FormEquipmentPage)
      },
      {
        path: 'equipments/edit/:id',
        loadComponent: () => import('./pages/equipments/form-equipment/form-equipment.page').then( m => m.FormEquipmentPage)
      },
      {
        path: 'equipments/view/:id',
        loadComponent: () => import('./pages/equipments/view-equipment/view-equipment.page').then( m => m.ViewEquipmentPage)
      },
      {
        path: 'maintenance-plans',
        loadComponent: () => import('./pages/maintenance-plans/maintenance-plans.page').then( m => m.MaintenancePlansPage)
      },
      {
        path: 'maintenance-plans/new',
        loadComponent: () => import('./pages/maintenance-plans/form-maintenance-plan/form-maintenance-plan.page').then( m => m.FormMaintenancePlanPage)
      },
      {
        path: 'maintenance-plans/edit/:id',
        loadComponent: () => import('./pages/maintenance-plans/form-maintenance-plan/form-maintenance-plan.page').then( m => m.FormMaintenancePlanPage)
      },
      {
        path: 'maintenance-plans/view/:id',
        loadComponent: () => import('./pages/maintenance-plans/view-maintenance-plan/view-maintenance-plan.page').then( m => m.ViewMaintenancePlanPage)
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home'
      }
    ]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

];