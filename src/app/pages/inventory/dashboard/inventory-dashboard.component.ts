import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { TranslateModule } from '@ngx-translate/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
    ApexAxisChartSeries,
    ApexNonAxisChartSeries,
    ApexChart,
    ApexStroke,
    ApexFill,
    ApexXAxis,
    ApexYAxis,
    ApexLegend,
    ApexTooltip,
    ApexGrid,
    ApexPlotOptions,
    ApexDataLabels,
} from 'ng-apexcharts';
import { GetStockAlertsUseCase } from '../../../core/application/use-cases/get-stock-alerts.use-case';
import { Product } from '../../../core/domain/entities/product.entity';

@Component({
    selector: 'app-inventory-dashboard',
    standalone: true,
    imports: [CommonModule, MaterialModule, TablerIconsModule, TranslateModule, NgApexchartsModule],
    templateUrl: './inventory-dashboard.component.html',
    styles: [`
        .kpi-card {
            border-radius: 12px;
            padding: 20px;
            display: flex;
            align-items: center;
            gap: 16px;
        }
        .kpi-icon {
            border-radius: 50%;
            width: 52px; height: 52px;
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
        }
        .low-stock-row { border-left: 3px solid #f44336; }
        .badge {
            display: inline-flex; align-items: center; gap: 4px;
            padding: 2px 10px; border-radius: 999px;
            font-size: 0.72rem; font-weight: 600;
        }
        .badge-entrada { background:#E8F5E9; color:#2E7D32; }
        .badge-salida  { background:#FFEBEE; color:#C62828; }
        .badge-compra  { background:#E3F2FD; color:#1565C0; }
        .badge-venta   { background:#FFF3E0; color:#E65100; }
        .badge-manual  { background:#F3E5F5; color:#6A1B9A; }
        ::ng-deep .alerts-menu .mat-mdc-menu-panel { min-width: 340px !important; max-width: 360px !important; overflow: hidden; border-radius: 12px !important; }
        ::ng-deep .alerts-menu .mat-mdc-menu-content { padding: 0 !important; }
        .alerts-header { background: #1a6ef1; padding: 16px 20px; }
        .alert-item { display: flex; align-items: center; gap: 12px; padding: 12px 20px; border-bottom: 1px solid #f1f5f9; cursor: default; }
        .alert-item:last-of-type { border-bottom: none; }
        .alert-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .alert-text { flex: 1; min-width: 0; }
        .alert-text p { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .alert-badge { font-size: 0.75rem; font-weight: 700; padding: 2px 8px; border-radius: 999px; flex-shrink: 0; }
        .alerts-footer { padding: 12px 20px 16px; }
    `]
})
export class InventoryDashboardComponent implements OnInit {
    private getStockAlertsUseCase = inject(GetStockAlertsUseCase);
    private router = inject(Router);

    // ── Alert State ─────────────────────────────────────────────────────────────
    protected lowStockProducts: Product[] = [];
    protected alertsCount = 0;

    // ── KPI data ────────────────────────────────────────────────────────────────
    kpis = [
        { label: 'Total Productos', value: '48', sub: '+3 este mes', icon: 'box', bg: '#EDE7F6', iconBg: '#D1C4E9', color: '#6A1B9A' },
        { label: 'Unidades en Stock', value: '3,240', sub: 'En todos los productos', icon: 'packages', bg: '#E3F2FD', iconBg: '#BBDEFB', color: '#1565C0' },
        { label: 'Entradas (30d)', value: '312', sub: '8 movimientos', icon: 'arrow-down', bg: '#E8F5E9', iconBg: '#C8E6C9', color: '#2E7D32' },
        { label: 'Salidas (30d)', value: '189', sub: '12 movimientos', icon: 'arrow-up', bg: '#FFEBEE', iconBg: '#FFCDD2', color: '#C62828' },
        { label: 'Productos Agotados', value: '0', sub: 'Requieren reposición', icon: 'alert-circle', bg: '#FFF3E0', iconBg: '#FFE0B2', color: '#E65100' },
        { label: 'Stock Bajo', value: '0', sub: 'Menos del mínimo', icon: 'alert-triangle', bg: '#FFFDE7', iconBg: '#FFF9C4', color: '#F57F17' },
    ];

    // ── Recent Movements ────────────────────────────────────────────────────────
    recentMovements = [
        { date: '02/03/2026 16:00', product: 'Mouse Inalámbrico', sku: 'MOU-INL-02', direction: 'entrada', type: 'compra', qty: +25 },
        { date: '02/03/2026 14:15', product: 'Teclado Mecánico', sku: 'TEC-MEC-01', direction: 'salida', type: 'manual', qty: -2 },
        { date: '02/03/2026 12:00', product: 'Hub USB-C', sku: 'HUB-USC-04', direction: 'salida', type: 'venta', qty: -10 },
        { date: '02/03/2026 10:30', product: 'SSD 1TB', sku: 'SSD-1TB-07', direction: 'entrada', type: 'compra', qty: +30 },
        { date: '02/03/2026 09:00', product: 'Monitor 4K 27"', sku: 'MON-4K-27', direction: 'salida', type: 'venta', qty: -4 },
    ];

