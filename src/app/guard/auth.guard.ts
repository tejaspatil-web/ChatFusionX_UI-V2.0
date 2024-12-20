import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService implements CanActivate {
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}
  canActivate(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const isUserAuthorized = JSON.parse(
        localStorage.getItem('isUserAuthorized') || '{}'
      );

      if (isUserAuthorized?.isUserAuthorized) {
        return true;
      } else {
        this.router.navigate(['/login']);
        return false;
      }
    } else {
      console.error('localStorage is not available during SSR');
      this.router.navigate(['/login']);
      return false;
    }
  }
}
