import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { baseUrl } from '../../environment/base-urls';

export enum sideNavState{
  group='group',
  user='user',
  home='home'
}

@Injectable({
  providedIn: 'root',
})
export class SharedService {
 private _baseUrl = baseUrl.prodApiUrl;
  public isMobile = false;
  public isAlreadyGroupJoin:boolean = false;
  public activatedGroupId:string = ''
  public userRedirectUrl:string = ''
  public opnSnackBar: Subject<string> = new Subject<string>();
  public sideNavState: Subject<sideNavState> = new Subject<sideNavState>();
  constructor(private _httpClient:HttpClient) {}

  getServerStatus(){
    return this._httpClient.get(`${this._baseUrl}serverStatus`);
  }

}
