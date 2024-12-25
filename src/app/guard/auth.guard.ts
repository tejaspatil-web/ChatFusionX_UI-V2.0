import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { SharedService } from '../shared/services/shared.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService implements CanActivate {
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any,
    private sharedService:SharedService
  ) {}
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const isUserAuthorized = JSON.parse(
        localStorage.getItem('isUserAuthorized') || '{}'
      );
      if(state.url.includes('dashboard/group')) this.sharedService.userRedirectUrl = state.url;
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
