import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { baseUrl } from '../../environment/base-urls';
import { SharedService } from '../../shared/services/shared.service';
import { UserAuthService } from '../../services/user-auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  public baseUrl = baseUrl.images;
  public isSignUpPage: boolean = false;
  public isOtpPage: boolean = false;
  public otpValidatorIcon: string = 'check';
  public isLoader: boolean = false;
  private _sharedService = inject(SharedService);
  private _userAuthService = inject(UserAuthService);
  private _router = inject(Router);

  profileForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    otp: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(6),
    ]),
  });

  onSubmit() {
    if (this.isSignUpPage && !this.isOtpPage) {
      this._signUp();
    }
    if (!this.isSignUpPage && !this.isOtpPage) {
      this._login();
    }

    if (this.isOtpPage) {
      this._verifyUser();
    }
  }

  private _login() {
    const isValid =
      this.profileForm.get('email')?.valid &&
      this.profileForm.get('password')?.valid;
    if (isValid) {
      this.isLoader = true;
      const { email, password } = this.profileForm.value;
      this._userAuthService
        .userLogin({ email: email, password: password })
        .subscribe({
          next: (response: any) => {
            const authorized = { isUserAuthorized: true };
            localStorage.setItem(
              'isUserAuthorized',
              JSON.stringify(authorized)
            );
            this._sharedService.opnSnackBar.next('Login successful');
            this.isLoader = true;
            this._router.navigate(['/dashboard']);
          },
          error: (error) => {
            this._sharedService.opnSnackBar.next(error?.error.message);
            this.isLoader = false;
          },
        });
    } else {
      this._sharedService.opnSnackBar.next(
        'Please provide valid input for all required fields.'
      );
    }
  }

  private _signUp() {
    const isValid =
      this.profileForm.get('username')?.valid &&
      this.profileForm.get('email')?.valid &&
      this.profileForm.get('password')?.valid;
    if (isValid) {
      this.isLoader = true;
      const { username, email, password } = this.profileForm.value;
      this._userAuthService
        .sendVerificationCode({
          userName: username,
          email: email,
        })
        .subscribe({
          next: (response: any) => {
            this._sharedService.opnSnackBar.next(response.message);
            this.isLoader = false;
            this.isOtpPage = true;
          },
          error: (error) => {
            this._sharedService.opnSnackBar.next(error?.error.message);
            this.isLoader = false;
          },
        });
    } else {
      this._sharedService.opnSnackBar.next(
        'Please provide valid input for all required fields.'
      );
    }
  }

  private _verifyUser() {
    if (
      this.profileForm.valid &&
      this.profileForm.value.otp.toString().length === 6
    ) {
      this.otpValidatorIcon = 'cheking';
      this.isLoader = true;
      const { email, password, otp, username } = this.profileForm.value;
      this._userAuthService
        .verifyUser({
          email,
          otp,
          password,
          name: username,
        })
        .subscribe({
          next: (response: any) => {
            this._sharedService.opnSnackBar.next(response.message);
            this.isLoader = false;
            this.isSignUpPage = false;
            this.isOtpPage = false;
          },
          error: (error) => {
            this.otpValidatorIcon = 'wrong';
            this._sharedService.opnSnackBar.next(error?.error.message);
            this.isLoader = false;
          },
        });
    } else {
      this._sharedService.opnSnackBar.next(
        'OTP must be exactly 6 numeric digits.'
      );
    }
  }

  onOtpEnter(event) {
    this.otpValidatorIcon = 'lock';
    if (event.target.value.length >= 6) {
      this.otpValidatorIcon = 'verified';
      event.target.value = event.target.value.substring(0, 6);
      this.profileForm.value.otp = event.target.value;
    }
  }

  onSignUpPage() {
    this.isOtpPage = false;
    this.isSignUpPage = true;
    this.otpValidatorIcon = 'lock';
    this.profileForm.patchValue({
      otp: '',
    });
  }

  onLoginPage() {
    this.profileForm.patchValue({
      password: '',
    });
    this.isSignUpPage = false;
  }

  resendOtp() {}

  forgotPassword() {}
}
