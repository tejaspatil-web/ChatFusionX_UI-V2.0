import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { baseUrl } from '../environment/base-urls';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;
  private serverUrl: string = baseUrl.prodSocketUrl
  constructor(private _http: HttpClient) {}

  socketConnection(userId:string){
    this.socket = io(this.serverUrl,{query:{userId:userId}});
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
