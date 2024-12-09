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

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, RouterOutlet],
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
    private router: Router
  ) {}

  ngOnInit() {
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = this.router.url;
      }
    });

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
