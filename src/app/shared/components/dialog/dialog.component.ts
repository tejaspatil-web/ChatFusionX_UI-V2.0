import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { baseUrl } from '../../../environment/base-urls';
import { UserService } from '../../services/user-shared.service';

@Component({
  selector: 'app-dialog',
  imports:[ReactiveFormsModule],
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css'],
  standalone: true,
})
export class DialogComponent implements OnInit {
  public baseUrl = baseUrl.images;
  @Input() public isShowDialog:boolean = false;
  @Input() public isShowLoader:boolean = false;
  @Input() public isShowProfile:boolean = false;
  @Output() public afterDialogClose:EventEmitter<any> = new EventEmitter<any>();
  public groupForm = new FormGroup({
    groupName:new FormControl('', [Validators.required]),
    description:new FormControl('')
  })
  public userName:string = ''
  public userEmail:string = ''

  constructor(private readonly _sharedService: SharedService,
    private readonly _userService:UserService
  ) {}
  ngOnInit(): void {
    this.userName = this._userService.userDetails.email
    this.userEmail = this._userService.userDetails.email
  }

  onSubmit(){}

  createGroup(){
    if(this.groupForm.valid){
      this.afterDialogClose.emit({isGroupCreated:true,...this.groupForm.value})
    }else{
      this._sharedService.opnSnackBar.next(
        'Please provide valid input for all required fields.'
      );
    }
  }

  closeDialog(): void {
    this.isShowDialog = false;
    this.isShowProfile = false;
    this.afterDialogClose.emit({isDialogClose:true})
  }


}
