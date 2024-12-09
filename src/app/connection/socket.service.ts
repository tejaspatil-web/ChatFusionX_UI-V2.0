import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;
  private serverUrl: string =
    'https://chatfusionx-api-v2-0.onrender.com/getway';
  private serverApiUrl: string =
    'https://chatfusionx-api-v2-0.onrender.com/api/v1/user';

  constructor(private _http: HttpClient) {
    this.socket = io(this.serverUrl);
  }

  // Join a group (room)
  joinGroup(groupId: string): void {
    this.socket.emit('joinGroup', groupId);
  }

  // Leave a group (room)
  leaveGroup(groupName: string): void {
    this.socket.emit('leaveGroup', groupName);
  }

  // Send a message to a group
  sendMessageToGroup(groupId: string, message: any): void {
    this.socket.emit('groupMessage', { groupId, message: message });
  }

  // Listen for responses from the server
  onMessageReceived(groupId, callback: (data: any) => void): void {
    this.socket.on(groupId, callback);
  }

  // Disconnect from the server
  disconnect(): void {
    this.socket.disconnect();
  }
}
