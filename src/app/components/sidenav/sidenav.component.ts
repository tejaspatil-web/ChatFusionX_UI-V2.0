import { Component, HostListener } from '@angular/core';
import { baseUrl } from '../../environment/environment';
import { Router } from '@angular/router';
import { SharedService, sideNavState } from '../../shared/services/shared.service';
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
  public isNotifications:boolean = false;
  constructor(private readonly _router: Router,private _sharedService:SharedService) {}


  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    this.isNotifications = false;
  }

  onProfileClick(){
    this.isShowProfile = true;
  }

  onDmIconClick(){
    this._sharedService.sideNavState.next(sideNavState.user)
  }

  onGroupIconClick(){
    this._sharedService.sideNavState.next(sideNavState.group)
  }

  onNotificationClick(){
      this.isNotifications = !this.isNotifications;
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
