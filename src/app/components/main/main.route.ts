import { Routes } from '@angular/router';
import { ChatComponent } from '../chat/chat.component';
import { MainComponent } from './main.component';
import { AuthGuardService } from '../../guard/auth.guard';

export const mainRoutes: Routes = [
  {
    path: 'dashboard',
    component: MainComponent,
    canActivate: [AuthGuardService],
    children: [
      {
        path: 'group/:id/:name',
        component: ChatComponent,
      },
    ],
  },
];
