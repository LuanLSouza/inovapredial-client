import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular/standalone';
import { IONIC_IMPORTS } from 'src/app/shered/ionic-imports';
import { EquipmentPlanRequest } from 'src/app/models/equipment-plan.interface';
import { MaintenancePlan, MaintenancePlanRequest } from 'src/app/models/maintenance-plan.interface';
import { MaintenancePlansService } from 'src/app/services/maintenance-plans.service';
import { EquipmentPlansService } from 'src/app/services/equipment-plans.service';

@Component({
  selector: 'app-equipment-plan-modal',
  templateUrl: './equipment-plan-modal.component.html',
  styleUrls: ['./equipment-plan-modal.component.scss'],
  standalone: true,
  imports: [...IONIC_IMPORTS, CommonModule, ReactiveFormsModule, FormsModule]
})
export class EquipmentPlanModalComponent implements OnInit {
  @Input() equipmentId!: string;

  form!: FormGroup;
  maintenancePlans: MaintenancePlan[] = [];
  loadingPlans = false;
  saving = false;
  createNewPlan = false;

  maintenanceTypeOptions = [
    { label: 'Corretiva', value: 'CORRECTIVE' },
    { label: 'Preventiva', value: 'PREVENTIVE' },
    { label: 'Preditiva', value: 'PREDICTIVE' }
  ];

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController,
    private maintenancePlansService: MaintenancePlansService,
    private equipmentPlansService: EquipmentPlansService
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.loadMaintenancePlans();
  }

  get f() { return this.form.controls as any; }

  private initializeForm() {
    this.form = this.fb.group({
      // Campos para plano existente
      planId: ['', [Validators.required]],
      startDate: ['', [Validators.required]],
      
      // Campos para novo plano
      description: [''],
      maintenanceType: ['PREVENTIVE'],
      frequencyDays: [30, [Validators.required, Validators.min(1)]],
      requiresShutdown: [false]
    });
  }

  private loadMaintenancePlans() {
    this.loadingPlans = true;
    this.maintenancePlansService.getMaintenancePlans({
      page: 0,
      size: 1000,
      sortBy: 'description',
      sortDirection: 'ASC'
    }, {}).subscribe({
      next: (response) => {
        this.maintenancePlans = response.content;
        this.loadingPlans = false;
      },
      error: () => {
        this.loadingPlans = false;
      }
    });
  }

  toggleCreateNewPlan() {
    this.createNewPlan = !this.createNewPlan;
    
    if (this.createNewPlan) {
      this.f.planId.clearValidators();
      this.f.planId.setValue(''); // Limpa o valor
      this.f.description.setValidators([Validators.required]);
      this.f.maintenanceType.setValidators([Validators.required]);
      this.f.frequencyDays.setValidators([Validators.required, Validators.min(1)]);
    } else {
      this.f.planId.setValidators([Validators.required]);
      this.f.description.clearValidators();
      this.f.description.setValue('');
      this.f.maintenanceType.clearValidators();
      this.f.frequencyDays.clearValidators();
    }
    
    this.f.planId.updateValueAndValidity();
    this.f.description.updateValueAndValidity();
    this.f.maintenanceType.updateValueAndValidity();
    this.f.frequencyDays.updateValueAndValidity();
  }

  formatDateForInput(dateString: string | undefined): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const formValue = this.form.value;

    if (this.createNewPlan) {
      this.createAndAssociatePlan(formValue);
    } else {
      this.associateExistingPlan(formValue);
    }
  }

  private createAndAssociatePlan(formValue: any) {
    const maintenancePlanRequest: MaintenancePlanRequest = {
      description: formValue.description,
      maintenanceType: formValue.maintenanceType,
      frequencyDays: formValue.frequencyDays,
      requiresShutdown: formValue.requiresShutdown
    };

    this.maintenancePlansService.createMaintenancePlan(maintenancePlanRequest)
      .subscribe({
        next: (newPlan) => {
          const equipmentPlanRequest: EquipmentPlanRequest = {
            equipmentId: this.equipmentId,
            planId: newPlan.id,
            startDate: formValue.startDate
          };

          this.equipmentPlansService.addPlanToEquipment(equipmentPlanRequest)
            .subscribe({
              next: () => {
                this.modalController.dismiss({ success: true });
              },
              error: (error) => {
                console.error('Erro ao associar plano:', error);
                this.saving = false;
              }
            });
        },
        error: (error) => {
          console.error('Erro ao criar plano:', error);
          this.saving = false;
        }
      });
  }

  private associateExistingPlan(formValue: any) {
    const equipmentPlanRequest: EquipmentPlanRequest = {
      equipmentId: this.equipmentId,
      planId: formValue.planId,
      startDate: formValue.startDate
    };

    this.equipmentPlansService.addPlanToEquipment(equipmentPlanRequest)
      .subscribe({
        next: () => {
          this.modalController.dismiss({ success: true });
        },
        error: (error) => {
          console.error('Erro ao associar plano:', error);
          this.saving = false;
        }
      });
  }

  cancel() {
    this.modalController.dismiss();
  }
}
