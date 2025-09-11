import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { SidebarComponent, MenuItem, HeaderComponent, UserInfo } from '../components';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, SidebarComponent, HeaderComponent],
})
export class HomePage {
  constructor(
    private router: Router, 
    private authService: AuthService,
    private alertController: AlertController
  ) {}

  menuItems: MenuItem[] = [
    { icon: 'assets/icons/home-icon.svg', label: 'Inicio', route: '/home' },
    { icon: 'assets/icons/building-icon.svg', label: 'Edificações', route: '/buildings' },
    { icon: 'assets/icons/order-service-icon.svg', label: 'Ordens de Serviço', route: '/orders' },
    { icon: 'assets/icons/metrics-icon.svg', label: 'Métricas', route: '/metrics' },
    { icon: 'assets/icons/equipments-icon.svg', label: 'Equipamentos', route: '/equipment' },
    { icon: 'assets/icons/stock-icon.svg', label: 'Estoque', route: '/stock' },
    { icon: 'assets/icons/employee-icon.svg', label: 'Funcionários', route: '/employees' },
    { icon: 'assets/icons/calendar-icon.svg', label: 'Calendários', route: '/calendar' },
    { icon: 'assets/icons/plan-icon.svg', label: 'Plano de manutenções', route: '/maintenance-plan' }
  ];

  userInfo: UserInfo = {
    name: 'Luan de Souza',
    role: 'Sindico',
    building: 'Edf. Soller Casa Grande',
    avatar: 'assets/images/user-avatar.jpg'
  };

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
