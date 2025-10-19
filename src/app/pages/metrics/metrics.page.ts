import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MetricsService } from 'src/app/services/metrics.service';
import { EquipmentsService } from 'src/app/services/equipments.service';
import { EmployeesService } from 'src/app/services/employees.service';
import { SelectedBuildingService } from 'src/app/services/selected-building.service';
import { IONIC_IMPORTS } from 'src/app/shered/ionic-imports';
import { 
  MetricFilterDTO, 
  MetricResponseDTO,
  GeneralMetricsDTO,
  WorkOrderMetricsDTO,
  EquipmentMetricsDTO,
  TimeSeriesMetricsDTO,
  InventoryMetricsDTO
} from 'src/app/models/metrics.interface';
import { Equipment } from 'src/app/models/equipment.interface';
import { Employee } from 'src/app/models/employee.interface';
import { ChartConfiguration, ChartData, ChartType, registerables } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ModalController } from '@ionic/angular/standalone';
import { BuildingSelectionModalComponent } from 'src/app/components/building-selection-modal/building-selection-modal.component';

// Registrar todos os controladores e escalas do Chart.js
import Chart from 'chart.js/auto';
Chart.register(...registerables);

@Component({
  selector: 'app-metrics',
  templateUrl: './metrics.page.html',
  styleUrls: ['./metrics.page.scss'],
  standalone: true,
  imports: [...IONIC_IMPORTS, CommonModule, FormsModule, BaseChartDirective]
})
export class MetricsPage implements OnInit {
  
  // Estados de carregamento
  loading = false;
  loadingEquipments = false;
  loadingEmployees = false;
  noBuildingSelected = false;

  // Dados das métricas
  metricsData: MetricResponseDTO | null = null;
  generalMetrics: GeneralMetricsDTO | null = null;
  workOrderMetrics: WorkOrderMetricsDTO | null = null;
  equipmentMetrics: EquipmentMetricsDTO | null = null;
  timeSeriesMetrics: TimeSeriesMetricsDTO | null = null;
  inventoryMetrics: InventoryMetricsDTO | null = null;

  // Filtros
  filters: MetricFilterDTO = {};
  startDate: string = '';
  endDate: string = '';
  selectedEquipmentId: string = '';
  selectedEmployeeId: string = '';
  selectedMaintenanceType: string = '';

  // Dados para os selects
  equipments: Equipment[] = [];
  employees: Employee[] = [];

  // Opções para os selects
  maintenanceTypeOptions = [
    { label: 'Todos os tipos', value: '' },
    { label: 'Corretiva', value: 'CORRECTIVE' },
    { label: 'Preventiva', value: 'PREVENTIVE' },
    { label: 'Preditiva', value: 'PREDICTIVE' },
  ];

