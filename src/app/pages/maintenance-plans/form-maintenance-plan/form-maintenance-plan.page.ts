import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { MaintenancePlansService } from 'src/app/services/maintenance-plans.service';
import { IONIC_IMPORTS } from 'src/app/shered/ionic-imports';
import { MaintenancePlan, MaintenancePlanRequest } from 'src/app/models/maintenance-plan.interface';

@Component({
  selector: 'app-form-maintenance-plan',
  templateUrl: './form-maintenance-plan.page.html',
  styleUrls: ['./form-maintenance-plan.page.scss'],
  standalone: true,
  imports: [...IONIC_IMPORTS, CommonModule, ReactiveFormsModule]
})
export class FormMaintenancePlanPage implements OnInit {
  form!: FormGroup;
  saving = false;
  loading = false;
  
  isEditMode = false;
  maintenancePlanId: string | null = null;
  pageTitle = 'Novo Plano de Manutenção';

  maintenanceTypeOptions = [
    { label: 'Corretiva', value: 'CORRECTIVE' },
    { label: 'Preventiva', value: 'PREVENTIVE' },
    { label: 'Preditiva', value: 'PREDICTIVE' },
  ];
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private maintenancePlansService: MaintenancePlansService,
    private alertController: AlertController
  ) { 
    this.initializeForm();
  }

  ngOnInit() {
    // Verifica se há um ID na rota (modo edição)
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.maintenancePlanId = params['id'];
        this.isEditMode = true;
        this.pageTitle = 'Editar Plano de Manutenção';
        this.loadMaintenancePlan();
      }
    });
  }

  get f() { return this.form.controls as any; }

  async cancel() {
    if (this.hasFormData()) {
      const alert = await this.alertController.create({
        header: 'Confirmar Cancelamento',
        message: 'Você tem certeza que deseja cancelar? Todos os dados preenchidos serão perdidos.',
        buttons: [
          {
            text: 'Continuar Editando',
            role: 'cancel',
            handler: () => {
              // Não faz nada, mantém na página
            }
          },
          {
            text: 'Sim, Cancelar',
            role: 'destructive',
            handler: () => {
              this.router.navigate(['/maintenance-plans']);
            }
          }
        ]
      });
      
      await alert.present();
    } else {
      // Se não há dados, cancela diretamente
      this.router.navigate(['/maintenance-plans']);
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    const payload: MaintenancePlanRequest = this.form.value;
    this.saving = true;
    
    if (this.isEditMode && this.maintenancePlanId) {
      // Modo edição
      this.maintenancePlansService.updateMaintenancePlan(this.maintenancePlanId, payload).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/maintenance-plans']);
        },
        error: () => {
          this.saving = false;
        }
      });
    } else {
      // Modo criação
      this.maintenancePlansService.createMaintenancePlan(payload).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/maintenance-plans']);
        },
        error: () => {
          this.saving = false;
        }
      });
    }
  }

  private hasFormData(): boolean {
    const formValue = this.form.value;
    
    // Verifica campos principais
    if (formValue.description?.trim()) return true;
    if (formValue.frequencyDays) return true;
    if (formValue.maintenanceType) return true;
    if (formValue.requiresShutdown !== undefined) return true;
    
    return false;
  }

  private initializeForm() {
    this.form = this.fb.group({
      description: [''],
      frequencyDays: [null, [Validators.required, Validators.min(1)]],
      maintenanceType: ['PREVENTIVE', [Validators.required]],
      requiresShutdown: [false, [Validators.required]]
    });
  }

  private loadMaintenancePlan() {
    if (!this.maintenancePlanId) return;
    
    this.loading = true;
    this.maintenancePlansService.getMaintenancePlanById(this.maintenancePlanId).subscribe({
      next: (maintenancePlan: MaintenancePlan) => {
        this.populateForm(maintenancePlan);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        // Redireciona para a lista se não conseguir carregar
        this.router.navigate(['/maintenance-plans']);
      }
    });
  }

  private populateForm(maintenancePlan: MaintenancePlan) {
    this.form.patchValue({
      description: maintenancePlan.description || '',
      frequencyDays: maintenancePlan.frequencyDays,
      maintenanceType: maintenancePlan.maintenanceType,
      requiresShutdown: maintenancePlan.requiresShutdown
    });
  }
}
