import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { SharedService } from '../shared/services/shared.service';
import { UserSharedService } from '../shared/services/user-shared.service';
import { UserRole } from '../enums/common.enum';
import { BrowserStorageService } from '../shared/services/browser-storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService implements CanActivate {
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any,
    private sharedService: SharedService,
    private userSharedService: UserSharedService,
    private _browserStorageService: BrowserStorageService
  ) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const isUserAuthorized = this._browserStorageService.getItem('accessToken');
      if (state.url.includes('dashboard/group')) {
        this.sharedService.userRedirectUrl = state.url;
      }

      if (isUserAuthorized) {
        return true;
      } else {
        this.router.navigate(['/login']);
        return false;
      }
    } else {
      return false;
    }
  }
}
