import { Component, Inject, PLATFORM_ID, Renderer2 } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { MainComponent } from './components/main/main.component';
import { SharedService } from './shared/services/shared.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, MainComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  public isScreenLoaded: boolean = false;
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private renderer: Renderer2,
    private _sharedService: SharedService
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Use Renderer2 to safely get screen width in the browser
      this._sharedService.isMobile = window.innerWidth <= 768 ? true : false;
      this.isScreenLoaded = true;
    }
  }
}
