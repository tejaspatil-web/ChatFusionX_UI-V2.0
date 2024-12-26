import { Injectable } from '@angular/core';
import { UserDetails } from '../models/user.model';
import { GroupData } from '../models/group.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public userDetails:UserDetails
  public groupData:GroupData[] = []
  constructor() {}
}
