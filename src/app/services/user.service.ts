import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { baseUrl } from '../environment/environment';
import { UserList } from '../shared/models/user.model';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private _baseUrl = baseUrl.apiUrl;
  public userList:UserList[] = [];
  public userSearchTerm:Subject<string> = new Subject<string>();
  constructor(private _httpClient: HttpClient) {}

  getAllUsers(){
   return this._httpClient.get(`${this._baseUrl}user/getAll`)
  }

}
