import { Component, OnDestroy, OnInit } from '@angular/core';
import { baseUrl } from '../../environment/environment';
import {
  SharedService,
  sideNavState,
} from '../../shared/services/shared.service';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { UserSharedService } from '../../shared/services/user-shared.service';
import { GroupService } from '../../services/group.service';
import { GroupData } from '../../shared/models/group.model';
import { SocketService } from '../../socket/socket.service';
import { DialogComponent } from '../../shared/components/dialog/dialog.component';
import { Message } from '../../shared/models/chat.model';
import { ChatService } from '../../services/chat.service';
import { DirectMessageComponent } from '../direct-message/direct-message.component';
import { UserService } from '../../services/user.service';
import { UserList } from '../../shared/models/user.model';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [RouterOutlet, DialogComponent, DirectMessageComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
})
export class MainComponent implements OnInit, OnDestroy {
  public baseUrl = baseUrl.images;
  private _groupList: GroupData[] = [];
  public copyGroupList: GroupData[] = [];
  public isShowDialog: boolean = false;
  public isShowLoader: boolean = true;
  public sideNavState: string = 'user';
  public searchValue: string = '';
  public isAddUser: boolean = false;
  public onBackButton: object = {};
  constructor(
    public sharedService: SharedService,
    private _router: Router,
    private _userSharedService: UserSharedService,
    private _groupService: GroupService,
    private _socketService: SocketService,
    private _sharedService: SharedService,
    private _chatService: ChatService,
    private _userService: UserService
  ) {
    this._socketService.socketConnection(
      this._userSharedService.userDetails.id
    );
  }

  ngOnInit(): void {
    this._checkRouteDynamic();
    this._redirectToDashboard();
    this.apiInit();
    this._requestNotificationPermission();
    this._getSideNavState();
  }

  private _checkRouteDynamic(){
    this._router.events.subscribe((event) => {
      if(event instanceof NavigationEnd &&
        event.url === '/dashboard' &&
        this.sideNavState === sideNavState.chatfusionxai
      ){
        this.sideNavState = sideNavState.user
      }
     })
  }

  private _redirectToDashboard() {
    this._router.navigate(['dashboard']);
  }

  private _getSideNavState() {
    this._sharedService.sideNavState.subscribe((state) => {
      this._router.navigate(['dashboard']);
      this.searchValue = '';
      switch (state) {
        case sideNavState.user:
          this.sideNavState = sideNavState.user;
          break;
        case sideNavState.group:
          this.sideNavState = sideNavState.group;
          this.isAddUser = false;
          break;
        case sideNavState.home:
          this.sideNavState = sideNavState.home;
          this.isAddUser = false;
          break;
        case sideNavState.chatfusionxai:
          this.sideNavState = sideNavState.chatfusionxai;
          this._router.navigate([`dashboard/AI/${this._userSharedService.userDetails.id}/${'ChatFusionXAI'}`])
          break;
        default:
          this.sideNavState = '';
      }
    });
  }

  private async _getUser() {
    const userDetails = localStorage.getItem('userDetails');
    if (userDetails) {
      const parseUserDetails = JSON.parse(userDetails);
      const response = await lastValueFrom(
        this._userService.getUser(parseUserDetails.id)
      );
      this._userSharedService.userDetails = response;
      localStorage.setItem('userDetails', JSON.stringify(response));
    }
  }

