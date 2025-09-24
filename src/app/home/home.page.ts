import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class HomePage {
  constructor(
    private router: Router, 
    private authService: AuthService,
    private alertController: AlertController
  ) {}


  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  onMenuItemClick(route: string) {
    this.navigateTo(route);
  }

  async onLogoutClick() {
    const alert = await this.alertController.create({
      header: 'Confirmar Logout',
      message: 'Tem certeza que deseja sair da aplicação?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            // Usuário cancelou o logout
          }
        },
        {
          text: 'Sair',
          role: 'confirm',
          handler: () => {
            this.performLogout();
          }
        }
      ]
    });

    await alert.present();
  }

  private performLogout() {
    // Fazer logout no serviço de autenticação (já limpa todos os dados)
    this.authService.logout();
    
    // Navegar para a página de login
    this.router.navigate(['/login']);
  }

  onBuildingDropdownClick() {
    // Implementar lógica do dropdown de edifícios
    console.log('Building dropdown clicked');
  }
}
