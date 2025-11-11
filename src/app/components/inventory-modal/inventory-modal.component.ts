import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModalController, ToastController } from '@ionic/angular/standalone';
import { InventoriesService } from '../../services/inventories.service';
import { WorkOrdersService } from '../../services/work-orders.service';
import { WorkOrderInventoryRequest } from '../../models/work-order-inventory.interface';
import { Inventory } from '../../models/inventory.interface';
import { IONIC_IMPORTS } from '../../shered/ionic-imports';

@Component({
  selector: 'app-inventory-modal',
  templateUrl: './inventory-modal.component.html',
  styleUrls: ['./inventory-modal.component.scss'],
  standalone: true,
  imports: [...IONIC_IMPORTS, CommonModule, ReactiveFormsModule],
  providers: [ModalController, ToastController]
})
export class InventoryModalComponent implements OnInit {
  @Input() workOrderId!: string;
  
  form!: FormGroup;
  inventories: Inventory[] = [];
  loadingInventories = false;
  saving = false;

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private inventoriesService: InventoriesService,
    private workOrdersService: WorkOrdersService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.loadInventories();
  }

  initializeForm() {
    this.form = this.formBuilder.group({
      inventoryId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
  }

  loadInventories() {
    this.loadingInventories = true;
    this.inventoriesService.getInventories({ page: 0, size: 1000 }).subscribe({
      next: (response) => {
        this.inventories = response.content;
        this.loadingInventories = false;
      }, 
      error: () => {
        this.loadingInventories = false;
        this.presentToast('Erro ao carregar inventários.', 'danger');
      }
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;
    const payload: WorkOrderInventoryRequest = {
      inventoryId: formValue.inventoryId,
      quantity: formValue.quantity
    };

    this.saving = true;
    this.workOrdersService.addInventoryItem(this.workOrderId, payload).subscribe({
      next: () => {
        this.saving = false;
        this.presentToast('Item adicionado com sucesso!');
        this.modalController.dismiss(true);
      },
      error: (error) => {
        this.saving = false;
        const message = error.error?.message || 'Erro ao adicionar item do inventário.';
        this.presentToast(message, 'danger');
      }
    });
  }

  close() {
    this.modalController.dismiss();
  }

  private async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}
