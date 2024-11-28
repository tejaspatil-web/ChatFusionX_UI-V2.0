import { Component } from '@angular/core';
import { baseUrl } from '../../environment/base-urls';
import { ChatComponent } from '../chat/chat.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [ChatComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
})
export class MainComponent {
  public baseUrl = baseUrl.images;
  public items = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 0, 0,
  ];
  constructor() {}
}
