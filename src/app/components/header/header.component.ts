import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IonicModule } from '@ionic/angular';

export interface UserInfo {
  name: string;
  role: string;
  building: string;
  avatar: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class HeaderComponent {
  @Input() userInfo: UserInfo = {
    name: '',
    role: '',
    building: '',
    avatar: ''
  };
  
  @Output() logoutClick = new EventEmitter<void>();
  @Output() buildingDropdownClick = new EventEmitter<void>();

  onLogoutClick() {
    this.logoutClick.emit();
  }

  onBuildingDropdownClick() {
    this.buildingDropdownClick.emit();
  }
}
