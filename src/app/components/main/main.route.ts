import { Routes } from '@angular/router';
import { ChatComponent } from '../chat/chat.component';
import { AdminComponent } from '../admin/admin.component';
import { MainComponent } from './main.component';
import { AuthGuardService } from '../../guard/auth.guard';
import { RouteAuthGuardService } from '../../guard/route-auth.guard';

export const mainRoutes: Routes = [
  {
    path: 'dashboard',
    component: MainComponent,
    canActivate: [AuthGuardService],
    canActivateChild: [RouteAuthGuardService],
    children: [
      {
        path: ':type/:id/:name',
        component: ChatComponent,
      },
      {
        path: 'admin-panel',
        component: AdminComponent,
      },
    ],
  },
];
