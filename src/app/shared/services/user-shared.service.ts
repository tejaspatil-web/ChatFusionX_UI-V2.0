import { Injectable } from '@angular/core';
import { UserDetails } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public userDetails:UserDetails
  constructor() {}
}
