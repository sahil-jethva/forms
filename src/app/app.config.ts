import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { providePrimeNG } from 'primeng/config';
import { MyPreset } from '../assets/mytheme';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { customInterceptor } from './interceptor/custom.interceptor';
import { AuthGuardService } from './services/auth-guard.service';
import { ProtectedAuthGuardService } from './services/protected-auth-guard.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    providePrimeNG({
      theme: {
        preset: MyPreset,
      }
    }),
    provideHttpClient(withInterceptors([customInterceptor])),
    AuthGuardService,
    ProtectedAuthGuardService
  ]
};