  // Configurações dos gráficos
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.label + ': ' + context.parsed + '%';
          }
        }
      }
    }
  };

  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: ['Preventiva', 'Corretiva', 'Preditiva'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#28a745', '#dc3545', '#ffc107'],
      borderWidth: 2
    }]
  };

  public pieChartType: ChartType = 'pie';

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      }
    }
  };

  public lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Custos Mensais',
        borderColor: '#007bff',
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        tension: 0.1
      }
    ]
  };

  public lineChartType: ChartType = 'line';

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      }
    }
  };

  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Ordens de Serviço',
        backgroundColor: '#17a2b8',
        borderColor: '#17a2b8',
        borderWidth: 1
      }
    ]
  };

  public barChartType: ChartType = 'bar';

  constructor(
    private metricsService: MetricsService,
    private equipmentsService: EquipmentsService,
    private employeesService: EmployeesService,
    private selectedBuildingService: SelectedBuildingService,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    // Definir valores padrão para as datas
    this.setDefaultDates();
    
    // Verificar se há uma edificação selecionada
    if (!this.selectedBuildingService.getSelectedBuilding()) {
      this.noBuildingSelected = true;
      this.showBuildingSelectionModal();
    } else {
      this.loadEquipments();
      this.loadEmployees();
      this.loadMetrics();
    }
  }

  loadMetrics() {
    this.loading = true;
    
    // Preparar filtros
    this.prepareFilters();
    
    this.metricsService.getCompleteMetrics(this.filters).subscribe({
      next: (data: MetricResponseDTO) => {
        this.metricsData = data;
        this.generalMetrics = data.generalMetrics;
        this.workOrderMetrics = data.workOrderMetrics;
        this.equipmentMetrics = data.equipmentMetrics;
        this.timeSeriesMetrics = data.timeSeriesMetrics;
        this.inventoryMetrics = data.inventoryMetrics;
        
        // Debug: Log dos dados de equipamentos MTBF
        console.log('Equipment MTBF Data:', this.equipmentMetrics?.equipmentMTBF);
        if (this.equipmentMetrics?.equipmentMTBF) {
          this.equipmentMetrics.equipmentMTBF.forEach((equipment, index) => {
            console.log(`Equipment ${index}:`, {
              name: equipment.equipmentName,
              lastFailureDate: equipment.lastFailureDate,
              criticality: equipment.criticality
            });
          });
        }
        
        this.updateCharts();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar métricas:', error);
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.loadMetrics();
  }

  clearFilters() {
    this.startDate = '';
    this.endDate = '';
    this.selectedEquipmentId = '';
    this.selectedEmployeeId = '';
    this.selectedMaintenanceType = '';
    this.filters = {};
    this.loadMetrics();
  }

  private prepareFilters() {
    this.filters = {};
    
    if (this.startDate) {
      this.filters.startDate = this.convertDateToISO(this.startDate);
    }
    if (this.endDate) {
      this.filters.endDate = this.convertDateToISO(this.endDate);
    }
    if (this.selectedEquipmentId) {
      this.filters.equipmentId = this.selectedEquipmentId;
    }
    if (this.selectedEmployeeId) {
      this.filters.employeeId = this.selectedEmployeeId;
    }
    if (this.selectedMaintenanceType) {
      this.filters.maintenanceType = this.selectedMaintenanceType as any;
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

  private updateCharts() {
    if (!this.workOrderMetrics) return;

    // Atualizar gráfico de pizza (tipos de manutenção)
    this.pieChartData = {
      labels: ['Preventiva', 'Corretiva', 'Preditiva'],
      datasets: [{
        data: [
          this.workOrderMetrics?.preventive?.percentageOfTotal || 0,
          this.workOrderMetrics?.corrective?.percentageOfTotal || 0,
          this.workOrderMetrics?.predictive?.percentageOfTotal || 0
        ],
        backgroundColor: ['#28a745', '#dc3545', '#ffc107'],
        borderWidth: 2
      }]
    };

    // Atualizar gráfico de linha (custos mensais)
    if (this.timeSeriesMetrics?.monthlyCosts) {
      const monthlyCosts = this.timeSeriesMetrics.monthlyCosts;
      this.lineChartData = {
        labels: monthlyCosts.map(cost => `${cost.month}/${cost.year}`),
        datasets: [
          {
            data: monthlyCosts.map(cost => cost.totalCost),
            label: 'Custos Mensais',
            borderColor: '#007bff',
            backgroundColor: 'rgba(0, 123, 255, 0.1)',
            tension: 0.1
          }
        ]
      };
    }

    // Atualizar gráfico de barras (ordens de serviço mensais)
    if (this.timeSeriesMetrics?.monthlyWorkOrders) {
      const monthlyWorkOrders = this.timeSeriesMetrics.monthlyWorkOrders;
      this.barChartData = {
        labels: monthlyWorkOrders.map(wo => `${wo.month}/${wo.year}`),
        datasets: [
          {
            data: monthlyWorkOrders.map(wo => wo.totalCount),
            label: 'Ordens de Serviço',
            backgroundColor: '#17a2b8',
            borderColor: '#17a2b8',
            borderWidth: 1
          }
        ]
      };
    }
  }

  // Métodos auxiliares para formatação
  formatCurrency(value: number | null | undefined): string {
    if (value === null || value === undefined || isNaN(value)) {
      return 'R$ 0,00';
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatPercentage(value: number | null | undefined): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '0,0%';
    }
    return `${value.toFixed(1)}%`;
  }

  formatHours(value: number | null | undefined): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '0,0h';
    }
    return `${value.toFixed(1)}h`;
  }

  getMaintenanceTypeLabel(type: string): string {
    const map: Record<string, string> = {
      'CORRECTIVE': 'Corretiva',
      'PREVENTIVE': 'Preventiva',
      'PREDICTIVE': 'Preditiva'
    };
    return map[type] || type;
  }

  getCriticalityColor(criticality: string): string {
    if (!criticality) return 'medium';
    
    const colorMap: Record<string, string> = {
      'LOW': 'success',
      'MEDIUM': 'warning',
      'HIGH': 'danger',
      'CRITICAL': 'danger'
    };
    return colorMap[criticality.toUpperCase()] || 'medium';
  }

  getCriticalityLabel(criticality: string): string {
    if (!criticality) return 'N/A';
    
    const labelMap: Record<string, string> = {
      'LOW': 'Baixa',
      'MEDIUM': 'Média',
      'HIGH': 'Alta',
      'CRITICAL': 'Crítica'
    };
    return labelMap[criticality.toUpperCase()] || criticality;
  }

  /**
   * Define valores padrão para as datas (início do mês até hoje)
   */
  private setDefaultDates() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Formatar data de início (primeiro dia do mês)
    this.startDate = this.formatDateForInput(firstDayOfMonth);
    
    // Formatar data de fim (hoje)
    this.endDate = this.formatDateForInput(now);
  }

  /**
   * Formata uma data para o formato DD/MM/YYYY
   */
  private formatDateForInput(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Converte data do formato DD/MM/YYYY para ISO string
   */
  private convertDateToISO(dateString: string): string {
    if (!dateString) return '';
    
    const [day, month, year] = dateString.split('/');
    if (!day || !month || !year) return '';
    
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toISOString();
  }

  /**
   * Formata automaticamente a data enquanto o usuário digita
   */
  formatDateInput(event: any, field: 'startDate' | 'endDate') {
    let value = event.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
    
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    }
    if (value.length >= 5) {
      value = value.substring(0, 5) + '/' + value.substring(5, 9);
    }
    
    if (field === 'startDate') {
      this.startDate = value;
    } else {
      this.endDate = value;
    }
    
    event.target.value = value;
  }

  /**
   * Valida se a data está no formato correto
   */
  isValidDate(dateString: string): boolean {
    if (!dateString || dateString.length !== 10) return false;
    
    const [day, month, year] = dateString.split('/');
    if (!day || !month || !year) return false;
    
    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    if (dayNum < 1 || dayNum > 31) return false;
    if (monthNum < 1 || monthNum > 12) return false;
    if (yearNum < 1900 || yearNum > 2100) return false;
    
    const date = new Date(yearNum, monthNum - 1, dayNum);
    return date.getDate() === dayNum && 
           date.getMonth() === monthNum - 1 && 
           date.getFullYear() === yearNum;
  }

  /**
   * Formata a data de última falha
   */
  formatLastFailureDate(lastFailureDate: string): string {
    if (!lastFailureDate) return 'N/A';
    
    try {
      // Tentar diferentes formatos de data
      let date: Date;
      
      // Se já está em formato ISO
      if (lastFailureDate.includes('T') || lastFailureDate.includes('Z')) {
        date = new Date(lastFailureDate);
      } else {
        // Tentar parsear como string simples
        date = new Date(lastFailureDate);
      }
      
      // Verificar se a data é válida
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      console.warn('Erro ao formatar data:', lastFailureDate, error);
      return 'Data inválida';
    }
  }

  /**
   * Mostra a modal de seleção de edificação
   */
  async showBuildingSelectionModal() {
    const modal = await this.modalController.create({
      component: BuildingSelectionModalComponent,
      presentingElement: await this.modalController.getTop()
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      // Edificação selecionada, carregar dados
      this.noBuildingSelected = false;
      this.loadEquipments();
      this.loadEmployees();
      this.loadMetrics();
    } else {
      // Modal fechada sem seleção, redirecionar para home
      window.location.href = '/home';
    }
  }
}
