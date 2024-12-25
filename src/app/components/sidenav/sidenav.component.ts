import { Component } from '@angular/core';
import { baseUrl } from '../../environment/base-urls';
import { Router } from '@angular/router';
import { SharedService } from '../../shared/services/shared.service';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.css',
})
export class SidenavComponent {
  public baseUrl = baseUrl.images;
  constructor(private readonly _router: Router,private _sharedService:SharedService) {}

  logOut() {
    localStorage.clear();
    this._sharedService.isAlreadyGroupJoin = false;
    this._sharedService.userRedirectUrl = '';
    this._router.navigate(['/login']);
  }
}
