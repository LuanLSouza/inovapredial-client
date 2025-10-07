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
import { ToastController, ModalController, AlertController } from '@ionic/angular/standalone';
import { TasksService } from 'src/app/services/tasks.service';
import { TaskActivityStatus, TaskResponse, TaskRequest } from 'src/app/models/task.interface';
import { TaskModalComponent } from 'src/app/components/task-modal/task-modal.component';
import { TaskViewModalComponent } from 'src/app/components/task-view-modal/task-view-modal.component';
import { TaskEditModalComponent } from 'src/app/components/task-edit-modal/task-edit-modal.component';

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

  // Tasks tab state
  tasks: TaskResponse[] = [];
  loadingTasks = false;
  activeTab: 'details' | 'tasks' = 'details';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workOrdersService: WorkOrdersService,
    private equipmentsService: EquipmentsService,
    private employeesService: EmployeesService,
    private toastController: ToastController,
    private tasksService: TasksService,
    private modalController: ModalController,
    private alertController: AlertController
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

  onTabChange(tab: string | number | undefined) {
    const nextTab: 'details' | 'tasks' = tab === 'tasks' ? 'tasks' : 'details';
    this.activeTab = nextTab;
    if (nextTab === 'tasks') {
      this.loadTasks();
    }
  }

  private loadTasks() {
    if (!this.workOrderId) return;
    this.loadingTasks = true;
    this.tasksService.search({ page: '0', size: '100', sortBy: 'startDate', sortDirection: 'DESC' }, { workOrderId: this.workOrderId }).subscribe({
      next: (res) => {
        this.tasks = res.content;
        this.loadingTasks = false;
      },
      error: () => {
        this.loadingTasks = false;
      }
    });
  }

  async openStatusChangeModal(task: TaskResponse) {
    const alert = await this.alertController.create({
      header: 'Alterar Status da Tarefa',
      message: `Tarefa: ${task.title} | Status atual: ${this.getTaskStatusLabel(task.activityStatus)}`,
      inputs: [
        {
          name: 'status',
          type: 'radio',
          label: 'Em Progresso',
          value: 'IN_PROGRESS',
          checked: task.activityStatus === 'IN_PROGRESS'
        },
        {
          name: 'status',
          type: 'radio',
          label: 'Concluída',
          value: 'COMPLETED',
          checked: task.activityStatus === 'COMPLETED'
        },
        {
          name: 'status',
          type: 'radio',
          label: 'Cancelada',
          value: 'CANCELLED',
          checked: task.activityStatus === 'CANCELLED'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: (data) => {
            if (data && data !== task.activityStatus) {
              this.confirmStatusChange(task, data);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  private async confirmStatusChange(task: TaskResponse, newStatus: TaskActivityStatus) {
    const confirmAlert = await this.alertController.create({
      header: 'Confirmar Alteração',
      message: `Tem certeza que deseja alterar o status de "${task.title}" de ${this.getTaskStatusLabel(task.activityStatus)} para ${this.getTaskStatusLabel(newStatus)}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Sim, Alterar',
          handler: async () => {
            const reason = await this.promptStatusReason(task, newStatus);
            if (!reason) {
              this.presentToast('Motivo é obrigatório para alterar o status.', 'warning');
              return;
            }
            this.updateTaskStatus(task, newStatus, reason);
          }
        }
      ]
    });

    await confirmAlert.present();
  }

  private async promptStatusReason(task: TaskResponse, newStatus: TaskActivityStatus): Promise<string | null> {
    const alert = await this.alertController.create({
      header: 'Informe o motivo',
      message: `Descreva o motivo para alterar para ${this.getTaskStatusLabel(newStatus)}:`,
      inputs: [
        {
          name: 'reason',
          type: 'textarea',
          placeholder: 'Motivo da alteração',
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Confirmar', role: 'confirm' }
      ]
    });

    await alert.present();
    const { data, role } = await alert.onDidDismiss();
    if (role !== 'confirm') return null;
    const reason = (data?.values?.reason ?? '').trim();
    return reason.length > 0 ? reason : null;
  }

  updateTaskStatus(task: TaskResponse, status: TaskActivityStatus, reason: string) {
    this.tasksService.updateStatus(task.id, status, reason).subscribe({
      next: (updated) => {
        const idx = this.tasks.findIndex(t => t.id === updated.id);
        if (idx >= 0) this.tasks[idx] = updated;
        this.presentToast('Status da tarefa atualizado.');
      },
      error: () => this.presentToast('Falha ao atualizar status da tarefa.', 'danger')
    });
  }

  async openCreateTaskModal() {
    if (!this.workOrderId) return;
    
    const modal = await this.modalController.create({
      component: TaskModalComponent,
      componentProps: {
        workOrderId: this.workOrderId
      }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data && data.tasks) {
      this.createTasks(data.tasks);
    }
  }

  private createTasks(tasks: TaskRequest[]) {
    this.tasksService.createBatch(tasks).subscribe({
      next: () => {
        this.presentToast('Tarefa(s) criada(s) com sucesso.');
        this.loadTasks();
      },
      error: () => this.presentToast('Falha ao criar tarefa(s).', 'danger')
    });
  }

  async viewTask(task: TaskResponse) {
    const modal = await this.modalController.create({
      component: TaskViewModalComponent,
      componentProps: {
        task: task
      }
    });

    await modal.present();
  }

  async editTask(task: TaskResponse) {
    const modal = await this.modalController.create({
      component: TaskEditModalComponent,
      componentProps: {
        task: task
      }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data && data.task) {
      this.updateTask(task.id, data.task);
    }
  }

  private updateTask(taskId: string, taskRequest: TaskRequest) {
    this.tasksService.update(taskId, taskRequest).subscribe({
      next: () => {
        this.presentToast('Tarefa atualizada com sucesso.');
        this.loadTasks();
      },
      error: () => this.presentToast('Falha ao atualizar tarefa.', 'danger')
    });
  }

  async deleteTask(task: TaskResponse) {
    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir a tarefa "${task.title}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            this.tasksService.delete(task.id).subscribe({
              next: () => {
                this.presentToast('Tarefa excluída com sucesso.');
                this.loadTasks();
              },
              error: () => this.presentToast('Falha ao excluir tarefa.', 'danger')
            });
          }
        }
      ]
    });

    await alert.present();
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

  private presentToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    // Compatibilidade com chamadas existentes
    this.showToast(message, color);
  }

  getTaskStatusLabel(status: TaskActivityStatus): string {
    const map: Record<TaskActivityStatus, string> = {
      OPEN: 'Aberta',
      IN_PROGRESS: 'Em Progresso',
      COMPLETED: 'Concluída',
      CANCELLED: 'Cancelada'
    };
    return map[status] || status;
  }

  getTaskStatusColor(status: TaskActivityStatus): string {
    const colorMap: Record<TaskActivityStatus, string> = {
      OPEN: 'warning',
      IN_PROGRESS: 'primary',
      COMPLETED: 'success',
      CANCELLED: 'danger'
    };
    return colorMap[status] || 'medium';
  }

}
