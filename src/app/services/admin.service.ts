import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { baseUrl } from '../environment/environment';
import { UpdateUserDetails } from '../models/admin.model';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private _baseUrl = baseUrl.apiUrl;
  constructor(private _httpClient: HttpClient) {}

  updateUser(userDetails: UpdateUserDetails) {
    return this._httpClient.post(
      `${this._baseUrl}admin/update-user`,
      userDetails
    );
  }

  deleteUser(id: string) {
    return this._httpClient.delete(`${this._baseUrl}admin/delete/${id}`);
  }
}
