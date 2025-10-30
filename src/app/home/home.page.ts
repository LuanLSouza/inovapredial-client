import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { OnInit } from '@angular/core';
import { BuildingsService } from '../services/buildings.service';
import { EquipmentsService } from '../services/equipments.service';
import { WorkOrdersService } from '../services/work-orders.service';
import { EmployeesService } from '../services/employees.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class HomePage implements OnInit {
  counts = {
    buildings: 0,
    equipments: 0,
    workOrders: 0,
    employees: 0,
  };

  isLoading = false;
  hasError = false;

  constructor(
    private router: Router, 
    private authService: AuthService,
    private alertController: AlertController,
    private buildingsService: BuildingsService,
    private equipmentsService: EquipmentsService,
    private workOrdersService: WorkOrdersService,
    private employeesService: EmployeesService,
  ) {}

  ngOnInit() {
    this.loadCounts();
  }

  private getTotal<T extends { totalElements: number }>(response: any): number {
    return typeof response?.totalElements === 'number' ? response.totalElements : 0;
  }

  private loadCounts() {
    this.isLoading = true;
    this.hasError = false;

    forkJoin({
      buildings: this.buildingsService.getBuildings({ page: 0, size: 1 }),
      equipments: this.equipmentsService.getEquipments({ page: 0, size: 1 }),
      workOrders: this.workOrdersService.getWorkOrders({ page: '0', size: '1' }),
      employees: this.employeesService.getEmployees({ page: 0, size: 1 }),
    }).subscribe({
      next: ({ buildings, equipments, workOrders, employees }) => {
        this.counts = {
          buildings: this.getTotal(buildings),
          equipments: this.getTotal(equipments),
          workOrders: this.getTotal(workOrders),
          employees: this.getTotal(employees),
        };
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar contadores da Home', err);
        this.hasError = true;
        this.isLoading = false;
      }
    });
  }


  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  onMenuItemClick(route: string) {
    this.navigateTo(route);
  }

  async onLogoutClick() {
    const alert = await this.alertController.create({
      header: 'Confirmar Logout',
      message: 'Tem certeza que deseja sair da aplicação?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            // Usuário cancelou o logout
          }
        },
        {
          text: 'Sair',
          role: 'confirm',
          handler: () => {
            this.performLogout();
          }
        }
      ]
    });

    await alert.present();
  }

  private performLogout() {
    // Fazer logout no serviço de autenticação (já limpa todos os dados)
    this.authService.logout();
    
    // Navegar para a página de login
    this.router.navigate(['/login']);
  }

  onBuildingDropdownClick() {
    // Implementar lógica do dropdown de edifícios
    console.log('Building dropdown clicked');
  }
}
