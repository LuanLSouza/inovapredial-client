// Interfaces baseadas na especificação OpenAPI da API de Métricas

export interface MetricFilterDTO {
  buildingId?: string;
  startDate?: string;
  endDate?: string;
  equipmentId?: string;
  employeeId?: string;
  maintenanceType?: 'CORRECTIVE' | 'PREVENTIVE' | 'PREDICTIVE';
}

export interface MaintenanceTypeMetricsDTO {
  count: number;
  totalCost: number;
  averageCost: number;
  percentageOfTotal: number;
}

export interface WorkOrderMetricsDTO {
  totalWorkOrders: number;
  completedWorkOrders: number;
  cancelledWorkOrders: number;
  inProgressWorkOrders: number;
  totalCost: number;
  averageCompletionTimeHours: number;
  completionRate: number;
  preventive: MaintenanceTypeMetricsDTO;
  corrective: MaintenanceTypeMetricsDTO;
  predictive: MaintenanceTypeMetricsDTO;
}

export interface MonthlyCostDTO {
  year: number;
  month: number;
  totalCost: number;
  workOrderCount: number;
  taskCount: number;
}

export interface MonthlyTaskDTO {
  year: number;
  month: number;
  totalCount: number;
  completedCount: number;
  totalCost: number;
}

export interface MonthlyWorkOrderDTO {
  year: number;
  month: number;
  totalCount: number;
  completedCount: number;
  cancelledCount: number;
  inProgressCount: number;
}

export interface TimeSeriesMetricsDTO {
  monthlyCosts: MonthlyCostDTO[];
  monthlyWorkOrders: MonthlyWorkOrderDTO[];
  monthlyTasks: MonthlyTaskDTO[];
}

export interface TopUsedItemDTO {
  itemId: string;
  itemName: string;
  itemType: string;
  totalQuantityUsed: number;
  totalCost: number;
  currentStock: number;
}

export interface LowStockAlertDTO {
  itemId: string;
  itemName: string;
  itemType: string;
  currentQuantity: number;
  minimumQuantity: number;
  unitCost: number;
}

export interface InventoryMetricsDTO {
  totalMaterialCost: number;
  totalItemsUsed: number;
  topUsedItems: TopUsedItemDTO[];
  lowStockAlerts: LowStockAlertDTO[];
}

export interface GeneralMetricsDTO {
  totalCost: number;
  totalWorkOrders: number;
  totalTasks: number;
  activeEquipments: number;
  totalEquipments: number;
  averageCostPerWorkOrder: number;
  averageCostPerTask: number;
}

export interface EquipmentMTBFDTO {
  equipmentId: string;
  equipmentName: string;
  equipmentIdentification: string;
  failureCount: number;
  averageDaysBetweenFailures: number;
  lastFailureDate: string;
  criticality: string;
}

export interface EquipmentStatusDistributionDTO {
  active: number;
  inactive: number;
  maintenance: number;
  outOfService: number;
}

export interface EquipmentMetricsDTO {
  totalEquipments: number;
  activeEquipments: number;
  inactiveEquipments: number;
  criticalEquipments: number;
  equipmentMTBF: EquipmentMTBFDTO[];
  statusDistribution: EquipmentStatusDistributionDTO;
}

export interface MetricResponseDTO {
  generalMetrics: GeneralMetricsDTO;
  workOrderMetrics: WorkOrderMetricsDTO;
  equipmentMetrics: EquipmentMetricsDTO;
  timeSeriesMetrics: TimeSeriesMetricsDTO;
  inventoryMetrics: InventoryMetricsDTO;
}

