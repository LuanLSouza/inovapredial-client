import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

export interface MenuItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class SidebarComponent {
  @Output() menuItemClick = new EventEmitter<string>();

  menuItems: MenuItem[] = [
    { icon: 'assets/icons/home-icon.svg', label: 'Inicio', route: '/home' },
    { icon: 'assets/icons/building-icon.svg', label: 'Edificações', route: '/buildings' },
    { icon: 'assets/icons/order-service-icon.svg', label: 'Ordens de Serviço', route: '/work-orders' },
    { icon: 'assets/icons/metrics-icon.svg', label: 'Métricas', route: '/metrics' },
    { icon: 'assets/icons/equipments-icon.svg', label: 'Equipamentos', route: '/equipments' },
    { icon: 'assets/icons/stock-icon.svg', label: 'Estoque', route: '/inventories' },
    { icon: 'assets/icons/employee-icon.svg', label: 'Funcionários', route: '/employees' },
    { icon: 'assets/icons/calendar-icon.svg', label: 'Calendários', route: '/calendar' },
    { icon: 'assets/icons/plan-icon.svg', label: 'Plano de manutenções', route: '/maintenance-plans' }
  ];

  onMenuItemClick(route: string) {
    this.menuItemClick.emit(route);
  }
}
