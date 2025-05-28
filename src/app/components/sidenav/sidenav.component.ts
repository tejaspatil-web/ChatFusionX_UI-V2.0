import { Component, HostListener, OnInit } from '@angular/core';
import { baseUrl } from '../../environment/environment';
import { Router } from '@angular/router';
import { SharedService, sideNavState } from '../../shared/services/shared.service';
import { DialogComponent } from '../../shared/components/dialog/dialog.component';
import { UserSharedService } from '../../shared/services/user-shared.service';
import { UserService } from '../../services/user.service';
import { SocketService } from '../../socket/socket.service';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [DialogComponent],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.css',
})
export class SidenavComponent implements OnInit {
  public baseUrl = baseUrl.images;
  public isShowProfile:boolean = false;
  public isShowSetting:boolean = false;
  public isNotifications:boolean = false;
  public requests = [];
  constructor(private readonly _router: Router,
    private _sharedService:SharedService,
    private _userSharedService:UserSharedService,
    private _userService:UserService,
    private _socketService:SocketService,
    private _chatService:ChatService
  ) {}

  ngOnInit(): void {
    this._chatService.getPrivateMessage().subscribe(ele =>{
      if(ele.type === 'notification'){
        const requests = this._userSharedService.userDetails.requests;
        const usersList  = JSON.parse(JSON.stringify(this._userService.userList));
        this.requests = usersList.filter(ele => requests.includes(ele.id));
      }
    })
  }


  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    this.isNotifications = false;
  }

  onProfileClick(){
    this.isShowProfile = true;
    this.isShowSetting = false;
  }

  onDmIconClick(){
    this._sharedService.sideNavState.next(sideNavState.user)
  }

  onGroupIconClick(){
    this._sharedService.sideNavState.next(sideNavState.group)
  }

  onHomeClick(){
    this._router.navigate(['/dashboard'])
  }

  onNotificationClick(){
    const requests = this._userSharedService.userDetails.requests;
    const usersList  = JSON.parse(JSON.stringify(this._userService.userList));
    this.requests = usersList.filter(ele => requests.includes(ele.id));
    this.isNotifications = !this.isNotifications;
  }

  onSettingClick(){
    this.isShowProfile = false;
    this.isShowSetting = true;
  }

  acceptRequest(request){
    const userId = this._userSharedService.userDetails.id;
    this._userService.acceptRequest(userId,request.id).subscribe(ele =>{
      this.requests = this.requests.filter(ele => ele.id !== request.id)
      this._userSharedService.userDetails.addedUsers.push(request.id);
      this._userSharedService.userDetails.requests = [...this.requests]
      localStorage.setItem(
        'userDetails',
        JSON.stringify(this._userSharedService.userDetails)
      );
      this._sharedService.requestAccept.next(request.id);
      this._socketService.sendPrivateMessage({type:'notification',action:'approve',senderId:userId,receiverId:request.id})
      this._sharedService.opnSnackBar.next('Request accepted');
    })
  }

  rejectRequest(request){
    const userId = this._userSharedService.userDetails.id;
   this._userService.rejectRequest(userId,request.id).subscribe(ele =>{
    this.requests = this.requests.filter(ele => ele.id !== request.id);
    this._userSharedService.userDetails.requests = [...this.requests]
    this._socketService.sendPrivateMessage({type:'notification',action:'reject',senderId:userId,receiverId:request.id})
    localStorage.setItem(
      'userDetails',
      JSON.stringify(this._userSharedService.userDetails)
    );
   })
  }

  onChatFusionXAiClick(){
    this._sharedService.sideNavState.next(sideNavState.chatfusionxai)
  }

  afterDialogClose(event){
    this.isShowProfile = false;
    this.isShowSetting = false;
  }


  logOut() {
    localStorage.clear();
    this._socketService.disconnect();
    this._sharedService.isLoggedOut = true;
    this._sharedService.isAlreadyGroupJoin = false;
    this._sharedService.userRedirectUrl = '';
    this._router.navigate(['/login']);
  }
}
