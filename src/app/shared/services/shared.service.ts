import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  public isMobile = false;
  public isAlreadyGroupJoin:boolean = false;
  public userRedirectUrl:string = ''
  public opnSnackBar: Subject<string> = new Subject<string>();
  constructor() {}
}
