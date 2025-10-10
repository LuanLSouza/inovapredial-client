import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { EquipmentsService } from 'src/app/services/equipments.service';
import { IONIC_IMPORTS } from 'src/app/shered/ionic-imports';
import { Equipment, EquipmentRequest } from 'src/app/models/equipment.interface';

@Component({
  selector: 'app-form-equipment',
  templateUrl: './form-equipment.page.html',
  styleUrls: ['./form-equipment.page.scss'],
  standalone: true,
  imports: [...IONIC_IMPORTS, CommonModule, ReactiveFormsModule]
})
export class FormEquipmentPage implements OnInit {
  form!: FormGroup;
  saving = false;
  loading = false;
  
  isEditMode = false;
  equipmentId: string | null = null;
  pageTitle = 'Novo Equipamento';

  classificationOptions = [
    { label: 'Componente', value: 'COMPONENT' },
    { label: 'Equipamento', value: 'EQUIPMENT' },
  ];

  criticalityOptions = [
    { label: 'Alta', value: 'HIGH' },
    { label: 'Média', value: 'MEDIUM' },
    { label: 'Baixa', value: 'LOW' },
  ];

  equipmentStatusOptions = [
    { label: 'Ativo', value: 'ACTIVE' },
    { label: 'Inativo', value: 'INACTIVE' },
    { label: 'Em Manutenção', value: 'UNDER_MAINTENANCE' },
  ];
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private equipmentsService: EquipmentsService,
    private alertController: AlertController
  ) { 
    this.initializeForm();
  }

  ngOnInit() {
    // Verifica se há um ID na rota (modo edição)
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.equipmentId = params['id'];
        this.isEditMode = true;
        this.pageTitle = 'Editar Equipamento';
        this.loadEquipment();
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
              this.router.navigate(['/equipments']);
            }
          }
        ]
      });
      
      await alert.present();
    } else {
      // Se não há dados, cancela diretamente
      this.router.navigate(['/equipments']);
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    const payload: EquipmentRequest = this.form.value;
    this.saving = true;
    
    if (this.isEditMode && this.equipmentId) {
      // Modo edição
      this.equipmentsService.updateEquipment(this.equipmentId, payload).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/equipments']);
        },
        error: () => {
          this.saving = false;
        }
      });
    } else {
      // Modo criação
      this.equipmentsService.createEquipment(payload).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/equipments']);
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
    if (formValue.identification?.trim()) return true;
    if (formValue.description?.trim()) return true;
    if (formValue.serialNumber?.trim()) return true;
    if (formValue.location?.trim()) return true;
    if (formValue.group?.trim()) return true;
    if (formValue.model?.trim()) return true;
    if (formValue.costCenter?.trim()) return true;
    if (formValue.imageUrl?.trim()) return true;
    if (formValue.price) return true;
    if (formValue.purchaseDate) return true;
    if (formValue.warrantyEndDate) return true;
    
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
      identification: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      serialNumber: [''],
      classification: ['EQUIPMENT', [Validators.required]],
      location: [''],
      criticality: ['MEDIUM', [Validators.required]],
      purchaseDate: [''],
      warrantyEndDate: [''],
      price: [null, [Validators.min(0)]],
      equipmentStatus: ['ACTIVE'],
      imageUrl: [''],
      group: [''],
      model: [''],
      costCenter: [''],
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

  private loadEquipment() {
    if (!this.equipmentId) return;
    
    this.loading = true;
    this.equipmentsService.getEquipmentById(this.equipmentId).subscribe({
      next: (equipment: Equipment) => {
        this.populateForm(equipment);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        // Redireciona para a lista se não conseguir carregar
        this.router.navigate(['/equipments']);
      }
    });
  }

  private populateForm(equipment: Equipment) {
    this.form.patchValue({
      identification: equipment.identification,
      description: equipment.description || '',
      serialNumber: equipment.serialNumber || '',
      classification: equipment.classification,
      location: equipment.location || '',
      criticality: equipment.criticality,
      purchaseDate: equipment.purchaseDate || '',
      warrantyEndDate: equipment.warrantyEndDate || '',
      price: equipment.price || null,
      equipmentStatus: equipment.equipmentStatus || 'ACTIVE',
      imageUrl: equipment.imageUrl || '',
      group: equipment.group || '',
      model: equipment.model || '',
      costCenter: equipment.costCenter || '',
      calendar: {
        description: equipment.calendar?.description || '',
        monday: equipment.calendar?.monday || false,
        tuesday: equipment.calendar?.tuesday || false,
        wednesday: equipment.calendar?.wednesday || false,
        thursday: equipment.calendar?.thursday || false,
        friday: equipment.calendar?.friday || false,
        saturday: equipment.calendar?.saturday || false,
        sunday: equipment.calendar?.sunday || false,
        startTime: equipment.calendar?.startTime || '',
        endTime: equipment.calendar?.endTime || '',
        hasBreak: equipment.calendar?.hasBreak || false
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
