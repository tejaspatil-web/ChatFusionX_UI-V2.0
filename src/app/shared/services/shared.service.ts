import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, forkJoin, of, Subject } from 'rxjs';
import { baseUrl } from '../../environment/environment';

export enum sideNavState {
  group = 'group',
  user = 'user',
  home = 'home',
  notification = 'notification',
  chatfusionxai = 'chatfusionxai',
  adminPanel = 'adminPanel',
}

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private _baseUrl = baseUrl.apiUrl;
  private _healthUrl = baseUrl.healthUrls;
  public isMobile = false;
  public isAlreadyGroupJoin: boolean = false;
  public isLoggedOut: boolean = false;
  public activatedGroupId: string = '';
  public userRedirectUrl: string = '';
  public opnSnackBar: Subject<string> = new Subject<string>();
  public requestAccept: Subject<string> = new Subject<string>();
  public sideNavState: Subject<sideNavState> = new Subject<sideNavState>();
  public getUpdatedProfileUrl: Subject<string> = new Subject<string>();
  constructor(private _httpClient: HttpClient) {}

  getServerStatus() {
    return forkJoin(
      this._healthUrl.map((url: string) =>
        this._httpClient.get(url).pipe(
          catchError((error) => {
            console.error(`Request failed for ${url}`, error);

            return of({
              url,
              status: 'failed',
              error: true
            });
          })
        )
      )
    );
  }
}
