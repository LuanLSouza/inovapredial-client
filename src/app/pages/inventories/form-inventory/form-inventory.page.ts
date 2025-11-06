import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { InventoriesService } from 'src/app/services/inventories.service';
import { EmployeesService } from 'src/app/services/employees.service';
import { IONIC_IMPORTS } from 'src/app/shered/ionic-imports';
import { Inventory, InventoryRequest } from 'src/app/models/inventory.interface';
import { Employee, EmployeeSearchParams } from 'src/app/models/employee.interface';
import { PaginatedResponse } from 'src/app/models/paginatedResponse';

@Component({
  selector: 'app-form-inventory',
  templateUrl: './form-inventory.page.html',
  styleUrls: ['./form-inventory.page.scss'],
  standalone: true,
  imports: [...IONIC_IMPORTS, CommonModule, ReactiveFormsModule]
})
export class FormInventoryPage implements OnInit {
  form!: FormGroup;
  saving = false;
  loading = false;
  
  isEditMode = false;
  inventoryId: string | null = null;
  pageTitle = 'Novo Item';

  itemTypeOptions = [
    { label: 'Material', value: 'MATERIAL' },
    { label: 'Peça', value: 'PART' },
  ];

  employees: Employee[] = [];
  employeeOptions: { label: string; value: string }[] = [];
  loadingEmployees = false;
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private inventoriesService: InventoriesService,
    private employeesService: EmployeesService,
    private alertController: AlertController
  ) { 
    this.initializeForm();
  }

  ngOnInit() {
    this.loadEmployees();
    
    // Verifica se há um ID na rota (modo edição)
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.inventoryId = params['id'];
        this.isEditMode = true;
        this.pageTitle = 'Editar Item';
        this.loadInventory();
      }
    });
  }

  get f() { return this.form.controls as any; }

  onEmployeeChange(event: any) {
    console.log('Employee selected:', event.detail.value);
    console.log('Form employeeId value:', this.form.get('employeeId')?.value);
  }

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
              this.router.navigate(['/inventories']);
            }
          }
        ]
      });
      
      await alert.present();
    } else {
      // Se não há dados, cancela diretamente
      this.router.navigate(['/inventories']);
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    const payload: InventoryRequest = this.form.value;
    console.log('Form value:', this.form.value);
    console.log('Payload:', payload);
    console.log('EmployeeId:', payload.employeeId);
    this.saving = true;
    
    if (this.isEditMode && this.inventoryId) {
      // Modo edição
      this.inventoriesService.updateInventory(this.inventoryId, payload).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/inventories']);
        },
        error: () => {
          this.saving = false;
        }
      });
    } else {
      // Modo criação
      this.inventoriesService.createInventory(payload).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/inventories']);
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
    if (formValue.name?.trim()) return true;
    if (formValue.cost) return true;
    if (formValue.quantity) return true;
    if (formValue.minimumStock) return true;
    
    return false;
  }

  private initializeForm() {
    this.form = this.fb.group({
      itemType: ['MATERIAL', [Validators.required]],
      name: ['', [Validators.required, Validators.maxLength(100)]],
      cost: [null, [Validators.required, Validators.min(0)]],
      quantity: [null, [Validators.required, Validators.min(0)]],
      minimumStock: [null, [Validators.min(0)]],
      employeeId: ['']
    });
  }

  private loadInventory() {
    if (!this.inventoryId) return;
    
    this.loading = true;
    this.inventoriesService.getInventoryById(this.inventoryId).subscribe({
      next: (inventory: Inventory) => {
        this.populateForm(inventory);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        // Redireciona para a lista se não conseguir carregar
        this.router.navigate(['/inventories']);
      }
    });
  }

  private populateForm(inventory: Inventory) {
    this.form.patchValue({
      itemType: inventory.itemType,
      name: inventory.name,
      cost: inventory.cost,
      quantity: inventory.quantity,
      minimumStock: inventory.minimumStock || null,
      employeeId: inventory.employeeId || ''
    });
  }

  private loadEmployees() {
    this.loadingEmployees = true;
    
    const searchParams: EmployeeSearchParams = {
      page: 0,
      size: 1000,
      sortBy: 'name',
      sortDirection: 'ASC'
    };

    this.employeesService.getEmployees(searchParams)
      .subscribe({
        next: (response: PaginatedResponse<Employee>) => {
          this.employees = response.content;
          this.employeeOptions = [
            { label: 'Selecione um funcionário (opcional)', value: '' },
            ...this.employees.map(employee => ({
              label: `${employee.name} - ${employee.specialty}`,
              value: employee.id
            }))
          ];
          this.loadingEmployees = false;
        },
        error: (error) => {
          this.loadingEmployees = false;
        }
      });
  }
}
