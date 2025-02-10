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

@Component({
  selector: 'app-direct-message',
  standalone: true,
  imports: [],
  templateUrl: './direct-message.component.html',
  styleUrl: './direct-message.component.css',
})
export class DirectMessageComponent implements OnInit, OnDestroy,OnChanges {
  public baseUrl = baseUrl.images;
  private _socketService = inject(SocketService);
  private _userService = inject(UserService);
  private _userSharedService = inject(UserSharedService);
  private _activeUsers: string[] = [];
  @Input() onBackButton:any;
  @Output() onUserClick = new EventEmitter<{
    userId: string;
    userName: string;
  }>();
  @Output() onAddGroupClick = new EventEmitter<boolean>();
  public userList: UserList[] = [];
  public isAddUser: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['onBackButton']){
      if(changes['onBackButton'].currentValue?.status){
        this.isAddUser = !changes['onBackButton'].currentValue?.status;
      }
    }
  }

  ngOnInit(): void {
    this.search();
    this._getOnlineUsers();
  }

  private _getOnlineUsers() {
    const userId = this._userSharedService.userDetails.id;
    this._socketService.handleOnlineUsers((data) => {
      this._activeUsers = data;
      this.userList = JSON.parse(JSON.stringify(this._userService.userList));
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
    });
    this._socketService.getOnlineUsers();
  }

  search() {
    this._userService.userSearchTerm.subscribe((value: string) => {
      this.userList = this._userService.userList.filter((ele) =>
        ele.name
          .trim()
          .toLocaleLowerCase()
          .includes(value.trim().toLocaleLowerCase())
      );
    });
  }

redirectToAddUser(){
  this.isAddUser = true;
  this.onAddGroupClick.emit(true)
}

  addUser(user){
    user.isRequestPending = true;
  }

  userClick(user, index) {
    this.onUserClick.emit({ userId: user.id, userName: user.name });
  }

  ngOnDestroy(): void {}
}
