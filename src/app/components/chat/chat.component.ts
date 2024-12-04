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
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule],
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
  public messages = [
    { name: 'Tejas', message: 'hiii', time: '2:11 PM', isCurrentUser: true },
    { name: 'Sagar', message: 'hey', time: '2:11 PM', isCurrentUser: false },
  ];
  constructor(public sharedService: SharedService, private _router: Router) {}

  ngOnInit(): void {}

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
        name: 'Tejas',
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
    this._router.navigate(['']);
  }

  private _scrollToBottom(): void {
    setTimeout(() => {
      const chatContainer = this._chatContainer;
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 100);
  }
}
