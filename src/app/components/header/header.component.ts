import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { AsyncPipe, NgIf } from '@angular/common';
import { Subject, takeUntil, distinctUntilChanged } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { SelectedBuildingService } from 'src/app/services/selected-building.service';
import { BuildingSelectionModalComponent } from '../building-selection-modal/building-selection-modal.component';
import { AddUserModalComponent } from '../add-user-modal/add-user-modal.component';
import { OwnUsersService } from 'src/app/services/own-users.service';
import { OwnUserRequestDTO } from 'src/app/models/own-user.dto';
import { addIcons } from 'ionicons';
import { ellipsisVertical } from 'ionicons/icons';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [IonicModule, AsyncPipe],
})
export class HeaderComponent implements OnInit, OnDestroy {
  userInfo$ = this.authService.userInfo$;
  selectedBuilding$ = this.selectedBuildingService.selectedBuilding$;
  private destroy$ = new Subject<void>();
  private previousBuildingId: string | null = null;
  
  @Output() logoutClick = new EventEmitter<void>();

  constructor(
    private authService: AuthService,
    private selectedBuildingService: SelectedBuildingService,
    private modalController: ModalController,
    private toastController: ToastController,
    private ownUsersService: OwnUsersService,
  ) {
    addIcons({ 'ellipsis-vertical': ellipsisVertical });
  }

  ngOnInit() {
    const initialBuilding = this.selectedBuildingService.getSelectedBuilding();
    this.previousBuildingId = initialBuilding?.id || null;

    this.selectedBuilding$
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged((prev, curr) => prev?.id === curr?.id)
      )
      .subscribe(building => {
        const currentBuildingId = building?.id || null;
        
        if (this.previousBuildingId !== null && this.previousBuildingId !== currentBuildingId) {
          console.log('Edificação alterada, recarregando página...');
          this.reloadPage();
        }
        
        this.previousBuildingId = currentBuildingId;
      });

    this.userInfo$
      .pipe(takeUntil(this.destroy$))
      .subscribe(userInfo => {
        if (userInfo?.building && !this.selectedBuildingService.getSelectedBuilding()) {
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onLogoutClick() {
    this.logoutClick.emit();
    this.authService.logout();
  }

  async onBuildingDropdownClick() {
    const modal = await this.modalController.create({
      component: BuildingSelectionModalComponent,
      presentingElement: await this.modalController.getTop()
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      console.log('Edificação selecionada:', data);
    }
  }

  getBuildingDisplayName(): string {
    const selectedBuilding = this.selectedBuildingService.getSelectedBuilding();
    if (selectedBuilding) {
      return selectedBuilding.name;
    }
    
    return 'Selecionar Edificação';
  }

  private reloadPage(): void {
    window.location.reload();
  }

  onAddUserClick(): void {
    this.openAddUserModal();
  }

  private async openAddUserModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: AddUserModalComponent,
      presentingElement: await this.modalController.getTop()
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.created && data.dto) {
      const dto = data.dto as OwnUserRequestDTO;
      this.ownUsersService.create(dto).subscribe({
        next: async () => {
          await this.presentToast('Usuário criado com sucesso.', 'success');
        },
        error: async (err) => {
          console.error(err);
          await this.presentToast('Falha ao criar usuário.', 'danger');
        }
      });
    }
  }

  private async presentToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}
