import { Routes } from '@angular/router';
import { ChatComponent } from '../chat/chat.component';
import { MainComponent } from './main.component';

export const mainRoutes: Routes = [
  {
    path: 'dashboard',
    component: MainComponent,
    children: [
      {
        path: 'group/:id',
        component: ChatComponent,
      },
    ],
  },
];
