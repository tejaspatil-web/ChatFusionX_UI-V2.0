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
import { baseUrl } from '../../environment/base-urls';
import { Helper } from '../../shared/classes/helper.class';
import { FormsModule } from '@angular/forms';
import { SharedService } from '../../shared/services/shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from '../../connection/socket.service';
import { Message } from '../../shared/models/chat.model';
import { UserService } from '../../shared/services/user-shared.service';

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
  public messages:Message[] = [];
  constructor(
    public sharedService: SharedService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _socketService: SocketService,
    private _userService:UserService
  ) {}

  ngOnInit(): void {
    this._activatedRoute.paramMap.subscribe((params) => {
      if(this._groupId) this._socketService.offMessageReceived(this._groupId);
      this._groupId = params.get('id');
      this.groupName = params.get('name');
      this._socketService.onMessageReceived(this._groupId, (message:Message) => {
        this.messages.push({
          userName: message.userName,
          userId:message.userId,
          groupId:message.groupId,
          message: message.message,
          time: message.time,
          isCurrentUser: false,
        });
      });
    });
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
      const {id,name} = this._userService.userDetails
      const message:Message = {
        userName: name,
        groupId:this._groupId,
        userId:id,
        message: this._userInput.value,
        time: Helper.getTimeInIndia(),
        isCurrentUser: true,
      }

      // push message in message array
      this.messages.push(message);

      // send message in to specific group
      this._socketService.sendMessageToGroup(this._groupId,message);
      this._userInput.value = '';
      this._userInput.focus();
      this._scrollToBottom();
    }
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
    if(this._groupId) this._socketService.offMessageReceived(this._groupId);
  }

}
