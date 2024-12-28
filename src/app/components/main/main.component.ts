import { Component, OnDestroy, OnInit } from '@angular/core';
import { baseUrl } from '../../environment/base-urls';
import { SharedService } from '../../shared/services/shared.service';
import {
  Router,
  RouterOutlet,
} from '@angular/router';
import { UserService } from '../../shared/services/user-shared.service';
import { GroupService } from '../../services/group.service';
import { GroupData } from '../../shared/models/group.model';
import { SocketService } from '../../socket/socket.service';
import { DialogComponent } from '../../shared/components/dialog/dialog.component';
import { Message } from '../../shared/models/chat.model';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [RouterOutlet,DialogComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
})
export class MainComponent implements OnInit,OnDestroy{
  public baseUrl = baseUrl.images;
  private _groupList:GroupData[] = [];
  public copyGroupList:GroupData[] = [];
  public isShowDialog:boolean = false;
  public isShowLoader:boolean = true;
  constructor(public sharedService: SharedService, private _router: Router,
    private _userService:UserService,
    private _groupService:GroupService,
    private _socketService: SocketService,
    private _sharedService:SharedService,
    private _chatService:ChatService
  ) {}

  ngOnInit(): void {
    this.groupInit()
    this._requestNotificationPermission()
  }


private async groupInit(){
  const joinedGroupIds = this._userService.userDetails.joinedGroupIds;
  const redirectUrl = this.sharedService.userRedirectUrl;
  if(redirectUrl && redirectUrl.includes('dashboard/group')){
   await this._joinUserToNewGroup(joinedGroupIds,redirectUrl)
  }
  if(joinedGroupIds.length > 0){
    this._fetchDataAndJoinGroups(joinedGroupIds)
  }else{
    this.isShowLoader = false;
  }
  this._receivedGroupMessages();
}

 private _fetchDataAndJoinGroups(joinedGroupIds){
  this.isShowLoader = true;
  this._groupService.getAllJoinedGroups(joinedGroupIds).subscribe((groupData:GroupData[]) =>{
    groupData.forEach(group => {
      group.unreadCount = 0;
      if(group.messages.length > 0){
         const lastMessageIndex = group.messages.length - 1
         group.lastMessageTime = group.messages[lastMessageIndex].time
      }
    })
    this._groupList = JSON.parse(JSON.stringify(groupData));
    this._userService.groupData = JSON.parse(JSON.stringify(groupData));
    if(!this._sharedService.isAlreadyGroupJoin){
      const groupIds = this._groupList.map(ele => (ele._id));
        this._socketService.joinGroups(groupIds);
    }
    this.copyGroupList = JSON.parse(JSON.stringify(this._groupList));
    this._sharedService.isAlreadyGroupJoin = true;
    this.isShowLoader = false;
  })
 }


  private async _joinUserToNewGroup(joinedGroupIds,redirectUrl){
    const groupId = redirectUrl.split('/')[3];
    const isUserAlreadyJoinedGroup = joinedGroupIds.includes(groupId);
    if(!isUserAlreadyJoinedGroup){
    await new Promise((resolve,reject)=>{
      this._groupService.joinGroup({userId:this._userService.userDetails.id,groupId:groupId}
      ).subscribe({
        next:(response:GroupData) =>{
        this._userService.userDetails.joinedGroupIds.push(response._id)
        localStorage.setItem('userDetails',JSON.stringify(this._userService.userDetails))
        this._sharedService.userRedirectUrl = '';
        this.sharedService.opnSnackBar.next(`User has been added to the group: ${response.name}`);
        this._router.navigate(['dashboard'])
        resolve(response);
      },error:(error)=>{
        this._router.navigate(['dashboard'])
        reject(error)
      }
    })
    })
    }
  }

    private _receivedGroupMessages(){
      this._socketService.onMessageReceived((message:Message) => {
        const activatedGroupId = this._sharedService.activatedGroupId;
        if(message.groupId === activatedGroupId){
          this._chatService.setMessage(message);
          const groups = [this._userService.groupData,this._groupList,this.copyGroupList]
          groups.forEach(groupList => {
            const group = this._findGroup(groupList, message.groupId);
            if (group) {
              group.lastMessageTime = message.time
            }})
        }else{
          const groups = [this._userService.groupData,this._groupList,this.copyGroupList]
          if(!this._sharedService.isMobile) this._showNotification(message);
          groups.forEach(groupList => {
            const group = this._findGroup(groupList, message.groupId);
            if (group) {
              group.unreadCount++;
              group.lastMessageTime = message.time
              group.messages.push({
                userId:message.userId,
                userName:message.userName,
                time:message.time,
                message:message.message
              })
            }
          });
        }
      });
    }

  checkRoute() {
    if(this._router.url.includes('group')){
      this.copyGroupList = JSON.parse(JSON.stringify(this._groupList));
      return true
    }else{
      return false
    }
  }

  addGroup() {
    this.isShowDialog = true
  }

  afterDialogClose(event){
    this.isShowDialog = false
    if(event.isGroupCreated){
      const { id } = this._userService.userDetails
      this._groupService.createGroup(
        {name:event.groupName,userId:id,description:event.description}
        ).subscribe((ele:any) =>{
        const {_id,name,description,admins} = ele.response
        const newGroup = {_id:_id,name:name,unreadCount:0,lastMessageTime:'',description:description,messages:[]}
        this._groupList.unshift(newGroup);
        this.copyGroupList = JSON.parse(JSON.stringify(this._groupList));
        this._userService.groupData.unshift(newGroup);
        this._userService.userDetails.adminGroupIds.push(...admins)
        this._userService.userDetails.joinedGroupIds.push(_id)
        this._socketService.joinGroups([_id]);
        localStorage.setItem('userDetails',JSON.stringify(this._userService.userDetails))
      })
    }
  }

  searchGroup(event){
    const inputValue = event.target.value
    this.copyGroupList = this._groupList.filter(ele =>(
       ele.name.trim().toLocaleLowerCase().includes(inputValue.trim().toLocaleLowerCase())
    ))
  }

  private _findGroup(groupData:GroupData[],groupId){
    const group = groupData.find(ele => ele._id === groupId);
   return group;
  }

  onGroupClick(item, index) {
    const groups = [this._userService.groupData,this._groupList,this.copyGroupList]
    groups.forEach(groupList => {
      const group = this._findGroup(groupList, item._id);
      if (group) {
        group.unreadCount = 0;
        if(group.messages.length > 0){
          const lastMessageIndex = group.messages.length - 1
          group.lastMessageTime = group.messages[lastMessageIndex].time
        }
      }
    });
    this._router.navigate([`dashboard/group/${item._id}/${item.name}`])
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
      const group = this._userService.groupData.find(ele => ele._id === message.groupId)
      const title = `${group.name || ''} New Message`;
      const body = `${message.userName}: ${message.message}`;
      const options: NotificationOptions = {
        body,
        icon: `${this.baseUrl}logo.`
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
