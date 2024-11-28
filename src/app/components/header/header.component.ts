import { Component } from '@angular/core';
import { baseUrl } from '../../environment/base-urls';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  public baseUrl = baseUrl.images;
  constructor() {}
}
