import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService, LoginRequest } from '../services/auth.service';

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

  constructor(
    private router: Router,
    private authService: AuthService,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  async onLogin() {
    if (!this.email || !this.password) {
      this.showToast('Por favor, preencha todos os campos', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Entrando...',
      spinner: 'crescent'
    });
    await loading.present();

    const loginData: LoginRequest = {
      login: this.email,
      password: this.password
    };

    this.authService.login(loginData).subscribe({
      next: async (response) => {
        await loading.dismiss();
        this.showToast('Login realizado com sucesso!', 'success');
        this.router.navigate(['/home']);
        console.log('Token salvo:', response.token);
      },
      error: async (error) => {
        await loading.dismiss();
        console.error('Erro no login:', error);
        
        let errorMessage = 'Erro ao fazer login. Tente novamente.';
        
        if (error.status === 400) {
          errorMessage = 'Email ou senha incorretos.';
        } else if (error.status === 0) {
          errorMessage = 'Erro de conexão. Verifique sua internet.';
          console.log(error);
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        this.showToast(errorMessage, 'danger');
      }
    });
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'top'
    });
    await toast.present();
  }
}
