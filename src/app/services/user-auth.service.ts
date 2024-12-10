import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { baseUrl } from '../environment/base-urls';

@Injectable({
  providedIn: 'root',
})
export class UserAuthService {
  private _baseUrl = baseUrl.prodApiUrl;
  constructor(private _httpClient: HttpClient) {}

  userRegistation(userDetails: {
    name: string;
    email: string;
    password: string;
  }) {
    return this._httpClient.post(`${this._baseUrl}user/register`, userDetails);
  }

  userLogin(userDetails: { email: string; password: string }) {
    return this._httpClient.post(`${this._baseUrl}user/validate`, userDetails);
  }
}
