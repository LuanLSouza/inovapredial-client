import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router, RouterOutlet } from '@angular/router';
import { SidebarComponent, HeaderComponent } from '../index';
import { AuthService } from 'src/app/services/auth.service';
import { SelectedBuildingService } from 'src/app/services/selected-building.service';

@Component({
  selector: 'app-main-layout',
  template: `
<app-sidebar (menuItemClick)="onMenuItemClick($event)"></app-sidebar>

<div class="ion-page" id="main-content">
  <app-header 
    (logoutClick)="onLogoutClick()"
    (buildingDropdownClick)="onBuildingDropdownClick()">
  </app-header>

  <ion-content class="main-content">
    <router-outlet></router-outlet>
  </ion-content>
</div>
  `,
  styles: [`
  :host { display: block; }
  .main-content { --background: var(--ion-background-color); }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, SidebarComponent, HeaderComponent, RouterOutlet]
})
export class MainLayoutComponent {
  constructor(
    private router: Router,
    private alertController: AlertController,
    private authService: AuthService,
    private selectedBuildingService: SelectedBuildingService
  ) {}

  onMenuItemClick(route: string) {
    this.router.navigate([route]);
  }

  async onLogoutClick() {
    const alert = await this.alertController.create({
      header: 'Confirmar Logout',
      message: 'Tem certeza que deseja sair da aplicação?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Sair', role: 'confirm', handler: () => this.performLogout() }
      ]
    });
    await alert.present();
  }

  private performLogout() {
    this.selectedBuildingService.clearSelectedBuilding();
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onBuildingDropdownClick() {

  }
}


