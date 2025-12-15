import {
  Component,
  EventEmitter,
  input,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { SharedService } from '../../services/shared.service';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { baseUrl } from '../../../environment/environment';
import { UserSharedService } from '../../services/user-shared.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-dialog',
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css'],
  standalone: true,
})
export class DialogComponent implements OnInit {
  public baseUrl = baseUrl.images;
  @Input() public isShowDialog: boolean = false;
  @Input() public isShowLoader: boolean = false;
  @Input() public isShowProfile: boolean = false;
  @Input() public isShowSetting: boolean = false;
  @Output() public afterDialogClose: EventEmitter<any> =
    new EventEmitter<any>();
  public groupForm = new FormGroup({
    groupName: new FormControl('', [Validators.required]),
    description: new FormControl(''),
  });
  private _userId: string = '';
  public userName: string = '';
  public userEmail: string = '';
  public oldPassword: string = '';
  public newPassword: string = '';
  public confirmPassword: string = '';
  private _selectedProfile: File;
  public imagePreviewUrl: string | ArrayBuffer;
  public isPasswordSet: boolean = false;

  constructor(
    private readonly _sharedService: SharedService,
    private readonly _userSharedService: UserSharedService,
    private readonly _userService: UserService
  ) {}
  ngOnInit(): void {
    this.userName = this._userSharedService.userDetails.name;
    this.userEmail = this._userSharedService.userDetails.email;
    this._userId = this._userSharedService.userDetails.id;

    this.imagePreviewUrl =
      this._userSharedService.userDetails.profileUrl ||
      baseUrl.images + 'avatar.png';

    this.isPasswordSet =
      this._userSharedService.userDetails.isPasswordSet ||
      localStorage.getItem('isPasswordSet') === 'true';
  }

  onSubmit() {}

  createGroup() {
    if (this.groupForm.valid) {
      this.afterDialogClose.emit({
        isGroupCreated: true,
        ...this.groupForm.value,
      });
    } else {
      this._sharedService.opnSnackBar.next(
        'Please provide valid input for all required fields.'
      );
    }
  }

  updatePassword() {
    const requiredFields = !this.isPasswordSet
      ? [this.newPassword, this.confirmPassword]
      : [this.oldPassword, this.newPassword, this.confirmPassword];

    if (requiredFields.some((field) => !field)) {
      this._sharedService.opnSnackBar.next(
        'All required fields must be filled in.'
      );
      return;
    }

    if (this.oldPassword === this.newPassword) {
      this._sharedService.opnSnackBar.next(
        'New password must be different from the old password.'
      );
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this._sharedService.opnSnackBar.next(
        'New password and confirmation do not match.'
      );
      return;
    }

    this._userService
      .updatePassword(this._userId, this.oldPassword, this.newPassword)
      .subscribe({
        next: (res: any) => {
          this._sharedService.opnSnackBar.next(res?.message);
          localStorage.setItem('isPasswordSet', JSON.stringify(true));
          this.isPasswordSet = true;
          this.closeDialog();
        },
        error: (error) => {
          this._sharedService.opnSnackBar.next(error?.error?.message);
        },
      });
  }

  onFileSelected(event) {
    const input = event.target as HTMLInputElement;
    this._selectedProfile = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreviewUrl = reader.result;
    };
    reader.readAsDataURL(this._selectedProfile);
  }

  updateProfileDetails() {
    if (
      this._selectedProfile ||
      this.userName !== this._userSharedService.userDetails.name
    ) {
      this._userService
        .updateProfile(this._selectedProfile, this._userId, this.userName)
        .subscribe((res: any) => {
          const userDetails = localStorage.getItem('userDetails');
          if (userDetails) {
            const parseUserDetails = JSON.parse(userDetails);
            if (res.url !== '') parseUserDetails.profileUrl = res.url;
            parseUserDetails.name = this.userName;
            localStorage.setItem(
              'userDetails',
              JSON.stringify(parseUserDetails)
            );
          }
          if (res.url !== '')
            this._userSharedService.userDetails.profileUrl = res.url;
          this._userSharedService.userDetails.name = this.userName;
          this._sharedService.getUpdatedProfileUrl.next(res.url);
          this._sharedService.opnSnackBar.next('Profile updated successfully');
          this.closeDialog();
        });
    } else {
      this._sharedService.opnSnackBar.next('No changes detected');
    }
  }

  closeDialog(): void {
    this.isShowDialog = false;
    this.isShowProfile = false;
    this.isShowSetting = false;
    this.afterDialogClose.emit({ isDialogClose: true });
  }
}
