import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { EmployeesService } from 'src/app/services/employees.service';
import { IONIC_IMPORTS } from 'src/app/shered/ionic-imports';
import { Employee, EmployeeRequest } from 'src/app/models/employee.interface';

@Component({
  selector: 'app-form-employee',
  templateUrl: './form-employee.page.html',
  styleUrls: ['./form-employee.page.scss'],
  standalone: true,
  imports: [...IONIC_IMPORTS, CommonModule, ReactiveFormsModule]
})
export class FormEmployeePage implements OnInit {
  form!: FormGroup;
  saving = false;
  loading = false;
  
  isEditMode = false;
  employeeId: string | null = null;
  pageTitle = 'Novo Funcionário';
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private employeesService: EmployeesService,
    private alertController: AlertController
  ) { 
    this.initializeForm();
  }

  ngOnInit() {
    // Verifica se há um ID na rota (modo edição)
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.employeeId = params['id'];
        this.isEditMode = true;
        this.pageTitle = 'Editar Funcionário';
        this.loadEmployee();
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
              this.router.navigate(['/employees']);
            }
          }
        ]
      });
      
      await alert.present();
    } else {
      // Se não há dados, cancela diretamente
      this.router.navigate(['/employees']);
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    const payload: EmployeeRequest = this.form.value;
    this.saving = true;
    
    if (this.isEditMode && this.employeeId) {
      // Modo edição
      this.employeesService.updateEmployee(this.employeeId, payload).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/employees']);
        },
        error: () => {
          this.saving = false;
        }
      });
    } else {
      // Modo criação
      this.employeesService.createEmployee(payload).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/employees']);
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
    if (formValue.specialty?.trim()) return true;
    if (formValue.contact?.trim()) return true;
    
    // Verifica campos do calendário
    if (formValue.calendar?.description?.trim()) return true;
    if (formValue.calendar?.startTime) return true;
    if (formValue.calendar?.endTime) return true;
    if (formValue.calendar?.monday) return true;
    if (formValue.calendar?.tuesday) return true;
    if (formValue.calendar?.wednesday) return true;
    if (formValue.calendar?.thursday) return true;
    if (formValue.calendar?.friday) return true;
    if (formValue.calendar?.saturday) return true;
    if (formValue.calendar?.sunday) return true;
    if (formValue.calendar?.hasBreak) return true;
    
    return false;
  }

  private initializeForm() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      specialty: [''],
      contact: [''],
      calendar: this.fb.group({
        description: [''],
        monday: [false],
        tuesday: [false],
        wednesday: [false],
        thursday: [false],
        friday: [false],
        saturday: [false],
        sunday: [false],
        startTime: [''],
        endTime: [''],
        hasBreak: [false]
      }, { validators: this.calendarValidator })
    });
  }

  private loadEmployee() {
    if (!this.employeeId) return;
    
    this.loading = true;
    this.employeesService.getEmployeeById(this.employeeId).subscribe({
      next: (employee: Employee) => {
        this.populateForm(employee);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        // Redireciona para a lista se não conseguir carregar
        this.router.navigate(['/employees']);
      }
    });
  }

  private populateForm(employee: Employee) {
    this.form.patchValue({
      name: employee.name,
      specialty: employee.specialty || '',
      contact: employee.contact || '',
      calendar: {
        description: employee.calendar?.description || '',
        monday: employee.calendar?.monday || false,
        tuesday: employee.calendar?.tuesday || false,
        wednesday: employee.calendar?.wednesday || false,
        thursday: employee.calendar?.thursday || false,
        friday: employee.calendar?.friday || false,
        saturday: employee.calendar?.saturday || false,
        sunday: employee.calendar?.sunday || false,
        startTime: employee.calendar?.startTime || '',
        endTime: employee.calendar?.endTime || '',
        hasBreak: employee.calendar?.hasBreak || false
      }
    });
  }

  private calendarValidator(group: FormGroup) {
    const calendarValue = group.value;
    
    // Se algum campo do calendário foi preenchido, validar campos obrigatórios
    const hasAnyField = calendarValue.description || 
                       calendarValue.startTime || 
                       calendarValue.endTime ||
                       calendarValue.monday ||
                       calendarValue.tuesday ||
                       calendarValue.wednesday ||
                       calendarValue.thursday ||
                       calendarValue.friday ||
                       calendarValue.saturday ||
                       calendarValue.sunday;
    
    if (!hasAnyField) {
      return null; // Não há validação se nenhum campo foi preenchido
    }
    
    // Se algum campo foi preenchido, validar que pelo menos um dia da semana esteja selecionado
    const hasAnyDay = calendarValue.monday ||
                      calendarValue.tuesday ||
                      calendarValue.wednesday ||
                      calendarValue.thursday ||
                      calendarValue.friday ||
                      calendarValue.saturday ||
                      calendarValue.sunday;
    
    if (!hasAnyDay) {
      return { noDaysSelected: true };
    }
    
    // Validar que os horários sejam preenchidos
    if (!calendarValue.startTime || !calendarValue.endTime) {
      return { missingTimes: true };
    }
    
    return null;
  }
}
