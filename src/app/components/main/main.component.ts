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
  imports: [RouterOutlet, ChatComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
})
export class MainComponent implements OnInit {
  public baseUrl = baseUrl.images;
  public items = [
    { groupName: 'Test', groupId: 1 },
    { groupName: 'Test', groupId: 2 },
    { groupName: 'Test', groupId: 3 },
    { groupName: 'Test', groupId: 4 },
    { groupName: 'Test', groupId: 5 },
    { groupName: 'Test', groupId: 6 },
    { groupName: 'Test', groupId: 7 },
  ];
  constructor(public sharedService: SharedService, private _router: Router) {}
  ngOnInit(): void {}

  checkRoute() {
    return this._router.url.includes('group');
  }

  onGroupClick(item, index) {
    this._router.navigate([`group/${item.groupId}`]);
    item;
  }
}
