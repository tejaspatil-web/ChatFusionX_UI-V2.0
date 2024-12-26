export class Message{
  message:string
  userId:string
  userName:string
  time:string
}
export class GroupData{
  description:string
  name:string
  _id:string
  messages:Message[]
}
