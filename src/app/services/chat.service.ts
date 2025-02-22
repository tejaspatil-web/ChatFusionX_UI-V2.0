import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Message } from '../shared/models/chat.model';
import { HttpClient } from '@angular/common/http';
import { baseUrl } from '../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private _baseUrl = baseUrl.apiUrl;
  public userMessage:Subject<Message> = new Subject<Message>();
  public privateMessage:Subject<any> = new Subject<any>();

constructor(private _httpClient: HttpClient) {}
 getMessage(){
    return this.userMessage.asObservable();
  }

  setMessage(message:Message){
    this.userMessage.next(message);
  }

 getPrivateMessage(){
    return this.privateMessage.asObservable();
  }

 setPrivateMessage(message:Message){
  this.privateMessage.next(message);
}

getPrivateChat(userId:string,receiverId:string){
  return this._httpClient.get(`${this._baseUrl}private/get-messages/sender/${userId}/receiver/${receiverId}`)
}

}
