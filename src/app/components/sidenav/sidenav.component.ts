import { Component } from '@angular/core';
import { baseUrl } from '../../environment/base-urls';
import { Router } from '@angular/router';
import { SharedService } from '../../shared/services/shared.service';
import { DialogComponent } from '../../shared/components/dialog/dialog.component';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [DialogComponent],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.css',
})
export class SidenavComponent {
  public baseUrl = baseUrl.images;
  public isShowProfile:boolean = false;
  constructor(private readonly _router: Router,private _sharedService:SharedService) {}

  onProfileClick(){
    this.isShowProfile = true;
  }

  afterDialogClose(event){
    this.isShowProfile = false;
  }

  logOut() {
    localStorage.clear();
    this._sharedService.isAlreadyGroupJoin = false;
    this._sharedService.userRedirectUrl = '';
    this._router.navigate(['/login']);
  }
}
