import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
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

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule],
  providers: [],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent implements OnInit, AfterViewInit {
  @ViewChild('messageInput') userInput: ElementRef;
  @ViewChild('chatContainer') chatContainer: ElementRef;
  public baseUrl = baseUrl.images;
  public isMobile = false;
  private _userInput: HTMLInputElement;
  private _chatContainer: HTMLDivElement;
  private _groupId: string;
  public messages = [
    { name: 'User', message: 'hiii', time: '2:11 PM', isCurrentUser: true },
    { name: 'Client', message: 'hey', time: '2:11 PM', isCurrentUser: false },
  ];
  constructor(
    public sharedService: SharedService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _socketService: SocketService
  ) {}

  ngOnInit(): void {
    this._activatedRoute.paramMap.subscribe((params) => {
      this._groupId = params.get('id');
      this._socketService.joinGroup(this._groupId);
      this._socketService.onMessageReceived(this._groupId, (message) => {
        this.messages.push({
          name: 'Client',
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
      this.messages.push({
        name: 'User',
        message: this._userInput.value,
        time: Helper.getTimeInIndia(),
        isCurrentUser: true,
      });
      this._socketService.sendMessageToGroup(this._groupId, {
        name: 'User',
        message: this._userInput.value,
        time: Helper.getTimeInIndia(),
        isCurrentUser: true,
      });
      this._userInput.value = '';
      this._userInput.focus();
      this._scrollToBottom();
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
}
