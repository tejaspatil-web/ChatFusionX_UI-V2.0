import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  GuardResult,
  MaybeAsync,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { SharedService, sideNavState } from '../shared/services/shared.service';
import { UserSharedService } from '../shared/services/user-shared.service';
import { UserRole } from '../enums/common.enum';
import { BrowserStorageService } from '../shared/services/browser-storage.service';

@Injectable({
  providedIn: 'root',
})
export class RouteAuthGuardService implements CanActivateChild {
  constructor(
    private _sharedService: SharedService,
    private _userSharedService: UserSharedService,
    private _browserStorageService: BrowserStorageService
  ) {}
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): MaybeAsync<GuardResult> {
    const userDetails = this._browserStorageService.getItem('userDetails');
    const userRole =
      (userDetails ? JSON.parse(userDetails)?.role : null) ||
      this._userSharedService.userDetails.role;

    if (state.url.includes('admin-panel')) {
      if (userRole === UserRole.ADMIN) {
        return true;
      } else {
        this._sharedService.sideNavState.next(sideNavState.user);
      }
    }
    return true;
  }
}
