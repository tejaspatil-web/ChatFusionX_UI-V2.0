export class UserDetails{
  email:string
  id:string
  name:string
  adminGroupIds:string []
  joinedGroupIds:string []
  constructor(name:string,email:string,id:string,adminGroupIds:string [],joinedGroupIds:string []){
    this.name = name
    this.email = email
    this.id = id
    this.adminGroupIds = adminGroupIds
    this.joinedGroupIds = joinedGroupIds
  }
}
