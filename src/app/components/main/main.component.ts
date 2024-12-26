import { Component, OnDestroy, OnInit } from '@angular/core';
import { baseUrl } from '../../environment/base-urls';
import { ChatComponent } from '../chat/chat.component';
import { SharedService } from '../../shared/services/shared.service';
import {
  ActivatedRoute,
  provideRouter,
  Router,
  RouterOutlet,
} from '@angular/router';
import { UserService } from '../../shared/services/user-shared.service';
import { GroupService } from '../../services/group.service';
import { GroupData } from '../../shared/models/group.model';
import { SocketService } from '../../socket/socket.service';
import { DialogComponent } from '../../shared/components/dialog/dialog.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [RouterOutlet,DialogComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
})
export class MainComponent implements OnInit,OnDestroy{
  public baseUrl = baseUrl.images;
  public groupList:GroupData[] = [];
  public isShowDialog:boolean = false;
  public isShowLoader:boolean = true;
  constructor(public sharedService: SharedService, private _router: Router,
    private _userService:UserService,
    private _groupService:GroupService,
    private _socketService: SocketService,
    private _sharedService:SharedService
  ) {}

  ngOnInit(): void {
    const joinedGroupIds = this._userService.userDetails.joinedGroupIds;
    const redirectUrl = this.sharedService.userRedirectUrl
    if(redirectUrl && redirectUrl.includes('dashboard/group')){
      this._joinUserToNewGroup(joinedGroupIds,redirectUrl)
    }
    if(joinedGroupIds.length > 0){
      this._fetchDataAndJoinGroups(joinedGroupIds)
    }
  }

 private _fetchDataAndJoinGroups(joinedGroupIds){
  this.isShowLoader = true;
  this._groupService.getAllJoinedGroups(joinedGroupIds).subscribe((groupData:GroupData[]) =>{
    this.groupList.push(...groupData)
    this._userService.groupData = groupData;
    if(!this._sharedService.isAlreadyGroupJoin){
      this.groupList.forEach(ele =>{
        this._socketService.joinGroup(ele._id)
      })
    }
    this._sharedService.isAlreadyGroupJoin = true;
    this.isShowLoader = false;
  })
 }


  private _joinUserToNewGroup(joinedGroupIds,redirectUrl){
    const groupId = redirectUrl.split('/')[3];
    const isUserAlreadyJoinedGroup = joinedGroupIds.includes(groupId);
    if(!isUserAlreadyJoinedGroup){
      this._groupService.joinGroup({userId:this._userService.userDetails.id,groupId:groupId}
      ).subscribe((response:GroupData) =>{
        this.groupList.push({_id:response._id,name:response.name,description:response.description,messages:response.messages})
        this._userService.userDetails.joinedGroupIds.push(response._id)
        localStorage.setItem('userDetails',JSON.stringify(this._userService.userDetails))
        this._sharedService.userRedirectUrl = '';
        this.sharedService.opnSnackBar.next(`User has been added to the group: ${response.name}`);
      })
    }
  }

  checkRoute() {
    return this._router.url.includes('group');
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
        const newGroup = {_id:_id,name:name,description:description,messages:[]}
        this.groupList.push(newGroup);
        this._userService.groupData.push(newGroup);
        this._userService.userDetails.adminGroupIds.push(...admins)
        this._userService.userDetails.joinedGroupIds.push(_id)
        localStorage.setItem('userDetails',JSON.stringify(this._userService.userDetails))
      })
    }
  }

  onGroupClick(item, index) {
    this._router.navigate([`dashboard/group/${item._id}/${item.name}`])
  }

  ngOnDestroy(): void {
    this._sharedService.isAlreadyGroupJoin = false;
  }
}
