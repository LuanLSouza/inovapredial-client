import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { AsyncPipe, NgIf } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { UserInfo } from 'src/app/models/userinfo.interface';
import { AuthService } from 'src/app/services/auth.service';
import { SelectedBuildingService } from 'src/app/services/selected-building.service';
import { BuildingSelectionModalComponent } from '../building-selection-modal/building-selection-modal.component';
import { Building } from 'src/app/models/building.interface';


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
  
  @Output() logoutClick = new EventEmitter<void>();

  constructor(
    private authService: AuthService,
    private selectedBuildingService: SelectedBuildingService,
    private modalController: ModalController
  ) {}

  ngOnInit() {
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
}
