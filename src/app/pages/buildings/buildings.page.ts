import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonCard, IonGrid, IonRow, IonCol, IonLabel, IonInput, IonSelect, IonSelectOption, IonImg } from '@ionic/angular/standalone';
import { HeaderComponent, SidebarComponent } from 'src/app/components';
import { Router } from '@angular/router';
import { BuildingsService } from 'src/app/services/buildings.service';

@Component({
  selector: 'app-buildings',
  templateUrl: './buildings.page.html',
  styleUrls: ['./buildings.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonCard, IonButton, IonGrid, IonRow, IonCol, IonLabel, IonInput, IonSelect, IonSelectOption, IonImg]
})
export class BuildingsPage implements OnInit {

  constructor(
    private buildingsService: BuildingsService
  ) { }

  ngOnInit() {
  }


}
