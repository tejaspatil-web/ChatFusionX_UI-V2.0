import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { baseUrl } from '../../environment/base-urls';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
 private _baseUrl = baseUrl.prodApiUrl;
  public isMobile = false;
  public isAlreadyGroupJoin:boolean = false;
  public userRedirectUrl:string = ''
  public opnSnackBar: Subject<string> = new Subject<string>();
  constructor(private _httpClient:HttpClient) {}

  getServerStatus(){
    return this._httpClient.get(`${this._baseUrl}serverStatus`);
  }

}
