import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { baseUrl } from '../../environment/environment';
import { UserService } from '../../services/user.service';
import { UserList } from '../../shared/models/user.model';
import { SocketService } from '../../socket/socket.service';
import { UserSharedService } from '../../shared/services/user-shared.service';
import { SharedService } from '../../shared/services/shared.service';

@Component({
  selector: 'app-direct-message',
  standalone: true,
  imports: [],
  templateUrl: './direct-message.component.html',
  styleUrl: './direct-message.component.css',
})
export class DirectMessageComponent implements OnInit, OnDestroy, OnChanges {
  public baseUrl = baseUrl.images;
  private _socketService = inject(SocketService);
  private _sharedService = inject(SharedService);
  private _userService = inject(UserService);
  private _userSharedService = inject(UserSharedService);
  private _activeUsers: string[] = [];
  @Input() onBackButton: any;
  @Output() onUserClick = new EventEmitter<{
    userId: string;
    userName: string;
  }>();
  @Output() onAddGroupClick = new EventEmitter<boolean>();
  public userList: UserList[] = [];
  public addedUserList: UserList[] = [];
  public isAddUser: boolean = false;
  private _copyAddedUserList: UserList[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['onBackButton']) {
      if (changes['onBackButton'].currentValue?.status) {
        this.isAddUser = !changes['onBackButton'].currentValue?.status;
        const userId = this._userSharedService.userDetails.id;
        this.userList = JSON.parse(
          JSON.stringify(
            this._userService.userList.filter((ele) => ele.id !== userId)
          )
        );
      }
    }
  }

  ngOnInit(): void {
    this.enableSearch();
    this._getOnlineUsers();
    this.requestAcceptSubScription();
    // this._notification()
  }

  // private _notification(){
  //   this._.privateMessage.subscribe(id =>{

  //   })
  // }

  private _getOnlineUsers() {
    const userId = this._userSharedService.userDetails.id;
    this._socketService.handleOnlineUsers((data) => {
      this._activeUsers = data;
      this.userList = JSON.parse(
        JSON.stringify(
          this._userService.userList.filter((ele) => ele.id !== userId)
        )
      );
      this.userList.forEach((ele) => {
        if (this._activeUsers.includes(ele.id) && ele.id !== userId) {
          ele.isActiveUser = true;
        } else {
          ele.isActiveUser = false;
        }
      });
      this.userList.sort((a, b) => {
        if (a.isActiveUser && !b.isActiveUser) {
          return -1;
        } else if (!a.isActiveUser && b.isActiveUser) {
          return 1;
        }
        return 0;
      });
      const addedUsers = this._userSharedService.userDetails.addedUsers;
      this.addedUserList = this.userList.filter((ele) =>
        addedUsers.includes(ele.id)
      );
      this._copyAddedUserList = JSON.parse(JSON.stringify(this.addedUserList));
    });
    this._socketService.getOnlineUsers();
  }

  enableSearch() {
    const userId = this._userSharedService.userDetails.id;
    this._userService.userSearchTerm.subscribe((value: string) => {
      if (this.isAddUser) {
        this.userList = this._userService.userList.filter(
          (ele) =>
            ele.name
              .trim()
              .toLocaleLowerCase()
              .includes(value.trim().toLocaleLowerCase()) && ele.id !== userId
        );
      } else {
        this.addedUserList = this._copyAddedUserList.filter(
          (ele) =>
            ele.name
              .trim()
              .toLocaleLowerCase()
              .includes(value.trim().toLocaleLowerCase()) && ele.id !== userId
        );
      }
    });
  }

  redirectToAddUser() {
    this.addedUserList = JSON.parse(JSON.stringify(this._copyAddedUserList));
    const addedUsers = this._userSharedService.userDetails.addedUsers;
    const requestPending = this._userSharedService.userDetails.requestPending;
    this.userList.forEach((ele) => {
      ele.isApproved = addedUsers.includes(ele.id);
      ele.isRequestPending = requestPending.includes(ele.id);
    });
    this.isAddUser = true;
    this.onAddGroupClick.emit(true);
  }

  requestAcceptSubScription() {
    this._sharedService.requestAccept.subscribe((id) => {
      const addedUsers = this._userSharedService.userDetails.addedUsers;
      this.addedUserList = this.userList.filter((ele) =>
        addedUsers.includes(ele.id)
      );
    });
  }

  sendRequest(user) {
    const userId = this._userSharedService.userDetails.id;
    if (!user.isRequestPending) {
      this._userService.sendRequest(userId, user.id).subscribe((ele) => {
        this._socketService.sendPrivateMessage({
          type: 'notification',
          action: 'send',
          senderId: userId,
          receiverId: user.id,
        });
        this._userSharedService.userDetails.requestPending.push(user.id);
        user.isRequestPending = true;
        localStorage.setItem(
          'userDetails',
          JSON.stringify(this._userSharedService.userDetails)
        );
        this._sharedService.opnSnackBar.next('Request Send Successfully');
      });
    }
  }

  userClick(user, index) {
    this.onUserClick.emit({ userId: user.id, userName: user.name });
  }

  ngOnDestroy(): void {}
}
