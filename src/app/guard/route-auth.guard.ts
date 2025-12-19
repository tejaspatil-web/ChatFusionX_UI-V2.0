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

@Injectable({
  providedIn: 'root',
})
export class RouteAuthGuardService implements CanActivateChild {
  constructor(
    private router: Router,
    private _sharedService: SharedService,
    private _userSharedService: UserSharedService
  ) {}
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): MaybeAsync<GuardResult> {
    const userRole =
      JSON.parse(localStorage.getItem('userDetails'))?.role ||
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
