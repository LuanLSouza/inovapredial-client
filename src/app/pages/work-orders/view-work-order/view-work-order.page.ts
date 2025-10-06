import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkOrdersService } from 'src/app/services/work-orders.service';
import { EquipmentsService } from 'src/app/services/equipments.service';
import { EmployeesService } from 'src/app/services/employees.service';
import { WorkOrder } from 'src/app/models/work-order.interface';
import { Equipment } from 'src/app/models/equipment.interface';
import { Employee } from 'src/app/models/employee.interface';
import { IONIC_IMPORTS } from 'src/app/shered/ionic-imports';
import { ToastController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-view-work-order',
  templateUrl: './view-work-order.page.html',
  styleUrls: ['./view-work-order.page.scss'],
  standalone: true,
  imports: [...IONIC_IMPORTS, CommonModule]
})
export class ViewWorkOrderPage implements OnInit {

  workOrder: WorkOrder | null = null;
  loading = false;
  workOrderId: string | null = null;
  equipmentName: string | null = null;
  employeeName: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workOrdersService: WorkOrdersService,
    private equipmentsService: EquipmentsService,
    private employeesService: EmployeesService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.workOrderId = this.route.snapshot.paramMap.get('id');
    if (this.workOrderId) {
      this.loadWorkOrder();
    } else {
      this.showToast('ID da ordem de serviço não encontrado', 'danger');
      this.router.navigate(['/work-orders']);
    }
  }

  loadWorkOrder() {
    if (!this.workOrderId) return;
    
    this.loading = true;
    
    this.workOrdersService.getWorkOrderById(this.workOrderId)
      .subscribe({
        next: (workOrder: WorkOrder) => {
          this.workOrder = workOrder;
          this.loadRelatedData(workOrder);
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar ordem de serviço:', error);
          this.showToast('Erro ao carregar ordem de serviço. Tente novamente.', 'danger');
          this.loading = false;
          this.router.navigate(['/work-orders']);
        }
      });
  }

  private loadRelatedData(workOrder: WorkOrder) {
    // Carrega dados do equipamento
    if (workOrder.equipmentId) {
      this.equipmentsService.getEquipmentById(workOrder.equipmentId).subscribe({
        next: (equipment: Equipment) => {
          this.equipmentName = equipment.identification;
        },
        error: () => {
          this.equipmentName = 'Equipamento não encontrado';
        }
      });
    }

    // Carrega dados do funcionário
    if (workOrder.employeeId) {
      this.employeesService.getEmployeeById(workOrder.employeeId).subscribe({
        next: (employee: Employee) => {
          this.employeeName = employee.name;
        },
        error: () => {
          this.employeeName = 'Funcionário não encontrado';
        }
      });
    }
  }

  displayMaintenanceType(type: WorkOrder['maintenanceType'] | undefined) {
    if (!type) return '-';
    const map: Record<string, string> = {
      CORRECTIVE: 'Corretiva',
      PREVENTIVE: 'Preventiva',
      PREDICTIVE: 'Preditiva'
    };
    return map[type] ?? type;
  }

  displayPriority(priority: WorkOrder['priority'] | undefined) {
    if (!priority) return '-';
    const map: Record<string, string> = {
      LOW: 'Baixa',
      MEDIUM: 'Média',
      HIGH: 'Alta',
      URGENT: 'Urgente'
    };
    return map[priority] ?? priority;
  }

  displayActivityStatus(status: WorkOrder['activityStatus'] | undefined) {
    if (!status) return '-';
    const map: Record<string, string> = {
      OPEN: 'Aberta',
      IN_PROGRESS: 'Em Progresso',
      COMPLETED: 'Concluída',
      CANCELLED: 'Cancelada'
    };
    return map[status] ?? status;
  }

  getMaintenanceTypeColor(type: WorkOrder['maintenanceType'] | undefined): string {
    if (!type) return 'medium';
    const colorMap: Record<string, string> = {
      CORRECTIVE: 'danger',
      PREVENTIVE: 'warning',
      PREDICTIVE: 'primary'
    };
    return colorMap[type] ?? 'medium';
  }

  getPriorityColor(priority: WorkOrder['priority'] | undefined): string {
    if (!priority) return 'medium';
    const colorMap: Record<string, string> = {
      LOW: 'success',
      MEDIUM: 'warning',
      HIGH: 'danger',
      URGENT: 'danger'
    };
    return colorMap[priority] ?? 'medium';
  }

  getActivityStatusColor(status: WorkOrder['activityStatus'] | undefined): string {
    if (!status) return 'medium';
    const colorMap: Record<string, string> = {
      OPEN: 'warning',
      IN_PROGRESS: 'primary',
      COMPLETED: 'success',
      CANCELLED: 'danger'
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
    if (this.workOrder?.id) {
      this.router.navigate(['/work-orders/edit', this.workOrder.id]);
    }
  }

  onBack() {
    this.router.navigate(['/work-orders']);
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
