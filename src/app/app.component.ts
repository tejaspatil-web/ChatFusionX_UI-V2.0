import {
  Component,
  Inject,
  OnDestroy,
  PLATFORM_ID,
  Renderer2,
} from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { SharedService } from './shared/services/shared.service';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { SnackbarComponent } from './shared/components/snackbar/snackbar.component';
import { UserService } from './shared/services/user-shared.service';
import { UserDetails } from './shared/models/user.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, SnackbarComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnDestroy {
  public isScreenLoaded: boolean = false;
  public currentRoute: string = '';
  private routerSubscription: Subscription;
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private renderer: Renderer2,
    private _sharedService: SharedService,
    private router: Router,
    private _userService:UserService
  ) {}

  ngOnInit() {
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = this.router.url;
      }
    });

    const userDetails = localStorage.getItem('userDetails')
    if(userDetails){
      const parseUserDetails = JSON.parse(userDetails);
       this._userService.userDetails = new UserDetails(
        parseUserDetails.name,
        parseUserDetails.email,
        parseUserDetails.id,
        parseUserDetails.adminGroupIds,
        parseUserDetails.joinedGroupIds
       )
    }

    if (isPlatformBrowser(this.platformId)) {
      // Use Renderer2 to safely get screen width in the browser
      this._sharedService.isMobile = window.innerWidth <= 768 ? true : false;
      this.isScreenLoaded = true;
    }
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
