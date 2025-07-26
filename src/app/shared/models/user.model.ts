export class UserDetails {
  email: string;
  id: string;
  name: string;
  adminGroupIds: string[];
  joinedGroupIds: string[];
  requestPending: string[];
  requests: string[];
  addedUsers: string[];
  profileUrl: string;
  accessToken?: string;
  constructor(
    name: string,
    email: string,
    id: string,
    adminGroupIds: string[],
    joinedGroupIds: string[],
    requestPending: string[],
    requests: string[],
    addedUsers: string[],
    profileUrl: string,
    accessToken?: string
  ) {
    this.name = name;
    this.email = email;
    this.id = id;
    this.adminGroupIds = adminGroupIds;
    this.joinedGroupIds = joinedGroupIds;
    this.requestPending = requestPending;
    this.requests = requests;
    this.addedUsers = addedUsers;
    this.profileUrl = profileUrl;
    this.accessToken = accessToken;
  }
}
export class UserList {
  email: string;
  id: string;
  name: string;
  profileUrl?: string;
  isActiveUser?: boolean;
  isRequestPending?: boolean;
  isApproved?: boolean;
  constructor(name: string, email: string, id: string, profileUrl) {
    this.name = name;
    this.email = email;
    this.id = id;
    this.profileUrl = profileUrl;
  }
}
