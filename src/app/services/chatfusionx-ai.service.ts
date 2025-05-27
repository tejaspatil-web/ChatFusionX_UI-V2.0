import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { baseUrl } from '../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class ChatfusionxAiService {
  private _baseUrl = baseUrl.apiUrl;
constructor(private _httpClient: HttpClient) {}

  getAiChatHistory(userId:string){
    return this._httpClient.get(`${this._baseUrl}chatfusionx-ai/get-chat?user_id=${userId}`)
  }

  generateAiResponse(userId:string,prompt:string){
    const payload = {user_id:userId,prompt:prompt}
    return this._httpClient.post(`${this._baseUrl}chatfusionx-ai/generate`,payload)
  }

}
