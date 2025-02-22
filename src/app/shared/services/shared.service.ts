import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { baseUrl } from '../../environment/environment';

export enum sideNavState{
  group='group',
  user='user',
  home='home',
  notification='notification',
  chatfusionxai = 'chatfusionxai'
}

@Injectable({
  providedIn: 'root',
})
export class SharedService {
 private _baseUrl = baseUrl.apiUrl;
  public isMobile = false;
  public isAlreadyGroupJoin:boolean = false;
  public isLoggedOut:boolean = false;
  public activatedGroupId:string = ''
  public userRedirectUrl:string = ''
  public opnSnackBar: Subject<string> = new Subject<string>();
  public requestAccept: Subject<string> = new Subject<string>();
  public sideNavState: Subject<sideNavState> = new Subject<sideNavState>();
  constructor(private _httpClient:HttpClient) {}

  getServerStatus(){
    return this._httpClient.get(`${this._baseUrl}serverStatus`);
  }

}
