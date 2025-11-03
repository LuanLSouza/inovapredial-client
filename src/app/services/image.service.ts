import { Injectable } from '@angular/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { compressImage, blobToBase64, base64ToBlob } from '../utils/image-compress.util';

export interface ImageSaveResult {
  path: string;
  fullPath?: string;
}

@Injectable({ providedIn: 'root' })
export class ImageService {
  private readonly basePath = 'uploads/images';
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB


  /**
   * Gera um nome único para o arquivo
   */
  private generateFileName(originalName: string, category: string = 'general'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop() || 'jpg';
    return `${category}/${timestamp}-${random}.${extension}`;
  }

  /**
   * Valida se o arquivo é uma imagem válida
   */
  private validateImageFile(file: File): void {
    // Valida tipo de arquivo
    if (!file.type.startsWith('image/')) {
      throw new Error('O arquivo selecionado não é uma imagem válida');
    }

    // Valida tamanho
    if (file.size > this.maxFileSize) {
      throw new Error(`A imagem é muito grande. Tamanho máximo: ${(this.maxFileSize / 1024 / 1024).toFixed(2)}MB`);
    }

    // Valida tipos permitidos
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Tipo de arquivo não suportado. Use JPEG, PNG ou WebP');
    }
  }

  /**
   * Salva uma imagem localmente
   * @param file Arquivo de imagem
   * @param category Categoria da imagem (ex: 'equipments', 'employees')
   * @param compress Se deve comprimir a imagem antes de salvar
   * @returns Caminho relativo da imagem salva
   */
  async saveImage(
    file: File,
    category: string = 'general',
    compress: boolean = true
  ): Promise<string> {
    try {
      this.validateImageFile(file);

      let imageBlob: Blob;
      if (compress) {
        imageBlob = await compressImage(file);
      } else {
        imageBlob = file;
      }

      const fileName = this.generateFileName(file.name, category);
      const filePath = `${this.basePath}/${fileName}`;

      if (Capacitor.isNativePlatform()) {
        const base64 = await blobToBase64(imageBlob);
        
        await Filesystem.writeFile({
          path: filePath,
          data: base64,
          directory: Directory.Data,
          recursive: true
        });

        return filePath;
      } else {
        try {
          await this.saveToProjectFolder(filePath, imageBlob);
          await this.saveToIndexedDB(filePath, imageBlob);
          return filePath;
        } catch (error) {
          console.warn('Não foi possível salvar na pasta física, usando apenas IndexedDB:', error);
          await this.saveToIndexedDB(filePath, imageBlob);
          return filePath;
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao salvar imagem');
    }
  }

  /**
   * Carrega uma imagem do caminho local
   * @param imagePath Caminho relativo da imagem
   * @returns URL da imagem (data URL ou blob URL)
   */
  async loadImage(imagePath: string): Promise<string | null> {
    if (!imagePath) {
      return null;
    }

    try {
      if (Capacitor.isNativePlatform()) {
        try {
          const file = await Filesystem.readFile({
            path: imagePath,
            directory: Directory.Data
          });

          const mimeType = this.getMimeTypeFromPath(imagePath);
          return `data:${mimeType};base64,${file.data}`;
        } catch (error) {
          console.error('Erro ao carregar imagem do Filesystem:', error);
          return null;
        }
      } else {
        const blob = await this.loadFromIndexedDB(imagePath);
        
        if (blob) {
          return URL.createObjectURL(blob);
        }
        
        if (imagePath.startsWith('http') || imagePath.startsWith('//')) {
          return imagePath;
        }
        
        return null;
      }
    } catch (error) {
      console.error('Erro ao carregar imagem:', error);
      return null;
    }
  }

  /**
   * Remove uma imagem do sistema de arquivos
   * @param imagePath Caminho relativo da imagem
   */
  async deleteImage(imagePath: string): Promise<void> {
    if (!imagePath) {
      return;
    }

    try {
      if (Capacitor.isNativePlatform()) {
        try {
          await Filesystem.deleteFile({
            path: imagePath,
            directory: Directory.Data
          });
        } catch (error) {
          console.warn('Arquivo não encontrado para remoção:', imagePath);
        }
      } else {
        await this.deleteFromIndexedDB(imagePath);
      }
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
    }
  }



  /**
   * Salva a imagem diretamente na pasta física do projeto
   * Na primeira vez, pede para escolher a pasta raiz do projeto
   * Depois salva automaticamente em uploads/images/{category}/
   */
  private async saveToProjectFolder(path: string, blob: Blob): Promise<void> {
    if (!('showDirectoryPicker' in window)) {
      throw new Error('File System Access API não disponível. Use Chrome ou Edge.');
    }

    try {
      const savedHandleKey = 'imageService_projectFolderHandle';
      let projectFolderHandle: any = null;

      if (!this.projectFolderHandleCache) {
        projectFolderHandle = await (window as any).showDirectoryPicker({
          mode: 'readwrite',
          startIn: 'documents'
        });
        
        this.projectFolderHandleCache = projectFolderHandle;
        localStorage.setItem(savedHandleKey, 'granted');
      } else {
        projectFolderHandle = this.projectFolderHandleCache;
      }

      const pathParts = path.split('/');
      let currentHandle = projectFolderHandle;
      
      for (let i = 0; i < pathParts.length - 1; i++) {
        if (pathParts[i]) {
          currentHandle = await currentHandle.getDirectoryHandle(pathParts[i], { create: true });
        }
      }

      const fileName = pathParts[pathParts.length - 1];
      const fileHandle = await currentHandle.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      
      console.log(`✓ Imagem salva fisicamente em: ${path}`);
    } catch (error: any) {
      if (error.name === 'AbortError' || error.message?.includes('cancel')) {
        throw new Error('Usuário cancelou a seleção de pasta');
      }
      throw error;
    }
  }

  private projectFolderHandleCache: any = null;

  /**
   * Salva blob no IndexedDB (Web)
   */
  private async saveToIndexedDB(path: string, blob: Blob): Promise<void> {
    const arrayBuffer = await blob.arrayBuffer();
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ImageStorage', 1);

      request.onerror = () => reject(new Error('Erro ao abrir IndexedDB'));

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['images'], 'readwrite');
        const store = transaction.objectStore('images');
        
        const putRequest = store.put({
          path: path,
          data: arrayBuffer,
          timestamp: Date.now()
        });
        
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(new Error('Erro ao salvar no IndexedDB'));
        
        transaction.onerror = () => reject(new Error('Erro na transação do IndexedDB'));
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('images')) {
          db.createObjectStore('images', { keyPath: 'path' });
        }
      };
    });
  }

  /**
   * Carrega blob do IndexedDB
   */
  private async loadFromIndexedDB(path: string): Promise<Blob | null> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ImageStorage', 1);

      request.onerror = () => reject(new Error('Erro ao abrir IndexedDB'));

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['images'], 'readonly');
        const store = transaction.objectStore('images');
        const getRequest = store.get(path);

        getRequest.onsuccess = () => {
          const result = getRequest.result;
          if (result && result.data) {
            const blob = new Blob([result.data], { type: this.getMimeTypeFromPath(path) });
            resolve(blob);
          } else {
            resolve(null);
          }
        };

        getRequest.onerror = () => reject(new Error('Erro ao ler do IndexedDB'));
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('images')) {
          db.createObjectStore('images', { keyPath: 'path' });
        }
      };
    });
  }

  /**
  * Remove do IndexedDB
   */
  private async deleteFromIndexedDB(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ImageStorage', 1);

      request.onerror = () => reject(new Error('Erro ao abrir IndexedDB'));

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['images'], 'readwrite');
        const store = transaction.objectStore('images');
        const deleteRequest = store.delete(path);

        deleteRequest.onsuccess = () => resolve();
        deleteRequest.onerror = () => reject(new Error('Erro ao remover do IndexedDB'));
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('images')) {
          db.createObjectStore('images', { keyPath: 'path' });
        }
      };
    });
  }

  /**
   * Obtém o tipo MIME baseado na extensão do arquivo
   */
  private getMimeTypeFromPath(path: string): string {
    const extension = path.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'webp': 'image/webp',
      'gif': 'image/gif'
    };
    return mimeTypes[extension || ''] || 'image/jpeg';
  }

  /**
   * Verifica se uma imagem existe
   */
  async imageExists(imagePath: string): Promise<boolean> {
    if (!imagePath) {
      return false;
    }

    try {
      if (Capacitor.isNativePlatform()) {
        try {
          await Filesystem.stat({
            path: imagePath,
            directory: Directory.Data
          });
          return true;
        } catch {
          return false;
        }
      } else {
        const blob = await this.loadFromIndexedDB(imagePath);
        return blob !== null;
      }
    } catch {
      return false;
    }
  }
}

