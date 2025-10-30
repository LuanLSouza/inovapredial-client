import { Injectable } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { WorkOrder } from 'src/app/models/work-order.interface';
import { TaskResponse } from 'src/app/models/task.interface';
import { WorkOrderInventoryResponse } from 'src/app/models/work-order-inventory.interface';
import { loadSvgAsDataUrl, blobToBase64 } from './image-loader.util';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

(pdfMake as any).vfs = (pdfFonts as any).vfs || (pdfFonts as any).pdfMake?.vfs;

@Injectable({ providedIn: 'root' })
export class WorkOrderPdfService {

  async generateAndShare(
    workOrder: WorkOrder | null,
    tasks: TaskResponse[] = [],
    inventoryItems: WorkOrderInventoryResponse[] = []
  ): Promise<void> {
    if (!workOrder) return;

    const logoPngDataUrl = await this.getLogoPngDataUrl('assets/icons/logo-name.svg');
    const docDefinition = this.buildDocDefinition(workOrder, tasks, inventoryItems, logoPngDataUrl);

    const pdfBlob: Blob = await this.createPdfBlob(docDefinition);

    await this.shareBlob(pdfBlob, `OS-${workOrder.id || 'documento'}.pdf`);
  }

  private async getLogoPngDataUrl(svgPath: string): Promise<string | undefined> {
    try {
      const svgDataUrl = await loadSvgAsDataUrl(svgPath);
      const pngDataUrl = await this.convertImageToPngDataUrl(svgDataUrl);
      return pngDataUrl;
    } catch {
      return undefined;
    }
  }

