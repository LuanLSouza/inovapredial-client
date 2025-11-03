import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { AsyncPipe, NgIf } from '@angular/common';
import { Subject, takeUntil, distinctUntilChanged } from 'rxjs';
import { UserInfo } from 'src/app/models/userinfo.interface';
import { AuthService } from 'src/app/services/auth.service';
import { SelectedBuildingService } from 'src/app/services/selected-building.service';
import { BuildingSelectionModalComponent } from '../building-selection-modal/building-selection-modal.component';
import { Building } from 'src/app/models/building.interface';
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
    // Armazenar o ID da edificação inicial
    const initialBuilding = this.selectedBuildingService.getSelectedBuilding();
    this.previousBuildingId = initialBuilding?.id || null;

    // Monitorar mudanças na edificação selecionada
    this.selectedBuilding$
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged((prev, curr) => prev?.id === curr?.id)
      )
      .subscribe(building => {
        const currentBuildingId = building?.id || null;
        
        // Se houve mudança de edificação (não é a inicialização)
        if (this.previousBuildingId !== null && this.previousBuildingId !== currentBuildingId) {
          console.log('Edificação alterada, recarregando página...');
          this.reloadPage();
        }
        
        this.previousBuildingId = currentBuildingId;
      });

    // Se não há edificação selecionada, tentar usar a do userInfo
    this.userInfo$
      .pipe(takeUntil(this.destroy$))
      .subscribe(userInfo => {
        if (userInfo?.building && !this.selectedBuildingService.getSelectedBuilding()) {
          // Se o userInfo tem uma edificação mas não há uma selecionada,
          // podemos criar um objeto Building básico ou buscar os detalhes
          // Por enquanto, vamos apenas mostrar o nome
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
      // Edificação selecionada - o serviço já foi atualizado no modal
      console.log('Edificação selecionada:', data);
    }
  }

  /**
   * Obtém o nome da edificação para exibição
   */
  getBuildingDisplayName(): string {
    const selectedBuilding = this.selectedBuildingService.getSelectedBuilding();
    if (selectedBuilding) {
      return selectedBuilding.name;
    }
    
    // Fallback para o nome da edificação do userInfo
    return 'Selecionar Edificação';
  }

  /**
   * Recarrega a página atual
   */
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
