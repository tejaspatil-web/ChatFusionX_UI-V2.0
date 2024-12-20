import { Component } from '@angular/core';
import { baseUrl } from '../../environment/base-urls';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  public baseUrl = baseUrl.images;
  constructor(private readonly _router: Router) {}

  logOut() {
    localStorage.clear();
    this._router.navigate(['/login']);
  }
}
