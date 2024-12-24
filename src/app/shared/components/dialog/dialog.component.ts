import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-dialog',
  imports:[ReactiveFormsModule],
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css'],
  standalone: true,
})
export class DialogComponent implements OnInit {
 public showDialog:boolean = true
  @Output() public afterDialogClose:EventEmitter<any> = new EventEmitter<any>();

  constructor(private readonly _sharedService: SharedService) {}

  public groupForm = new FormGroup({
    groupName:new FormControl('', [Validators.required]),
    description:new FormControl('')
  })

  ngOnInit(): void {}

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
    this.showDialog = false;
    this.afterDialogClose.emit({isDialogClose:true})
  }


}
