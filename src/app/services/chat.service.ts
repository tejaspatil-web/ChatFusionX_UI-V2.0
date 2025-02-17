import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Message } from '../shared/models/chat.model';

@Injectable({
  providedIn: 'root',
})
export class ChatService {

  public userMessage:Subject<Message> = new Subject<Message>();
  public privateMessage:Subject<any> = new Subject<any>();

  constructor() {}

 getMessage(){
    return this.userMessage.asObservable();
  }

 setMessage(message:Message){
  this.userMessage.next(message);
}
}
