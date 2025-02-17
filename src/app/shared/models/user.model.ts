export class UserDetails{
  email:string
  id:string
  name:string
  adminGroupIds:string []
  joinedGroupIds:string []
  requestPending:string[]
  requests: string[]
  addedUsers:string[]
  constructor(
    name:string,
    email:string,
    id:string,
    adminGroupIds:string [],
    joinedGroupIds:string [],
    requestPending:string[],
    requests: string[],
    addedUsers:string[]
  ){
    this.name = name
    this.email = email
    this.id = id
    this.adminGroupIds = adminGroupIds
    this.joinedGroupIds = joinedGroupIds
    this.requestPending = requestPending
    this.requests = requests
    this.addedUsers = addedUsers
  }
}
export class UserList{
  email:string
  id:string
  name:string
  isActiveUser?:boolean
  isRequestPending?:boolean
  isApproved?:boolean
  constructor(name:string,email:string,id:string){
    this.name = name
    this.email = email
    this.id = id
  }
}