  private async convertImageToPngDataUrl(src: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  private buildDocDefinition(
    workOrder: WorkOrder,
    tasks: TaskResponse[],
    inventoryItems: WorkOrderInventoryResponse[],
    logoDataUrl?: string
  ): any {
    const title = `Ordem de Serviço ${workOrder.id ? `#${workOrder.id}` : ''}`.trim();

    const infoRows: Array<[string, string]> = [
      ['Descrição', workOrder.description || '—'],
      ['Tipo de Manutenção', this.mapMaintenanceType(workOrder.maintenanceType)],
      ['Prioridade', this.mapPriority(workOrder.priority)],
      ['Status', this.mapActivityStatus(workOrder.activityStatus)],
      ['Data de Abertura', this.formatDate(workOrder.openingDate)],
      ['Data de Fechamento', this.formatDate(workOrder.closingDate)],
      ['Custo Total', this.formatCurrency(workOrder.totalCost)]
    ];

    const infoTable = {
      table: {
        widths: ['35%', '*'],
        body: [
          [{ text: 'Campo', style: 'tableHeader' }, { text: 'Valor', style: 'tableHeader' }],
          ...infoRows.map(([k, v]) => [{ text: k, style: 'keyCell' }, { text: v, style: 'valueCell' }])
        ]
      },
      layout: this.getZebraTableLayout()
    };

    const tasksSection = tasks && tasks.length > 0 ? [
      { text: 'Tarefas', style: 'sectionTitle', margin: [0, 16, 0, 8] },
      {
        table: {
          widths: ['28%', '*', '16%', '16%', '16%'],
          body: [
            [
              { text: 'Título', style: 'tableHeader' },
              { text: 'Descrição', style: 'tableHeader' },
              { text: 'Status', style: 'tableHeader' },
              { text: 'Início', style: 'tableHeader' },
              { text: 'Fim', style: 'tableHeader' }
            ],
            ...tasks.map(t => [
              t.title || '—',
              t.description || '—',
              this.mapTaskStatus(t.activityStatus as any),
              this.formatDate((t as any).startDate),
              this.formatDate((t as any).endDate)
            ])
          ]
        },
        layout: this.getZebraTableLayout()
      }
    ] : [];

    const inventorySection = inventoryItems && inventoryItems.length > 0 ? [
      { text: 'Itens de Inventário', style: 'sectionTitle', margin: [0, 16, 0, 8] },
      {
        table: {
          widths: ['*', '18%', '18%', '18%'],
          body: [
            [
              { text: 'Item', style: 'tableHeader' },
              { text: 'Quantidade', style: 'tableHeader' },
              { text: 'Custo Unitário', style: 'tableHeader' },
              { text: 'Custo Total', style: 'tableHeader' }
            ],
            ...inventoryItems.map(i => [
              i.inventoryName || '—',
              String(i.quantity ?? '—'),
              this.formatCurrency(i.unitCost),
              this.formatCurrency(i.totalCost)
            ])
          ]
        },
        layout: this.getZebraTableLayout()
      }
    ] : [];

    const content: any[] = [
      {
        columns: [
          logoDataUrl ? { image: logoDataUrl, width: 140 } : { text: '' },
          { text: title, style: 'title', alignment: 'right' }
        ],
        columnGap: 16,
        margin: [0, 0, 0, 16]
      },
      { text: 'Dados da OS', style: 'sectionTitle' },
      infoTable,
      ...tasksSection,
      ...inventorySection
    ];

    return {
      pageSize: 'A4',
      pageMargins: [36, 48, 36, 48],
      content,
      footer: (currentPage: number, pageCount: number) => {
        const ts = new Date().toLocaleString('pt-BR');
        return {
          columns: [
            { text: `Gerado em ${ts}`, style: 'footerText' },
            { text: `${currentPage} / ${pageCount}`, alignment: 'right', style: 'footerText' }
          ],
          margin: [36, 0, 36, 24]
        };
      },
      styles: {
        title: { fontSize: 20, bold: true },
        sectionTitle: { fontSize: 14, bold: true, color: '#111', margin: [0, 8, 0, 8] },
        tableHeader: { bold: true, fillColor: '#f2f2f7' },
        keyCell: { color: '#444' },
        valueCell: { color: '#111' },
        footerText: { fontSize: 9, color: '#666' }
      }
    };
  }

  private getZebraTableLayout() {
    return {
      fillColor: (rowIndex: number) => (rowIndex === 0 ? undefined : rowIndex % 2 === 0 ? '#fafafa' : undefined),
      hLineColor: () => '#eaeaea',
      vLineColor: () => '#eaeaea'
    };
  }

  private createPdfBlob(docDefinition: any): Promise<Blob> {
    return new Promise((resolve) => {
      const pdfDoc = pdfMake.createPdf(docDefinition);
      pdfDoc.getBlob((blob: Blob) => resolve(blob));
    });
  }

  private async shareBlob(blob: Blob, fileName: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      const base64 = await blobToBase64(blob);
      const path = `pdf/${fileName}`;
      await Filesystem.writeFile({
        path,
        data: base64,
        directory: Directory.Cache,
        recursive: true
      });
      const uriResult = await Filesystem.getUri({ directory: Directory.Cache, path });
      await Share.share({
        title: fileName,
        url: uriResult.uri
      });
      return;
    }

    // Web fallback: abrir em nova aba
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  private mapMaintenanceType(type: WorkOrder['maintenanceType'] | undefined): string {
    const map: Record<string, string> = { CORRECTIVE: 'Corretiva', PREVENTIVE: 'Preventiva', PREDICTIVE: 'Preditiva' };
    return (type && map[type]) || '—';
  }

  private mapPriority(priority: WorkOrder['priority'] | undefined): string {
    const map: Record<string, string> = { LOW: 'Baixa', MEDIUM: 'Média', HIGH: 'Alta', URGENT: 'Urgente' };
    return (priority && map[priority]) || '—';
  }

  private mapActivityStatus(status: WorkOrder['activityStatus'] | undefined): string {
    const map: Record<string, string> = { OPEN: 'Aberta', IN_PROGRESS: 'Em Progresso', COMPLETED: 'Concluída', CANCELLED: 'Cancelada' };
    return (status && map[status]) || '—';
  }

  private mapTaskStatus(status: TaskResponse['activityStatus'] | undefined): string {
    const map: Record<string, string> = { OPEN: 'Aberta', IN_PROGRESS: 'Em Progresso', COMPLETED: 'Concluída', CANCELLED: 'Cancelada' } as any;
    return (status && (map as any)[status]) || '—';
  }

  private formatDate(dateString?: string): string {
    if (!dateString) return '—';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('pt-BR');
    } catch {
      return '—';
    }
  }

  private formatCurrency(value?: number): string {
    if (value === undefined || value === null) return '—';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }
}


