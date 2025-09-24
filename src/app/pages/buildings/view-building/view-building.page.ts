import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BuildingsService } from 'src/app/services/buildings.service';
import { Building } from 'src/app/models/building.interface';
import { IONIC_IMPORTS } from 'src/app/shered/ionic-imports';
import { ToastController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-view-building',
  templateUrl: './view-building.page.html',
  styleUrls: ['./view-building.page.scss'],
  standalone: true,
  imports: [...IONIC_IMPORTS, CommonModule]
})
export class ViewBuildingPage implements OnInit {

  building: Building | null = null;
  loading = false;
  buildingId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private buildingsService: BuildingsService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.buildingId = this.route.snapshot.paramMap.get('id');
    if (this.buildingId) {
      this.loadBuilding();
    } else {
      this.showToast('ID da edificação não encontrado', 'danger');
      this.router.navigate(['/buildings']);
    }
  }

  loadBuilding() {
    if (!this.buildingId) return;
    
    this.loading = true;
    
    this.buildingsService.getBuildingById(this.buildingId)
      .subscribe({
        next: (building: Building) => {
          this.building = building;
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar edificação:', error);
          this.showToast('Erro ao carregar edificação. Tente novamente.', 'danger');
          this.loading = false;
          this.router.navigate(['/buildings']);
        }
      });
  }

  displayBuildingType(bt: Building['buildingType'] | undefined) {
    if (!bt) return '-';
    const map: Record<string, string> = {
      RESIDENTIAL: 'Residencial',
      COMMERCIAL: 'Comercial',
      INDUSTRIAL: 'Industrial',
      MIXED: 'Misto',
      OTHER: 'Outros',
    };
    return map[bt] ?? bt;
  }

  getBuildingTypeColor(bt: Building['buildingType'] | undefined): string {
    if (!bt) return 'medium';
    const colorMap: Record<string, string> = {
      RESIDENTIAL: 'success',
      COMMERCIAL: 'primary',
      INDUSTRIAL: 'warning',
      MIXED: 'secondary',
      OTHER: 'tertiary',
    };
    return colorMap[bt] ?? 'medium';
  }

  onEdit() {
    if (this.building?.id) {
      this.router.navigate(['/buildings/edit', this.building.id]);
    }
  }

  onBack() {
    this.router.navigate(['/buildings']);
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

}
