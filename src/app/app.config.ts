import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { SocketService } from './socket/socket.service';
import { provideHttpClient } from '@angular/common/http';
import { mainRoutes } from './components/main/main.route';

const combinedRoutes: Routes = [...routes, ...mainRoutes];

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: SocketService, useClass: SocketService },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(combinedRoutes),
    provideClientHydration(),
    provideHttpClient(),
  ],
};
