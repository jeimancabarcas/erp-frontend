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
    displayName: 'Login',
    iconName: 'lock',
    route: '/authentication/login',
  },
  {
    displayName: 'Register',
    iconName: 'user-edit',
    route: '/authentication/register',
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
];
