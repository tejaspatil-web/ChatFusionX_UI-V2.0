import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { baseUrl } from '../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class UserAuthService {
  private _baseUrl = baseUrl.apiUrl;
  constructor(private _httpClient: HttpClient) {}

  sendVerificationCode(userDetails: { email: string; userName: string }) {
    return this._httpClient.post(`${this._baseUrl}otp/send`, userDetails);
  }

  verifyUser(userDetails: {
    email: string;
    otp: string;
    password: string;
    name: string;
  }) {
    return this._httpClient.post(`${this._baseUrl}otp/verify`, userDetails);
  }

  userLogin(userDetails: { email: string; password: string }) {
    return this._httpClient.post(`${this._baseUrl}user/validate`, userDetails);
  }

  resetPassword(email:string){
    return this._httpClient.post(`${this._baseUrl}otp/reset`,{email:email})
  }

}
