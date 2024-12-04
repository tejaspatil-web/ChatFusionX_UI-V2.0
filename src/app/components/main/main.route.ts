import { Routes } from '@angular/router';
import { ChatComponent } from '../chat/chat.component';

export const routes: Routes = [{ path: 'group/:id', component: ChatComponent }];