    // ── Movement Trend Chart (30 days, line) ────────────────────────────────────
    movementTrendSeries: ApexAxisChartSeries = [
        { name: 'Entradas', data: [12, 8, 20, 5, 30, 15, 25, 10, 18, 22, 8, 14, 19, 6, 28, 9, 17, 23, 11, 16, 24, 7, 13, 21, 10, 27, 4, 20, 15, 25] },
        { name: 'Salidas', data: [5, 14, 9, 18, 7, 22, 11, 19, 6, 17, 23, 8, 15, 24, 3, 20, 12, 7, 17, 9, 14, 21, 8, 15, 19, 6, 22, 11, 18, 9] },
    ];
    movementTrendChart: ApexChart = { type: 'area', height: 280, toolbar: { show: false }, fontFamily: 'inherit' };
    movementTrendStroke: ApexStroke = { curve: 'smooth', width: 2 };
    movementTrendFill: ApexFill = { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.05 } };
    movementTrendColors: string[] = ['#4CAF50', '#F44336'];
    movementTrendXaxis: ApexXAxis = { categories: Array.from({ length: 30 }, (_, i) => `${i + 1}/03`), labels: { rotate: -45, style: { fontSize: '10px' } } };
    movementTrendYaxis: ApexYAxis = { labels: { style: { fontSize: '11px' } } };
    movementTrendLegend: ApexLegend = { position: 'top' };
    movementTrendTooltip: ApexTooltip = { shared: true, intersect: false };
    movementTrendGrid: ApexGrid = { borderColor: '#f1f1f1' };

    // ── Movement Types Donut ────────────────────────────────────────────────────
    movementTypeSeries: ApexNonAxisChartSeries = [42, 31, 27];
    movementTypeChart: ApexChart = { type: 'donut', height: 280, fontFamily: 'inherit' };
    movementTypeLabels: string[] = ['Compra', 'Venta', 'Manual'];
    movementTypeColors: string[] = ['#1565C0', '#E65100', '#6A1B9A'];
    movementTypeLegend: ApexLegend = { position: 'bottom' };
    movementTypePlotOptions: ApexPlotOptions = { pie: { donut: { size: '65%', labels: { show: true, total: { show: true, label: 'Total', fontSize: '13px', fontWeight: 600 } } } } };
    movementTypeDataLabels: ApexDataLabels = { enabled: false };
    movementTypeTooltip: ApexTooltip = { y: { formatter: (v: number) => `${v} movimientos` } };

    // ── Stock by Category Bar ───────────────────────────────────────────────────
    stockByCatSeries: ApexAxisChartSeries = [{ name: 'Unidades', data: [520, 340, 280, 195, 420, 310, 150] }];
    stockByCatChart: ApexChart = { type: 'bar', height: 260, toolbar: { show: false }, fontFamily: 'inherit' };
    stockByCatPlotOptions: ApexPlotOptions = { bar: { borderRadius: 6, horizontal: false, columnWidth: '50%' } };
    stockByCatColors: string[] = ['#5E35B1'];
    stockByCatXaxis: ApexXAxis = { categories: ['Periféricos', 'Almacenamiento', 'Audio', 'Video', 'Accesorios', 'Cables', 'Soportes'] };
    stockByCatYaxis: ApexYAxis = { labels: { style: { fontSize: '11px' } } };
    stockByCatDataLabels: ApexDataLabels = { enabled: false };
    stockByCatGrid: ApexGrid = { borderColor: '#f1f1f1' };

    // ── Monthly Entry/Exit Grouped Bar ──────────────────────────────────────────
    monthlyBalanceSeries: ApexAxisChartSeries = [
        { name: 'Entradas', data: [180, 220, 190, 310, 260, 312] },
        { name: 'Salidas', data: [120, 170, 145, 210, 180, 189] },
    ];
    monthlyBalanceChart: ApexChart = { type: 'bar', height: 260, toolbar: { show: false }, fontFamily: 'inherit' };
    monthlyBalancePlotOptions: ApexPlotOptions = { bar: { borderRadius: 4, columnWidth: '60%' } };
    monthlyBalanceColors: string[] = ['#4CAF50', '#F44336'];
    monthlyBalanceXaxis: ApexXAxis = { categories: ['Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar'] };
    monthlyBalanceYaxis: ApexYAxis = { labels: { style: { fontSize: '11px' } } };
    monthlyBalanceLegend: ApexLegend = { position: 'top' };
    monthlyBalanceDataLabels: ApexDataLabels = { enabled: false };
    monthlyBalanceGrid: ApexGrid = { borderColor: '#f1f1f1' };

    ngOnInit(): void {
        this.loadAlerts();
    }

    private loadAlerts() {
        this.getStockAlertsUseCase.execute().subscribe(alerts => {
            this.lowStockProducts = alerts.latestAlerts;
            this.alertsCount = alerts.outOfStockCount + alerts.lowStockCount;

            // Update KPIs with real data
            this.kpis[4].value = alerts.outOfStockCount.toString();
            this.kpis[5].value = alerts.lowStockCount.toString();
        });
    }

    protected goToStockAlerts() {
        this.router.navigate(['/inventory/products'], {
            queryParams: { sortBy: 'stock', sortOrder: 'asc' }
        });
    }

    stockPercent(stock: number, min: number): number {
        return Math.min(100, Math.round((stock / min) * 100));
    }

    stockColor(stock: number): string {
        if (stock === 0) return 'warn';
        if (stock <= 3) return 'accent';
        return 'primary';
    }
}
