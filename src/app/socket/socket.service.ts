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
  constructor(private _http: HttpClient) {
    this.socket = io(this.serverUrl);
  }

  // Join a group (room)
  joinGroup(groupId: string): void {
    this.socket.emit('joinGroup', groupId);
  }

  // Leave a group (room)
  leaveGroup(groupId: string): void {
    this.socket.emit('leaveGroup', groupId);
  }

  // Send a message to a group
  sendMessageToGroup(message: any): void {
    this.socket.emit('groupMessage', message );
  }

  // Listen for responses from the server
  onMessageReceived(groupId, callback: (data: any) => void): void {
    this.socket.on(groupId, callback);
  }

  // Off Listening responses from the server
  offMessageReceived(groupId): void {
    this.socket.off(groupId);
  }

  // Disconnect from the server
  disconnect(): void {
    this.socket.disconnect();
  }
}
