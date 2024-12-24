import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { baseUrl } from '../environment/base-urls';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private _baseUrl = baseUrl.prodApiUrl;
  constructor(private _httpClient: HttpClient) {}

  getAllJoinedGroups(groupIds:string[]){
    const joinedGroupIds = {groupIds:groupIds}
    return this._httpClient.post(`${this._baseUrl}group/getAllJoinedGroup`,joinedGroupIds)
  }

  createGroup(groupData:{name:string,userId:string,description:string}){
   return this._httpClient.post(`${this._baseUrl}group/create`,groupData)
  }

 joinGroup(groupData:{userId:string,groupId:string}){
  this._httpClient.post(`${this._baseUrl}group/join`,groupData)
 }

}
