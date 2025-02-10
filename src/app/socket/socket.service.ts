import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { baseUrl } from '../environment/environment';

export const enum userEvents{
  addRequest = 'addRequest'
}

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;
  private socketUrl: string = baseUrl.socketUrl
  constructor(private _http: HttpClient) {}

  socketConnection(userId:string){
    this.socket = io(this.socketUrl,{query:{userId:userId}});
  }

  // handle user activity
  handleUserActivity(event:string,data:object){
    this.socket.emit('userActivity',{event:event,data:data})
  }

 onUserActivity(callback: (data: any) => void): void{
    this.socket.on('messageReceived', callback);
 }

  // Join a group
  joinGroups(groupIds: string[]): void {
    this.socket.emit('joinGroups', groupIds);
  }

  // Leave a group
  leaveGroup(groupId: string): void {
    this.socket.emit('leaveGroup', groupId);
  }


  getOnlineUsers(): void {
    this.socket.emit('getOnlineUsers');
  }

  handleOnlineUsers(callback: (value: any) => void): void {
    this.socket.off('onlineUsers');
    this.socket.on('onlineUsers', (data) => {
      callback(data);
    });
  }

  offGettingOnlineUsers(){
    this.socket.off('onlineUsers')
  }

  // Send a message to a group
  sendMessageToGroup(message: any): void {
    this.socket.emit('groupMessage', message );
  }

  // Listen for responses from the server
  onMessageReceived(callback: (data: any) => void): void {
    this.socket.on('messageReceived', callback);
  }

  // Off Listening responses from the server
  offMessageReceived(): void {
    this.socket.off('messageReceived');
  }

  // Disconnect from the server
  disconnect(): void {
    this.socket.disconnect();
  }
}
