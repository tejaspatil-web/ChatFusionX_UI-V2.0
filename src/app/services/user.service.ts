import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { baseUrl } from '../environment/environment';
import { UserDetails, UserList } from '../shared/models/user.model';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private _baseUrl = baseUrl.apiUrl;
  public userList: UserList[] = [];
  public userSearchTerm: Subject<string> = new Subject<string>();
  constructor(private _httpClient: HttpClient) { }

  getUser(userId: string) {
    return this._httpClient.get<UserDetails>(`${this._baseUrl}user/getUser/${userId}`)
  }

  getAllUsers() {
    return this._httpClient.get(`${this._baseUrl}user/getAll`)
  }

  sendRequest(userId: string, requestUserId: string) {
    return this._httpClient.post(`${this._baseUrl}user/sendRequest`, {
      userId: userId,
      requestUserId: requestUserId,
    })
  }

  updatePassword(userId: string, oldPassword: string, newPassword: string) {
    return this._httpClient.post(`${this._baseUrl}user/updatePassword`,
      {
      userId:userId,
      oldPassword:oldPassword,
      newPassword:newPassword
      }
    )
  }

  acceptRequest(userId: string, acceptUserId: string) {
    return this._httpClient.post(`${this._baseUrl}user/acceptRequest`,
      {
        userId: userId,
        acceptUserId: acceptUserId
      }
    )
  }

  rejectRequest(userId: string, rejectUserId: string) {
    return this._httpClient.post(`${this._baseUrl}user/rejectRequest`,
      {
        userId: userId,
        rejectUserId: rejectUserId
      }
    )
  }

}
