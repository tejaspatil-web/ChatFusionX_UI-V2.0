export class Message{
  userName: string
  groupId?:string
  userId:string
  message: string
  time: string
  isCurrentUser?: boolean
  type?:string
  receiverId?:string
  hasAiMessageLoaded?:boolean
}