  private async _getAllUsers() {
    await new Promise((resolve, reject) => {
      this._userService.getAllUsers().subscribe({
        next: (users: UserList[]) => {
          this._userService.userList = users;
          resolve(users);
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  }

  private async apiInit() {
    const joinedGroupIds = this._userSharedService.userDetails.joinedGroupIds;
    const redirectUrl = this.sharedService.userRedirectUrl;
    if (redirectUrl && redirectUrl.includes('dashboard/group')) {
      await this._joinUserToNewGroup(joinedGroupIds, redirectUrl);
    }
    this.isShowLoader = true;
    await this._joinPrivateChat();
    await this._getUser();
    await this._getAllUsers();
    if (joinedGroupIds.length > 0) {
      this._fetchDataAndJoinGroups(joinedGroupIds);
    } else {
      this.isShowLoader = false;
    }
    this._receivedGroupMessages();
    this._receivedPrivateMessages();
  }

  private async _joinPrivateChat(){
    this._socketService.joinPrivateChat(this._userSharedService.userDetails.id);
  }

  private _fetchDataAndJoinGroups(joinedGroupIds) {
    this.isShowLoader = true;
    this._groupService
      .getAllJoinedGroups(joinedGroupIds)
      .subscribe((groupData: GroupData[]) => {
        groupData.forEach((group) => {
          group.unreadCount = 0;
          if (group.messages.length > 0) {
            const lastMessageIndex = group.messages.length - 1;
            group.lastMessageTime = group.messages[lastMessageIndex].time;
          }
        });
        this._groupList = JSON.parse(JSON.stringify(groupData));
        this._userSharedService.groupData = JSON.parse(
          JSON.stringify(groupData)
        );
        if (!this._sharedService.isAlreadyGroupJoin) {
          const groupIds = this._groupList.map((ele) => ele._id);
          this._socketService.joinGroups(groupIds);
        }
        this.copyGroupList = JSON.parse(JSON.stringify(this._groupList));
        this._sharedService.isAlreadyGroupJoin = true;
        this.isShowLoader = false;
      });
  }

  private async _joinUserToNewGroup(joinedGroupIds, redirectUrl) {
    const groupId = redirectUrl.split('/')[3];
    const isUserAlreadyJoinedGroup = joinedGroupIds.includes(groupId);
    if (!isUserAlreadyJoinedGroup) {
      this.sideNavState = sideNavState.group;
      await new Promise((resolve, reject) => {
        this._groupService
          .joinGroup({
            userId: this._userSharedService.userDetails.id,
            groupId: groupId,
          })
          .subscribe({
            next: (response: GroupData) => {
              this._userSharedService.userDetails.joinedGroupIds.push(
                response._id
              );
              localStorage.setItem(
                'userDetails',
                JSON.stringify(this._userSharedService.userDetails)
              );
              this._sharedService.userRedirectUrl = '';
              this.sharedService.opnSnackBar.next(
                `User has been added to the group: ${response.name}`
              );
              resolve(response);
            },
            error: (error) => {
              reject(error);
            },
          });
      });
    }
  }

  private _receivedGroupMessages() {
    this._socketService.onMessageReceived((message: Message) => {
      const activatedGroupId = this._sharedService.activatedGroupId;
      if (message.groupId === activatedGroupId) {
        this._chatService.setMessage(message);
        const groups = [
          this._userSharedService.groupData,
          this._groupList,
          this.copyGroupList,
        ];
        groups.forEach((groupList) => {
          const group = this._findGroup(groupList, message.groupId);
          if (group) {
            group.lastMessageTime = message.time;
          }
        });
      } else {
        const groups = [
          this._userSharedService.groupData,
          this._groupList,
          this.copyGroupList,
        ];
        if (!this._sharedService.isMobile) this._showNotification(message);
        groups.forEach((groupList) => {
          const group = this._findGroup(groupList, message.groupId);
          if (group) {
            group.unreadCount++;
            group.lastMessageTime = message.time;
            group.messages.push({
              userId: message.userId,
              userName: message.userName,
              time: message.time,
              message: message.message,
            });
          }
        });
      }
    });
  }

  private _receivedPrivateMessages(){
    this._socketService.receivedPrivateMessage(message =>{
      this._chatService.privateMessage.next(message)
    })

    this._socketService.receivedPrivateNotification((message)=>{
      if(message.type === 'notification'){
        switch(message.action){
          case 'send':
            this._userSharedService.userDetails.requests.push(message.senderId)
            break;
          case 'approve':
            this._userSharedService.userDetails.addedUsers.push(message.senderId);
            break;
          case 'reject':
            const requestPending = this._userSharedService.userDetails.requestPending
            this._userSharedService.userDetails.requestPending = requestPending.filter(ele => ele !== message.senderId)
            break;
        }
      }
      this._chatService.privateMessage.next(message)
    })
  }

  checkRoute() {
    const isGroupOrUserState =  ['user', 'group'].some((keyword) => this._router.url.includes(keyword))
    if(isGroupOrUserState){
      if(this.sideNavState === sideNavState.group){
        this.copyGroupList = JSON.parse(JSON.stringify(this._groupList));
      }
      return true;
    }else if(this.sideNavState === sideNavState.chatfusionxai){
      return true;
    }else{
      return false;
    }
  }

  addGroup() {
    this.isShowDialog = true;
  }

  afterDialogClose(event) {
    this.isShowDialog = false;
    if (event.isGroupCreated) {
      const { id } = this._userSharedService.userDetails;
      this._groupService
        .createGroup({
          name: event.groupName,
          userId: id,
          description: event.description,
        })
        .subscribe((ele: any) => {
          const { _id, name, description, admins } = ele.response;
          const newGroup = {
            _id: _id,
            name: name,
            unreadCount: 0,
            lastMessageTime: '',
            description: description,
            messages: [],
          };
          this._groupList.unshift(newGroup);
          this.copyGroupList = JSON.parse(JSON.stringify(this._groupList));
          this._userSharedService.groupData.unshift(newGroup);
          this._userSharedService.userDetails.adminGroupIds.push(...admins);
          this._userSharedService.userDetails.joinedGroupIds.push(_id);
          this._socketService.joinGroups([_id]);
          localStorage.setItem(
            'userDetails',
            JSON.stringify(this._userSharedService.userDetails)
          );
        });
    }
  }

  search(event) {
    this.searchValue = event.target.value;
    if (this.sideNavState === 'user') {
      this._userService.userSearchTerm.next(this.searchValue);
    } else if (this.sideNavState === 'group') {
      this.copyGroupList = this._groupList.filter((ele) =>
        ele.name
          .trim()
          .toLocaleLowerCase()
          .includes(this.searchValue.trim().toLocaleLowerCase())
      );
    }
  }

  private _findGroup(groupData: GroupData[], groupId) {
    const group = groupData.find((ele) => ele._id === groupId);
    return group;
  }

  onAddGroupClick(event) {
    this.isAddUser = event;
    this._router.navigate([`dashboard`]);
  }

  onUserClick(event) {
    this._router.navigate([`dashboard/user/${event.userId}/${event.userName}`]);
  }

  onBackButtonClick() {
    this.isAddUser = false;
    this.onBackButton = {
      status: true,
    };
  }

  onGroupClick(item, index) {
    const groups = [
      this._userSharedService.groupData,
      this._groupList,
      this.copyGroupList,
    ];
    groups.forEach((groupList) => {
      const group = this._findGroup(groupList, item._id);
      if (group) {
        group.unreadCount = 0;
        if (group.messages.length > 0) {
          const lastMessageIndex = group.messages.length - 1;
          group.lastMessageTime = group.messages[lastMessageIndex].time;
        }
      }
    });
    this._router.navigate([`dashboard/group/${item._id}/${item.name}`]);
  }

  // Notification Section
  private _requestNotificationPermission() {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        console.log('Notification permission:', permission);
      });
    }
  }

  private _showNotification(message: Message) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const group = this._userSharedService.groupData.find(
        (ele) => ele._id === message.groupId
      );
      const title = `${group.name || ''} New Message`;
      const body = `${message.userName}: ${message.message}`;
      const options: NotificationOptions = {
        body,
        icon: `${this.baseUrl}logo.`,
      };
      const notificationInstance = new Notification(title, options);
      notificationInstance.onclick = () => {
        this._router.navigate(['dashboard']);
      };
    }
  }

  ngOnDestroy(): void {
    this._sharedService.isAlreadyGroupJoin = false;
    this._socketService.offMessageReceived();
  }
}
