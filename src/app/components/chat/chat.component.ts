import { Component } from '@angular/core';
import { baseUrl } from '../../environment/base-urls';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent {
  public baseUrl = baseUrl.images;
  constructor() {}
}
