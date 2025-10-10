import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EquipmentsService } from 'src/app/services/equipments.service';
import { Equipment } from 'src/app/models/equipment.interface';
import { IONIC_IMPORTS } from 'src/app/shered/ionic-imports';
import { ToastController, ModalController, AlertController } from '@ionic/angular/standalone';
import { EquipmentPlanResponse } from 'src/app/models/equipment-plan.interface';
import { EquipmentPlansService } from 'src/app/services/equipment-plans.service';
import { EquipmentPlanModalComponent } from 'src/app/components/equipment-plan-modal/equipment-plan-modal.component';

@Component({
  selector: 'app-view-equipment',
  templateUrl: './view-equipment.page.html',
  styleUrls: ['./view-equipment.page.scss'],
  standalone: true,
  imports: [...IONIC_IMPORTS, CommonModule]
})
export class ViewEquipmentPage implements OnInit {

  equipment: Equipment | null = null;
  loading = false;
  equipmentId: string | null = null;
  equipmentPlans: EquipmentPlanResponse[] = [];
  loadingPlans = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private equipmentsService: EquipmentsService,
    private equipmentPlansService: EquipmentPlansService,
    private toastController: ToastController,
    private modalController: ModalController,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.equipmentId = this.route.snapshot.paramMap.get('id');
    if (this.equipmentId) {
      this.loadEquipment();
    } else {
      this.showToast('ID do equipamento não encontrado', 'danger');
      this.router.navigate(['/equipments']);
    }
  }

  loadEquipment() {
    if (!this.equipmentId) return;
    
    this.loading = true;
    
    this.equipmentsService.getEquipmentById(this.equipmentId)
      .subscribe({
        next: (equipment: Equipment) => {
          this.equipment = equipment;
          this.loading = false;
          this.loadEquipmentPlans();
        },
        error: (error) => {
          console.error('Erro ao carregar equipamento:', error);
          this.showToast('Erro ao carregar equipamento. Tente novamente.', 'danger');
          this.loading = false;
          this.router.navigate(['/equipments']);
        }
      });
  }

  displayClassification(classification: Equipment['classification'] | undefined) {
    if (!classification) return '-';
    const map: Record<string, string> = {
      COMPONENT: 'Componente',
      EQUIPMENT: 'Equipamento',
    };
    return map[classification] ?? classification;
  }

  displayCriticality(criticality: Equipment['criticality'] | undefined) {
    if (!criticality) return '-';
    const map: Record<string, string> = {
      HIGH: 'Alta',
      MEDIUM: 'Média',
      LOW: 'Baixa',
    };
    return map[criticality] ?? criticality;
  }

  displayEquipmentStatus(status: Equipment['equipmentStatus'] | undefined) {
    if (!status) return '-';
    const map: Record<string, string> = {
      ACTIVE: 'Ativo',
      INACTIVE: 'Inativo',
      UNDER_MAINTENANCE: 'Em Manutenção',
    };
    return map[status] ?? status;
  }

  getClassificationColor(classification: Equipment['classification'] | undefined): string {
    if (!classification) return 'medium';
    const colorMap: Record<string, string> = {
      COMPONENT: 'secondary',
      EQUIPMENT: 'primary',
    };
    return colorMap[classification] ?? 'medium';
  }

  getCriticalityColor(criticality: Equipment['criticality'] | undefined): string {
    if (!criticality) return 'medium';
    const colorMap: Record<string, string> = {
      HIGH: 'danger',
      MEDIUM: 'warning',
      LOW: 'success',
    };
    return colorMap[criticality] ?? 'medium';
  }

  getEquipmentStatusColor(status: Equipment['equipmentStatus'] | undefined): string {
    if (!status) return 'medium';
    const colorMap: Record<string, string> = {
      ACTIVE: 'success',
      INACTIVE: 'medium',
      UNDER_MAINTENANCE: 'warning',
    };
    return colorMap[status] ?? 'medium';
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return '-';
    }
  }

  formatCurrency(value: number | undefined): string {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  onEdit() {
    if (this.equipment?.id) {
      this.router.navigate(['/equipments/edit', this.equipment.id]);
    }
  }

  onBack() {
    this.router.navigate(['/equipments']);
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'top'
    });
    await toast.present();
  }

  loadEquipmentPlans() {
    if (!this.equipmentId) return;
    
    this.loadingPlans = true;
    
    this.equipmentPlansService.getEquipmentPlans(this.equipmentId)
      .subscribe({
        next: (plans: EquipmentPlanResponse[]) => {
          this.equipmentPlans = plans;
          this.loadingPlans = false;
        },
        error: (error) => {
          console.error('Erro ao carregar planos:', error);
          this.showToast('Erro ao carregar planos de manutenção.', 'danger');
          this.loadingPlans = false;
        }
      });
  }

  async onAddPlan() {
    if (!this.equipmentId) return;

    const modal = await this.modalController.create({
      component: EquipmentPlanModalComponent,
      componentProps: {
        equipmentId: this.equipmentId
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.success) {
      this.showToast('Plano de manutenção associado com sucesso!', 'success');
      this.loadEquipmentPlans();
    }
  }

  async onRemovePlan(planId: string) {
    if (!this.equipmentId) return;

    const alert = await this.alertController.create({
      header: 'Confirmar Remoção',
      message: 'Tem certeza que deseja remover este plano de manutenção do equipamento?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Remover',
          role: 'destructive',
          handler: () => {
            this.removePlan(planId);
          }
        }
      ]
    });

    await alert.present();
  }

  private removePlan(planId: string) {
    if (!this.equipmentId) return;

    this.equipmentPlansService.removePlanFromEquipment(this.equipmentId, planId)
      .subscribe({
        next: () => {
          this.showToast('Plano de manutenção removido com sucesso!', 'success');
          this.loadEquipmentPlans();
        },
        error: (error) => {
          console.error('Erro ao remover plano:', error);
          this.showToast('Erro ao remover plano de manutenção.', 'danger');
        }
      });
  }

  onToggleRealized(plan: EquipmentPlanResponse) {
    if (!this.equipmentId) return;

    const updateRequest = { realized: !plan.realized };

    this.equipmentPlansService.updateRealized(this.equipmentId, plan.planId, updateRequest)
      .subscribe({
        next: (updatedPlan) => {
          const index = this.equipmentPlans.findIndex(p => p.planId === plan.planId);
          if (index !== -1) {
            this.equipmentPlans[index] = updatedPlan;
          }
          this.showToast(
            updatedPlan.realized ? 'Plano marcado como realizado!' : 'Plano marcado como não realizado!', 
            'success'
          );
        },
        error: (error) => {
          console.error('Erro ao atualizar status:', error);
          this.showToast('Erro ao atualizar status do plano.', 'danger');
        }
      });
  }
}
