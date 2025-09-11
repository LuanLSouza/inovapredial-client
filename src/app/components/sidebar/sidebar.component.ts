import { Component, Input, Output, EventEmitter } from '@angular/core';
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
  @Input() menuItems: MenuItem[] = [];
  @Output() menuItemClick = new EventEmitter<string>();

  onMenuItemClick(route: string) {
    this.menuItemClick.emit(route);
  }
}
