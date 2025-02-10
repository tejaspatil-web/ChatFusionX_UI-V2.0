import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { baseUrl } from '../../environment/environment';
import { Helper } from '../../shared/classes/helper.class';
import { FormsModule } from '@angular/forms';
import { SharedService, sideNavState } from '../../shared/services/shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from '../../socket/socket.service';
import { Message } from '../../shared/models/chat.model';
import { UserSharedService } from '../../shared/services/user-shared.service';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule],
  providers: [],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent implements OnInit, AfterViewInit,OnDestroy {
  @ViewChild('messageInput') userInput: ElementRef;
  @ViewChild('chatContainer') chatContainer: ElementRef;
  public baseUrl = baseUrl.images;
  public isMobile = false;
  private _userInput: HTMLInputElement;
  private _chatContainer: HTMLDivElement;
  private _groupId: string = "";
  public groupName: string = "";
  public userName: string = "";
  public userId: string = "";
  public type: string = "";
  public messages:Message[] = [];
  constructor(
    public sharedService: SharedService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _socketService: SocketService,
    private _userSharedService :UserSharedService,
    private _chatService:ChatService
  ) {}

  ngOnInit(): void {
    this._activatedRoute.paramMap.subscribe((params) => {
      this.messages = [];
      this.type = params.get('type');
      if(this.type === sideNavState.user){
       this.userName = params.get('name')
       this.userId = params.get('userId')
      }else if(this.type === sideNavState.group){
        const groupData = this._userSharedService.groupData;
        this._groupId = params.get('id');
        this.groupName = params.get('name');
        this.sharedService.activatedGroupId = this._groupId;
        if(groupData.length > 0){
         const group = groupData.find(ele => ele._id === this._groupId);
         if(group?.messages.length > 0){
          this.messages = group.messages.map(ele => ({
            ...ele,
            groupId: this._groupId,
            isCurrentUser: ele.userId === this._userSharedService.userDetails.id,
          }));
         }
        }
      }
      this._scrollToBottom();
    });
    if(this.type === sideNavState.group){
      this._receivedGroupMessages();
    }
  }

  ngAfterViewInit(): void {
    this._userInput = this.userInput.nativeElement;
    this._chatContainer = this.chatContainer.nativeElement;
    this._scrollToBottom();
  }

  onEnter(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }

  sendMessage() {
    if (this._userInput.value) {
      const {id,name} = this._userSharedService.userDetails
      const message:Message = {
        userName: name,
        groupId:this._groupId,
        userId:id,
        message: this._userInput.value,
        time: Helper.getTimeInIndia(),
        isCurrentUser: true,
      }

      // push message in message array
      this._addMessageToGroup(message);

      // send message in to specific group
      this._socketService.sendMessageToGroup(message);
      this._userInput.value = '';
      this._userInput.focus();
      this._scrollToBottom();
    }
  }

  private _receivedGroupMessages(){
    this._chatService.getMessage().subscribe((message:Message) =>{
      message.isCurrentUser = false;
      this._addMessageToGroup(message);
    })
  }

 private _addMessageToGroup(message:Message){
  this.messages.push({
    userName: message.userName,
    userId:message.userId,
    groupId:message.groupId,
    message: message.message,
    time: message.time,
    isCurrentUser: message.isCurrentUser,
  });

    const group = this._userSharedService.groupData.find(ele => ele._id === this._groupId);
    group.messages.push({
      userId:message.userId,
      userName:message.userName,
      time:message.time,
      message:message.message
    })
  }

  shareGroupLink() {
    const currentUrl = this._router.url;
    const fullUrl = `${window.location.origin}${currentUrl}`;

    if (navigator.share) {
      navigator
        .share({
          title: `Join ${this.groupName} on ChatFusionX!`,
          text: `Hey there! Check out this group on ChatFusionX and join us: ${this.groupName}`,
          url: fullUrl,
        })
        .then(() => {
          console.log('Link shared successfully');
        })
        .catch((error) => {
          console.error('Error sharing link:', error);
        });
    } else {
      console.warn('Web Share API not supported');
      this.sharedService.opnSnackBar.next('Web Share API not supported')
    }
  }

  onBackButton() {
    this._router.navigate(['/dashboard']);
  }

  private _scrollToBottom(): void {
    setTimeout(() => {
      const chatContainer = this._chatContainer;
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 100);
  }

  ngOnDestroy(): void {
  }

}
