import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { Observable, map } from 'rxjs';
import { BuildingsService } from 'src/app/services/buildings.service';
import { BuildingSearchParams } from 'src/app/models/building.interface';

interface BuildingOption {
  id: string;
  name: string;
}

@Component({
  selector: 'app-add-user-modal',
  templateUrl: './add-user-modal.component.html',
  styleUrls: ['./add-user-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
})
export class AddUserModalComponent implements OnInit {
  form!: FormGroup;
  isSubmitting = false;
  buildings$: Observable<BuildingOption[]> | undefined;

  constructor(
    private readonly fb: FormBuilder,
    private readonly modalCtrl: ModalController,
    private readonly toastCtrl: ToastController,
    private readonly buildingsService: BuildingsService,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['USER', Validators.required],
      buildingIds: [[] as string[]],
    });

    const searchParams: BuildingSearchParams = {
      page: 0,
      size: 100,
      sortBy: 'name',
      sortDirection: 'ASC',
    };
    this.buildings$ = this.buildingsService
      .getBuildings(searchParams)
      .pipe(map((resp) => (resp.content || []).map((b) => ({ id: b.id, name: b.name }))));
  }

  async close(): Promise<void> {
    await this.modalCtrl.dismiss();
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    try {
      const dto = this.form.value;
      await this.modalCtrl.dismiss({ created: true, dto });
    } finally {
      this.isSubmitting = false;
    }
  }

  async presentToast(message: string, color: 'success' | 'danger' = 'success'): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      color,
      position: 'bottom',
    });
    await toast.present();
  }
}


