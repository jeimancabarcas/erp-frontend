import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    navCap: 'Home',
  },
  {
    displayName: 'Starter',
    iconName: 'home',
    route: '/starter',
  },
  {
    navCap: 'Inventory',
  },
  {
    displayName: 'Dashboard',
    iconName: 'layout-dashboard',
    route: '/inventory/dashboard',
  },
  {
    displayName: 'Gestion de Productos',
    iconName: 'box',
    route: '/inventory/products',
  },
  {
    displayName: 'Movimientos',
    iconName: 'arrows-exchange',
    route: '/inventory/movements',
  },
  {
    displayName: 'Configuración',
    iconName: 'settings',
    route: '/inventory/settings',
  },
  {
    navCap: 'Facturación',
  },
  {
    displayName: 'Ventas',
    iconName: 'file-invoice',
    route: '/billing/sales',
  },
  {
    displayName: 'Configuración',
    iconName: 'settings',
    route: '/billing/settings',
  },
];
