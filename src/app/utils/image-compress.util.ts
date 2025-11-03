/**
 * Utilitário para compressão e redimensionamento de imagens
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputFormat?: 'image/jpeg' | 'image/png' | 'image/webp';
}

const DEFAULT_OPTIONS: Required<CompressOptions> = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8,
  outputFormat: 'image/jpeg'
};

/**
 * Redimensiona uma imagem mantendo a proporção
 */
function resizeImage(
  img: HTMLImageElement,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let { width, height } = img;

  // Se a imagem já está dentro dos limites, não redimensiona
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  // Calcula novas dimensões mantendo a proporção
  const ratio = Math.min(maxWidth / width, maxHeight / height);
  width = width * ratio;
  height = height * ratio;

  return {
    width: Math.round(width),
    height: Math.round(height)
  };
}

/**
 * Comprime e redimensiona uma imagem
 * @param file Arquivo de imagem original
 * @param options Opções de compressão
 * @returns Promise com o Blob comprimido
 */
export function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    // Validação de tipo de arquivo
    if (!file.type.startsWith('image/')) {
      reject(new Error('O arquivo selecionado não é uma imagem'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        try {
          // Redimensiona a imagem
          const { width, height } = resizeImage(img, opts.maxWidth, opts.maxHeight);

          // Cria um canvas para redimensionar
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Não foi possível criar contexto do canvas'));
            return;
          }

          // Desenha a imagem redimensionada no canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Converte para blob com compressão
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Erro ao comprimir imagem'));
              }
            },
            opts.outputFormat,
            opts.quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Erro ao carregar imagem'));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Converte um Blob para base64
 * @param blob Blob a ser convertido
 * @returns Promise com a string base64 (sem o prefixo data:)
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove o prefixo data:image/...;base64,
      const base64 = result.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Converte uma string base64 para Blob
 * @param base64 String base64 (com ou sem prefixo data:)
 * @param mimeType Tipo MIME da imagem
 * @returns Blob
 */
export function base64ToBlob(base64: string, mimeType: string = 'image/jpeg'): Blob {
  // Remove o prefixo se existir
  const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
  
  // Converte base64 para bytes
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

