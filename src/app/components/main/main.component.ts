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
import { SocketService } from '../../connection/socket.service';
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
  public isShowDialog:boolean = false
  constructor(public sharedService: SharedService, private _router: Router,
    private _userService:UserService,
    private _groupService:GroupService,
    private _socketService: SocketService,
    private _sharedService:SharedService
  ) {}

  ngOnInit(): void {
    const joinedGroupIds = this._userService.userDetails.joinedGroupIds;
    if(joinedGroupIds.length > 0){
      this._groupService.getAllJoinedGroups(joinedGroupIds).subscribe((groupData:GroupData[]) =>{
        this.groupList.push(...groupData)
        if(!this._sharedService.isAlreadyGroupJoin){
          this.groupList.forEach(ele =>{
            this._socketService.joinGroup(ele._id)
          })
        }
        this._sharedService.isAlreadyGroupJoin = true;
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
        this.groupList.push({_id:_id,name:name,description:description})
        this._userService.userDetails.adminGroupIds.push(...admins)
        this._userService.userDetails.joinedGroupIds.push(_id)
        localStorage.setItem('userDetails',JSON.stringify(this._userService.userDetails))
      })
    }
  }

  onGroupClick(item, index) {
    this._router.navigate([`dashboard/group/${item._id}/${item.name}`]);
  }

  ngOnDestroy(): void {
    this._sharedService.isAlreadyGroupJoin = false;
  }
}
