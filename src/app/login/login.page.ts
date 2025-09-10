import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule],
})
export class LoginPage {
  email: string = '';
  password: string = '';

  constructor(private router: Router) {}

  onLogin() {
    // Aqui você pode implementar a lógica de autenticação
    console.log('Email:', this.email);
    console.log('Password:', this.password);
    
    // Por enquanto, vamos apenas navegar para a home
    this.router.navigate(['/home']);
  }
}
