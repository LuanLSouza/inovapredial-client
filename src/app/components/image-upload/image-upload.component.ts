import { Component, Input, Output, EventEmitter, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { ToastController } from '@ionic/angular/standalone';
import { ImageService } from '../../services/image.service';
import { IONIC_IMPORTS } from '../../shered/ionic-imports';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss'],
  standalone: true,
  imports: [...IONIC_IMPORTS, CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImageUploadComponent),
      multi: true
    }
  ]
})
export class ImageUploadComponent implements OnInit, ControlValueAccessor {
  @Input() category: string = 'general';
  @Input() label: string = 'Imagem';
  @Input() placeholder: string = 'Selecione ou capture uma imagem';
  @Input() accept: string = 'image/*';
  @Input() maxSize: number = 10 * 1024 * 1024; // 10MB
  @Output() imageChange = new EventEmitter<string | null>();

  imagePath: string | null = null;
  imagePreview: string | null = null;
  loading = false;
  error: string | null = null;

  private onChange = (value: string | null) => {};
  private onTouched = () => {};

  constructor(
    private imageService: ImageService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    if (this.imagePath) {
      this.loadPreview();
    }
  }

  writeValue(value: string | null): void {
    this.imagePath = value;
    if (value) {
      this.loadPreview();
    } else {
      this.imagePreview = null;
    }
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  private async loadPreview() {
    if (!this.imagePath) {
      return;
    }

    try {
      this.imagePreview = await this.imageService.loadImage(this.imagePath);
    } catch (error) {
      console.error('Erro ao carregar preview:', error);
      this.imagePreview = null;
    }
  }

  async selectImage() {
    this.error = null;
    this.onTouched();

    try {
      if (Capacitor.isNativePlatform()) {
        await this.selectImageMobile();
      } else {
        await this.selectImageWeb();
      }
    } catch (error) {
      if ((error as any).message === 'User cancelled photos app' || 
          (error as any).message === 'User cancelled') {
        return;
      }
      this.handleError(error);
    }
  }

  /**
   * Seleciona imagem no mobile usando Camera
   */
  private async selectImageMobile() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Prompt,
    });

    if (!image.webPath) {
      throw new Error('Erro ao capturar imagem');
    }

    const response = await fetch(image.webPath);
    const blob = await response.blob();
    const file = new File([blob], 'image.jpg', { type: blob.type });

    await this.processImage(file);
  }

  private async selectImageWeb() {
    return new Promise<void>((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = this.accept;
      input.style.display = 'none';

      input.onchange = async (event: Event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];

        if (!file) {
          resolve();
          return;
        }

        try {
          await this.processImage(file);
          resolve();
        } catch (error) {
          reject(error);
        } finally {
          document.body.removeChild(input);
        }
      };

      input.oncancel = () => {
        document.body.removeChild(input);
        resolve();
      };

      document.body.appendChild(input);
      input.click();
    });
  }

  /**
   * Processa e salva a imagem
   */
  private async processImage(file: File) {
    this.loading = true;
    this.error = null;

    try {
      if (file.size > this.maxSize) {
        throw new Error(`A imagem é muito grande. Tamanho máximo: ${(this.maxSize / 1024 / 1024).toFixed(2)}MB`);
      }

      if (this.imagePath) {
        await this.imageService.deleteImage(this.imagePath);
      }
      const newPath = await this.imageService.saveImage(file, this.category, true);

      this.imagePath = newPath;
      await this.loadPreview();

      this.onChange(newPath);
      this.imageChange.emit(newPath);

      await this.showToast('Imagem salva com sucesso!', 'success');
    } catch (error) {
      this.handleError(error);
      throw error;
    } finally {
      this.loading = false;
    }
  }

  /**
   * Remove a imagem
   */
  async removeImage() {
    if (!this.imagePath) {
      return;
    }

    try {
      this.loading = true;
      
      await this.imageService.deleteImage(this.imagePath);

      this.imagePath = null;
      this.imagePreview = null;

      this.onChange(null);
      this.imageChange.emit(null);

      await this.showToast('Imagem removida com sucesso!', 'success');
    } catch (error) {
      this.handleError(error);
    } finally {
      this.loading = false;
    }
  }

  /**
   * Trata erros
   */
  private handleError(error: any) {
    const message = error instanceof Error ? error.message : 'Erro ao processar imagem';
    this.error = message;
    this.showToast(message, 'danger');
  }

  /**
   * Exibe toast
   */
  private async showToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}

