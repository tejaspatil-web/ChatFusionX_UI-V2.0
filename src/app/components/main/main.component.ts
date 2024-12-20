import { Component, OnInit } from '@angular/core';
import { baseUrl } from '../../environment/base-urls';
import { ChatComponent } from '../chat/chat.component';
import { SharedService } from '../../shared/services/shared.service';
import {
  ActivatedRoute,
  provideRouter,
  Router,
  RouterOutlet,
} from '@angular/router';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
})
export class MainComponent implements OnInit {
  public baseUrl = baseUrl.images;
  public items = [];
  constructor(public sharedService: SharedService, private _router: Router) {}
  ngOnInit(): void {}

  checkRoute() {
    return this._router.url.includes('group');
  }

  addGroup() {
    this.items.push({ groupName: 'Test', groupId: 1 });
  }

  onGroupClick(item, index) {
    this._router.navigate([`dashboard/group/${item.groupId}`]);
    item;
  }
}
