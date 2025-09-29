import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MaintenancePlansService } from 'src/app/services/maintenance-plans.service';
import { MaintenancePlan } from 'src/app/models/maintenance-plan.interface';
import { IONIC_IMPORTS } from 'src/app/shered/ionic-imports';
import { ToastController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-view-maintenance-plan',
  templateUrl: './view-maintenance-plan.page.html',
  styleUrls: ['./view-maintenance-plan.page.scss'],
  standalone: true,
  imports: [...IONIC_IMPORTS, CommonModule]
})
export class ViewMaintenancePlanPage implements OnInit {

  maintenancePlan: MaintenancePlan | null = null;
  loading = false;
  maintenancePlanId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private maintenancePlansService: MaintenancePlansService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.maintenancePlanId = this.route.snapshot.paramMap.get('id');
    if (this.maintenancePlanId) {
      this.loadMaintenancePlan();
    } else {
      this.showToast('ID do plano de manutenção não encontrado', 'danger');
      this.router.navigate(['/maintenance-plans']);
    }
  }

  loadMaintenancePlan() {
    if (!this.maintenancePlanId) return;
    
    this.loading = true;
    
    this.maintenancePlansService.getMaintenancePlanById(this.maintenancePlanId)
      .subscribe({
        next: (maintenancePlan: MaintenancePlan) => {
          this.maintenancePlan = maintenancePlan;
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar plano de manutenção:', error);
          this.showToast('Erro ao carregar plano de manutenção. Tente novamente.', 'danger');
          this.loading = false;
          this.router.navigate(['/maintenance-plans']);
        }
      });
  }

  displayMaintenanceType(maintenanceType: MaintenancePlan['maintenanceType'] | undefined) {
    if (!maintenanceType) return '-';
    const map: Record<string, string> = {
      CORRECTIVE: 'Corretiva',
      PREVENTIVE: 'Preventiva',
      PREDICTIVE: 'Preditiva',
    };
    return map[maintenanceType] ?? maintenanceType;
  }

  displayRequiresShutdown(requiresShutdown: boolean | undefined) {
    if (requiresShutdown === undefined) return '-';
    return requiresShutdown ? 'Sim' : 'Não';
  }

  getMaintenanceTypeColor(maintenanceType: MaintenancePlan['maintenanceType'] | undefined): string {
    if (!maintenanceType) return 'medium';
    const colorMap: Record<string, string> = {
      CORRECTIVE: 'danger',
      PREVENTIVE: 'warning',
      PREDICTIVE: 'success',
    };
    return colorMap[maintenanceType] ?? 'medium';
  }

  getRequiresShutdownColor(requiresShutdown: boolean | undefined): string {
    if (requiresShutdown === undefined) return 'medium';
    return requiresShutdown ? 'danger' : 'success';
  }

  onEdit() {
    if (this.maintenancePlan?.id) {
      this.router.navigate(['/maintenance-plans/edit', this.maintenancePlan.id]);
    }
  }

  onBack() {
    this.router.navigate(['/maintenance-plans']);
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

}
