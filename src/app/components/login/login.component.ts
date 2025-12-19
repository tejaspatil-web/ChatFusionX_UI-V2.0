import { Component, inject, OnInit, ViewChild } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { baseUrl } from '../../environment/environment';
import { SharedService } from '../../shared/services/shared.service';
import { UserAuthService } from '../../services/user-auth.service';
import { Router } from '@angular/router';
import { UserSharedService } from '../../shared/services/user-shared.service';
import { UserDetails } from '../../shared/models/user.model';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { TextExtractionService } from '../../services/text-extraction.service';
import { GoogleAuthService } from '../../services/google-auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, LoaderComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  public baseUrl = baseUrl.images;
  public isSignUpPage: boolean = false;
  public isOtpPage: boolean = false;
  public otpValidatorIcon: string = 'check';
  public isLoader: boolean = false;
  public isResendOtpDisable: boolean = false;
  public isForgotPassword: boolean = false;
  public isLoading: boolean = false;
  public isGoogleLoginLoader: boolean = false;

  @ViewChild(LoaderComponent) loader!: LoaderComponent;

  // Services
  private _sharedService = inject(SharedService);
  private _userAuthService = inject(UserAuthService);
  private _userSharedService = inject(UserSharedService);
  private _testExtractionService = inject(TextExtractionService);
  private _googleAuthService = inject(GoogleAuthService);
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

  constructor() {
    if (!this._sharedService.isLoggedOut) {
      this._checkServerStatus();
    }
  }

  async ngOnInit() {
    // Load Google SDK
    await this._googleAuthService.loadGoogleScript();

    // Initialize token client
    this._googleAuthService.initTokenClient((token: string) => {
      this._handleGoogleLogin(token);
    });
  }

  private _checkServerStatus() {
    this.isLoading = true;
    this._sharedService.getServerStatus().subscribe((ele) => {
      this.loader.completeLoading();
      setTimeout(() => {
        this.isLoading = false;
      }, 500);
    });
    this._callTextExtractionService();
    this._callPdfToPngConversionService();
  }

  private _callTextExtractionService() {
    const imagePath = 'images/logo.png';
    fetch(imagePath)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], 'logo.png', { type: blob.type });
        this._testExtractionService.textExtraction(file).subscribe();
      });
  }

  private _callPdfToPngConversionService() {
    const pdfPath = 'files/blank.pdf';
    fetch(pdfPath)
      .then((res) => res.blob())
      .then((blob) => {
        const pdfFile = new File([blob], 'blank.pdf', { type: blob.type });
        this._testExtractionService.pdfToPngConversion(pdfFile).subscribe();
      });
  }

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

  private _handleGoogleLogin(token) {
    this.isGoogleLoginLoader = true;
    this._googleAuthService.googleLogin(token).subscribe({
      next: (response: UserDetails) => {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem(
          'isPasswordSet',
          JSON.stringify(response.isPasswordSet)
        );
        localStorage.setItem('userDetails', JSON.stringify(response));
        this._userSharedService.userDetails = new UserDetails(
          response.name,
          response.email,
          response.id,
          response.adminGroupIds,
          response.joinedGroupIds,
          response.requestPending || [],
          response.requests || [],
          response.addedUsers || [],
          response.profileUrl || '',
          response.isPasswordSet,
          response.accessToken || '',
          response.role || 'user'
        );
        this.isGoogleLoginLoader = false;
        this._sharedService.opnSnackBar.next('Login successful');
        this._router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isGoogleLoginLoader = false;
        this._sharedService.opnSnackBar.next('Failed to login');
      },
    });
  }

  public googleLogin() {
    this._googleAuthService.requestAccessToken();
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
          next: (response: UserDetails) => {
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem(
              'isPasswordSet',
              JSON.stringify(response.isPasswordSet)
            );
            localStorage.setItem('userDetails', JSON.stringify(response));
            this._userSharedService.userDetails = new UserDetails(
              response.name,
              response.email,
              response.id,
              response.adminGroupIds,
              response.joinedGroupIds,
              response.requestPending || [],
              response.requests || [],
              response.addedUsers || [],
              response.profileUrl || '',
              response.isPasswordSet,
              response.accessToken || '',
              response.role || 'user'
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
      const { username, email } = this.profileForm.value;
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
    if (!this.isForgotPassword) {
      this.isOtpPage = false;
      this.isSignUpPage = true;
      this.otpValidatorIcon = 'lock';
      this.profileForm.patchValue({
        otp: '',
      });
    }
  }

  onLoginPage() {
    this.profileForm.patchValue({
      password: '',
    });
    this.isSignUpPage = false;
  }

  resendOtp() {
    if (this.isResendOtpDisable) {
      this._sharedService.opnSnackBar.next('Please wait a few seconds...');
      return;
    }

    this.isResendOtpDisable = true;
    setTimeout(() => {
      this.isResendOtpDisable = false;
    }, 10000);

    const { username, email } = this.profileForm.value;
    this._userAuthService
      .sendVerificationCode({
        userName: username,
        email: email,
      })
      .subscribe({
        next: (response: any) => {
          this._sharedService.opnSnackBar.next(response.message);
        },
        error: (error) => {
          this._sharedService.opnSnackBar.next(error?.error.message);
        },
      });
  }

  forgotPassword() {
    if (this.isForgotPassword) return;
    const emailControl = this.profileForm.get('email');
    if (emailControl.valid) {
      this.isForgotPassword = true;
      this._userAuthService.resetPassword(emailControl.value).subscribe({
        next: (res: any) => {
          this._sharedService.opnSnackBar.next(res.message);
          this.isForgotPassword = false;
        },
        error: (error) => {
          this._sharedService.opnSnackBar.next(error.message);
          this.isForgotPassword = false;
        },
      });
    } else if (!emailControl.value) {
      this._sharedService.opnSnackBar.next('Please enter your email address.');
    } else {
      this._sharedService.opnSnackBar.next(
        'The entered email address is invalid. Please try again.'
      );
    }
  }
}
