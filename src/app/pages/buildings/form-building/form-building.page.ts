import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { BuildingsService } from 'src/app/services/buildings.service';
import { ViaCepService } from 'src/app/services/via-cep.service';
import { IONIC_IMPORTS } from 'src/app/shered/ionic-imports';
import { Building, BuildingRequest } from 'src/app/models/building.interface';

@Component({
  selector: 'app-form-building',
  templateUrl: './form-building.page.html',
  styleUrls: ['./form-building.page.scss'],
  standalone: true,
  imports: [...IONIC_IMPORTS, CommonModule, ReactiveFormsModule]
})
export class FormBuildingPage implements OnInit {
  form: FormGroup;
  saving = false;
  loadingCep = false;
  loading = false;
  
  isEditMode = false;
  buildingId: string | null = null;
  pageTitle = 'Nova Edificação';

  buildingTypeOptions = [
    { label: 'Residencial', value: 'RESIDENTIAL' },
    { label: 'Comercial', value: 'COMMERCIAL' },
    { label: 'Industrial', value: 'INDUSTRIAL' },
    { label: 'Misto', value: 'MIXED' },
    { label: 'Outro', value: 'OTHER' },
  ];
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private buildingsService: BuildingsService,
    private viaCep: ViaCepService,
    private alertController: AlertController

  ) { 

    const currentYear = new Date().getFullYear();
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(120)]],
      buildingType: ['RESIDENTIAL', [Validators.required]],
      constructionYear: [currentYear, [Validators.min(1800), Validators.max(currentYear)]],
      description: [''],
      addressRequest: this.fb.group({
        zipCode: ['', [Validators.pattern(/^\d{5}-?\d{3}$/)]],
        street: ['', [Validators.required]],
        number: [null, [Validators.required, Validators.min(1)]],
        district: [''],
        city: ['', [Validators.required]],
        state: ['', [Validators.maxLength(2)]],
      })
    });
  }

  ngOnInit() {
    // Verifica se há um ID na rota (modo edição)
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.buildingId = params['id'];
        this.isEditMode = true;
        this.pageTitle = 'Editar Edificação';
        this.loadBuilding();
      }
    });
  }
  get f() { return this.form.controls as any; }
  get a() { return (this.form.get('addressRequest') as FormGroup).controls as any; }


  buscarCEP() {
    const cepRaw = this.a.zipCode.value || '';
    const cep = cepRaw.replace(/\D/g, '');
    if (cep.length !== 8) return;

    this.loadingCep = true;
    this.viaCep.buscarCEP(cep).subscribe({
      next: res => {
        (this.form.get('addressRequest') as FormGroup).patchValue({
          street: res.logradouro || '',
          district: res.bairro || '',
          city: res.localidade || '',
          state: res.uf || ''
        });
        this.loadingCep = false;
      },
      error: () => {
        this.loadingCep = false;
      }
    });
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
              this.router.navigate(['/buildings']);
            }
          }
        ]
      });
      
      await alert.present();
    } else {
      // Se não há dados, cancela diretamente
      this.router.navigate(['/buildings']);
    }
  }


  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    const payload: BuildingRequest = this.form.value;
    this.saving = true;
    
    if (this.isEditMode && this.buildingId) {
      // Modo edição
      this.buildingsService.updateBuilding(this.buildingId, payload).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/buildings']);
        },
        error: () => {
          this.saving = false;
        }
      });
    } else {
      // Modo criação
      this.buildingsService.createBuilding(payload).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/buildings']);
        },
        error: () => {
          this.saving = false;
        }
      });
    }
  }

  onCepInput() {
    const cepRaw = this.a.zipCode.value || '';
    const cep = cepRaw.replace(/\D/g, '');
    
    // Só busca quando tem 8 dígitos
    if (cep.length === 8) {
      this.buscarCEP();
    }
  }

  private hasFormData(): boolean {
    const formValue = this.form.value;
    
    // Verifica campos principais
    if (formValue.name?.trim()) return true;
    if (formValue.description?.trim()) return true;
    if (formValue.constructionYear && formValue.constructionYear !== new Date().getFullYear()) return true;
    
    // Verifica campos de endereço
    const address = formValue.addressRequest;
    if (address?.zipCode?.trim()) return true;
    if (address?.street?.trim()) return true;
    if (address?.number) return true;
    if (address?.district?.trim()) return true;
    if (address?.city?.trim()) return true;
    if (address?.state?.trim()) return true;
    
    return false;
  }

  private initializeForm() {
    const currentYear = new Date().getFullYear();
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(120)]],
      buildingType: ['RESIDENTIAL', [Validators.required]],
      constructionYear: [currentYear, [Validators.min(1800), Validators.max(currentYear)]],
      description: [''],
      addressRequest: this.fb.group({
        zipCode: ['', [Validators.pattern(/^\d{5}-?\d{3}$/)]],
        street: ['', [Validators.required]],
        number: [null, [Validators.required, Validators.min(1)]],
        district: [''],
        city: ['', [Validators.required]],
        state: ['', [Validators.maxLength(2)]],
      })
    });
  }

  private loadBuilding() {
    if (!this.buildingId) return;
    
    this.loading = true;
    this.buildingsService.getBuildingById(this.buildingId).subscribe({
      next: (building: Building) => {
        this.populateForm(building);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        // Redireciona para a lista se não conseguir carregar
        this.router.navigate(['/buildings']);
      }
    });
  }

  private populateForm(building: Building) {
    this.form.patchValue({
      name: building.name,
      buildingType: building.buildingType,
      constructionYear: building.constructionYear,
      description: building.description || '',
      addressRequest: {
        zipCode: building.address?.zipCode || '',
        street: building.address?.street || '',
        number: building.address?.number || null,
        district: building.address?.district || '',
        city: building.address?.city || '',
        state: building.address?.state || '',
      }
    });
  }
}


