import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { WorkOrdersService } from 'src/app/services/work-orders.service';
import { EquipmentsService } from 'src/app/services/equipments.service';
import { EmployeesService } from 'src/app/services/employees.service';
import { IONIC_IMPORTS } from 'src/app/shered/ionic-imports';
import { WorkOrder, WorkOrderRequest } from 'src/app/models/work-order.interface';
import { Equipment } from 'src/app/models/equipment.interface';
import { Employee } from 'src/app/models/employee.interface';

@Component({
  selector: 'app-form-work-order',
  templateUrl: './form-work-order.page.html',
  styleUrls: ['./form-work-order.page.scss'],
  standalone: true,
  imports: [...IONIC_IMPORTS, CommonModule, ReactiveFormsModule]
})
export class FormWorkOrderPage implements OnInit {
  form!: FormGroup;
  saving = false;
  loading = false;
  
  isEditMode = false;
  workOrderId: string | null = null;
  pageTitle = 'Nova Ordem de Serviço';

  equipments: Equipment[] = [];
  employees: Employee[] = [];
  loadingEquipments = false;
  loadingEmployees = false;

  maintenanceTypeOptions = [
    { label: 'Corretiva', value: 'CORRECTIVE' },
    { label: 'Preventiva', value: 'PREVENTIVE' },
    { label: 'Preditiva', value: 'PREDICTIVE' },
  ];

  priorityOptions = [
    { label: 'Baixa', value: 'LOW' },
    { label: 'Média', value: 'MEDIUM' },
    { label: 'Alta', value: 'HIGH' },
    { label: 'Urgente', value: 'URGENT' },
  ];

  activityStatusOptions = [
    { label: 'Aberta', value: 'OPEN' },
    { label: 'Em Progresso', value: 'IN_PROGRESS' },
    { label: 'Concluída', value: 'COMPLETED' },
    { label: 'Cancelada', value: 'CANCELLED' },
  ];
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private workOrdersService: WorkOrdersService,
    private equipmentsService: EquipmentsService,
    private employeesService: EmployeesService,
    private alertController: AlertController,
    private toastController: ToastController
  ) { 
    this.initializeForm();
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.workOrderId = params['id'];
        this.isEditMode = true;
        this.pageTitle = 'Editar Ordem de Serviço';
        this.loadEquipmentsAndThenWorkOrder();
      } else {
        this.loadEquipments();
        this.loadEmployees();
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
            }
          },
          {
            text: 'Sim, Cancelar',
            role: 'destructive',
            handler: () => {
              this.router.navigate(['/work-orders']);
            }
          }
        ]
      });
      
      await alert.present();
    } else {
      this.router.navigate(['/work-orders']);
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    const formValue = this.form.value;
    let payload: WorkOrderRequest = {
      description: formValue.description,
      maintenanceType: formValue.maintenanceType,
      priority: formValue.priority || null,
      activityStatus: formValue.activityStatus || null,
      totalCost: formValue.totalCost || null,
      openingDate: formValue.openingDate || null,
      closingDate: formValue.closingDate || null,
      equipmentId: formValue.equipmentId,
      employeeId: formValue.employeeId || null
    };

    if (!this.isEditMode) {
      const { activityStatus, closingDate, ...rest } = payload as any;
      payload = rest as WorkOrderRequest;
    }
    this.saving = true;
    
    if (this.isEditMode && this.workOrderId) {
      this.workOrdersService.updateWorkOrder(this.workOrderId, payload).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/work-orders']);
        },
        error: (error) => {
          this.showToast('Erro ao atualizar ordem de serviço: ' + error.error.message, 'danger');
          this.saving = false;
        }
      });
    } else {
      this.workOrdersService.createWorkOrder(payload).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/work-orders']);
        },
        error: (error) => {
          this.showToast('Erro ao criar ordem de serviço: ' + error.error.message, 'danger');
          this.saving = false;
        }
      });
    }
  }

  private hasFormData(): boolean {
    const formValue = this.form.value;
    
    if (formValue.description?.trim()) return true;
    if (formValue.maintenanceType) return true;
    if (formValue.priority) return true;
    if (formValue.activityStatus) return true;
    if (formValue.equipmentId) return true;
    if (formValue.employeeId) return true;
    if (formValue.totalCost) return true;
    if (formValue.openingDate) return true;
    if (formValue.closingDate) return true;
    
    return false;
  }

  private initializeForm() {
    this.form = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(1)]],
      maintenanceType: ['', [Validators.required]],
      priority: [''],
      activityStatus: [null],
      totalCost: [null, [Validators.min(0)]],
      openingDate: [''],
      closingDate: [''],
      equipmentId: ['', [Validators.required]],
      employeeId: ['']
    });
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

  private loadWorkOrder() {
    if (!this.workOrderId) return;
    
    this.loading = true;
    this.workOrdersService.getWorkOrderById(this.workOrderId).subscribe({
      next: (workOrder: WorkOrder) => {
        this.populateForm(workOrder);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/work-orders']);
      }
    });
  }

  private populateForm(workOrder: WorkOrder) { 
    this.form.patchValue({
      description: workOrder.description,
      maintenanceType: workOrder.maintenanceType,
      priority: workOrder.priority || '',
      activityStatus: workOrder.activityStatus || '',
      totalCost: workOrder.totalCost || null,
      openingDate: this.formatDateForInput(workOrder.openingDate) || '',
      closingDate: this.formatDateForInput(workOrder.closingDate) || ''
    });
    
    setTimeout(() => {
      if (workOrder.equipmentId && this.equipments.length > 0) {
        const equipmentExists = this.equipments.some(eq => eq.id === workOrder.equipmentId);
        if (equipmentExists) {
          this.form.get('equipmentId')?.setValue(workOrder.equipmentId);
        } else {
        }
      }
      
      if (workOrder.employeeId && this.employees.length > 0) {
        const employeeExists = this.employees.some(emp => emp.id === workOrder.employeeId);
        if (employeeExists) {
          this.form.get('employeeId')?.setValue(workOrder.employeeId);
        } else {
        }
      }
      
    }, 100);
  }

  private formatDateForInput(dateString: string | undefined): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return '';
    }
  }

  private loadEquipments() {
    this.loadingEquipments = true;
      this.equipmentsService.getEquipments({
      page: 0,
      size: 1000,
      sortBy: 'identification',
      sortDirection: 'ASC'
    }, {
      equipmentStatus: 'ACTIVE'
    }).subscribe({
      next: (response) => {
        this.equipments = response.content;
        this.loadingEquipments = false;
      },
      error: () => {
        this.loadingEquipments = false;
      }
    });
  }

  private loadEquipmentsAndThenWorkOrder() {
    this.loadingEquipments = true;
    this.equipmentsService.getEquipments({
      page: 0,
      size: 1000,
      sortBy: 'identification',
      sortDirection: 'ASC'
    }, {

    }).subscribe({
      next: (response) => {
        this.equipments = response.content;
        this.loadingEquipments = false;
        this.loadEmployees();
        this.loadWorkOrder();
      },
      error: (error) => {
        this.loadingEquipments = false;
        this.loadEmployees();
        this.loadWorkOrder();
      }
    });
  }

  private loadEmployees() {
    this.loadingEmployees = true;
      this.employeesService.getEmployees({
      page: 0,
      size: 1000,
      sortBy: 'name',
      sortDirection: 'ASC'
    }, {}).subscribe({
      next: (response) => {
        this.employees = response.content;
        this.loadingEmployees = false;
      },
      error: () => {
        this.loadingEmployees = false;
      }
    });
  }
}
