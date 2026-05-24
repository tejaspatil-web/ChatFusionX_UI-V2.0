import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { SocketService } from './socket/socket.service';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { mainRoutes } from './components/main/main.route';
import { AuthInterceptor } from './interceptors/auth.Interceptor';

const combinedRoutes: Routes = [...routes, ...mainRoutes];

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: SocketService, useClass: SocketService },
    provideZoneChangeDetection({
      eventCoalescing: true,
      runCoalescing: true,
    }),
    provideRouter(combinedRoutes),
    provideClientHydration(),
    provideHttpClient(
      withFetch(),
      withInterceptorsFromDi()
    ),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
};
