import { Component, Output, EventEmitter } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AsyncPipe, NgIf } from '@angular/common';
import { UserInfo } from 'src/app/models/userinfo.interface';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [IonicModule, AsyncPipe],
})
export class HeaderComponent {
  userInfo$ = this.authService.userInfo$;
  
  @Output() logoutClick = new EventEmitter<void>();
  @Output() buildingDropdownClick = new EventEmitter<void>();

  constructor(private authService: AuthService) {}

  onLogoutClick() {
    this.logoutClick.emit();
  }

  onBuildingDropdownClick() {
    this.buildingDropdownClick.emit();
  }
}
