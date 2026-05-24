import { Routes } from '@angular/router';
import { AuthGuardService } from '../../guard/auth.guard';
import { RouteAuthGuardService } from '../../guard/route-auth.guard';

export const mainRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./main.component').then((component) => component.MainComponent),
    canActivate: [AuthGuardService],
    canActivateChild: [RouteAuthGuardService],
    children: [
      {
        path: ':type/:id/:name',
        loadComponent: () =>
          import('../chat/chat.component').then(
            (component) => component.ChatComponent
          ),
      },
      {
        path: 'admin-panel',
        loadComponent: () =>
          import('../admin/admin.component').then(
            (component) => component.AdminComponent
          ),
      },
    ],
  },
];
