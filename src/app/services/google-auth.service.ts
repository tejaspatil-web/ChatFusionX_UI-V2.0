import { Injectable } from '@angular/core';
import { baseUrl } from '../environment/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  private _tokenClient: any;
  private _scriptLoaded = false;
  private _baseUrl = baseUrl.apiUrl;

  constructor(private _httpClient: HttpClient) {}

    public loadGoogleScript(): Promise<void> {
    return new Promise((resolve) => {
      if (this._scriptLoaded) return resolve();

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this._scriptLoaded = true;
        resolve();
      };

      document.body.appendChild(script);
    });
  }

   public initTokenClient(callback: (token: string) => void) {
    const googleAuth = (window as any).google;
    this._tokenClient = googleAuth.accounts.oauth2.initTokenClient({
      client_id: '427483031981-2eunep9cd59bhhitbptqohclrfgb54c7.apps.googleusercontent.com',
      scope: 'openid email profile',
      callback: (response: any) => callback(response.access_token)
    });
  }

 public requestAccessToken() {
    this._tokenClient.requestAccessToken();
  }

  public googleLogin(token: string) {
    return this._httpClient.post(`${this._baseUrl}google-auth/login`, {
      token: token
    });
  }

}
