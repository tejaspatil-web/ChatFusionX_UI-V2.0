import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { baseUrl } from '../../environment/environment';
import { Helper } from '../../shared/classes/helper.class';
import { FormsModule } from '@angular/forms';
import {
  SharedService,
  sideNavState,
} from '../../shared/services/shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from '../../socket/socket.service';
import { Message } from '../../shared/models/chat.model';
import { UserSharedService } from '../../shared/services/user-shared.service';
import { ChatService } from '../../services/chat.service';
import { ChatfusionxAiService } from '../../services/chatfusionx-ai.service';
import { marked } from 'marked';

export enum aiRole {
  model = 'model',
  user = 'user',
}
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule],
  providers: [],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('messageInput') userInput: ElementRef;
  @ViewChild('chatContainer') chatContainer: ElementRef;
  public baseUrl = baseUrl.images;
  public isShowLoader:boolean = false;
  public isMobile = false;
  private _userInput: HTMLInputElement;
  private _chatContainer: HTMLDivElement;
  private _groupId: string = '';
  public groupName: string = '';
  public userName: string = '';
  public userId: string = '';
  public receiverId: string = '';
  public type: string = '';
  public messages: Message[] = [];
  constructor(
    public sharedService: SharedService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _socketService: SocketService,
    private _userSharedService: UserSharedService,
    private _chatService: ChatService,
    private _chatfusionxAiService: ChatfusionxAiService,
    private renderer: Renderer2,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this._activatedRoute.paramMap.subscribe((params) => {
      this.messages = [];
      this.type = params.get('type');
      if (this.type === sideNavState.user) {
        this.userName = params.get('name');
        this.receiverId = params.get('id');
        this._getPrivateChat();
      } else if (this.type === sideNavState.group) {
        const groupData = this._userSharedService.groupData;
        this._groupId = params.get('id');
        this.groupName = params.get('name');
        this.sharedService.activatedGroupId = this._groupId;
        if (groupData.length > 0) {
          const group = groupData.find((ele) => ele._id === this._groupId);
          if (group?.messages.length > 0) {
            this.messages = group.messages.map((ele) => ({
              ...ele,
              groupId: this._groupId,
              isCurrentUser:
                ele.userId === this._userSharedService.userDetails.id,
            }));
          }
        }
      } else if (this.type === 'ai') {
        this.userName = params.get('name');
      }
      this._scrollToBottom();
    });
    if (this.type === sideNavState.group) {
      this._receiveGroupMessages();
    } else if (this.type === sideNavState.user) {
      this._receivePrivateMessage();
    } else if (this.type === 'ai') {
      this._getAiChatHistory();
    }
  }

  ngAfterViewInit(): void {
    if(this.type !== 'ai'){
      this._userInput = this.userInput.nativeElement;
      this._chatContainer = this.chatContainer.nativeElement;
      this._scrollToBottom();
    }
  }

  onEnter(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }

  private _getPrivateChat() {
    const userId = this._userSharedService.userDetails.id;
    this._chatService
      .getPrivateChat(userId, this.receiverId)
      .subscribe((response: any) => {
        response.messages.forEach((ele) => {
          ele.isCurrentUser = ele.userId === userId;
        });
        this.messages = response.messages;
        this._scrollToBottom();
      });
  }

  private _getAiChatHistory() {
    this.isShowLoader = true;
    const userId = this._userSharedService.userDetails.id;
    this._chatfusionxAiService
      .getAiChatHistory(userId)
      .subscribe(async (chat: any) => {
        this.messages = await Promise.all(
          chat.response.map(async (ele) => {
            return {
              userName: ele.role === aiRole.model ? 'AI' : '',
              userId: '',
              message:
                ele.role === aiRole.model
                  ? await this._convertMarkDown(ele.message)
                  : ele.message,
              time: '',
              isCurrentUser: ele.role === aiRole.user,
              hasAiMessageLoaded:true
            };
          })
        );
        this.isShowLoader = false;
        this._addCopyButtons();
        this._scrollToBottom();
      });
  }


  private _generateAiResponse(prompt: string) {
    const userId = this._userSharedService.userDetails.id;
    this.messages.push({
      userName: '',
      userId: userId,
      message: prompt,
      time: '',
      isCurrentUser: true,
      hasAiMessageLoaded:true
    },
    {
      userName: 'AI',
      userId: '',
      message:'',
      time: '',
      isCurrentUser: false,
      hasAiMessageLoaded:false
    });
    this.cdRef.detectChanges();
    this._scrollToBottom();
    this._chatfusionxAiService
      .generateAiResponse(userId, prompt)
      .subscribe(async (response: any) => {
       const aiMessage = this.messages.find(ele => !ele.hasAiMessageLoaded)
       aiMessage.message = await this._convertMarkDown(response.response);
       aiMessage.hasAiMessageLoaded = true
       this._scrollToBottom();
        this._addCopyButtons();
      });
  }

  sendMessage() {
    if (this._userInput.value) {
      const { id, name } = this._userSharedService.userDetails;
      switch (this.type) {
        case 'group':
          const groupMessage: Message = {
            userName: name,
            groupId: this._groupId,
            userId: id,
            message: this._userInput.value,
            time: Helper.getTimeInIndia(),
            isCurrentUser: true,
          };
          // push message in message array
          this._addMessageToGroup(groupMessage);
          // send message in to specific group
          this._socketService.sendMessageToGroup(groupMessage);
          break;
        case 'user':
          const userMessage: Message = {
            userName: name,
            userId: id,
            message: this._userInput.value,
            time: Helper.getTimeInIndia(),
            isCurrentUser: true,
            receiverId: this.receiverId,
            type: 'privateMessage',
          };
          this._addMessageToUser(userMessage);
          // send message in to specific group
          this._socketService.sendPrivateMessage(userMessage);
          break;
        case 'ai':
          this._generateAiResponse(this._userInput.value);
          break;
      }

      this._userInput.value = '';
      this._userInput.focus();
      this._scrollToBottom();
    }
  }

  private async _convertMarkDown(text: string) {
    return await marked(text);
  }

  private _addCopyButtons() {
    requestAnimationFrame(()=>{
      const chatContainer = this.chatContainer.nativeElement;
      const preTags = chatContainer.querySelectorAll('pre');
      preTags.forEach((preTag: HTMLElement) => {

        if (preTag.querySelector('button.copy-btn')) {
          return;
        }

        const copyButton = this.renderer.createElement('button');
        copyButton.innerText = 'Copy';
        this.renderer.setAttribute(copyButton, 'class', 'copy-btn');
        this.renderer.setStyle(copyButton, 'position', 'absolute');
        this.renderer.setStyle(copyButton, 'top', '5px');
        this.renderer.setStyle(copyButton, 'right', '5px');
        this.renderer.setStyle(copyButton, 'padding', '5px 10px');
        this.renderer.setStyle(copyButton, 'background', 'rgba(255, 255, 255, 0.2)');
        this.renderer.setStyle(copyButton, 'font-size', '10px');
        this.renderer.setStyle(copyButton, 'border', 'none');
        this.renderer.setStyle(copyButton, 'cursor', 'pointer');
        this.renderer.setStyle(copyButton, 'color', '#fff');
        this.renderer.setStyle(copyButton, 'border-radius', '5px');

        this.renderer.listen(copyButton, 'click', () => this._copyToClipboard(preTag));

        this.renderer.setStyle(preTag, 'position', 'relative');
        this.renderer.appendChild(preTag, copyButton);
      });
    })
  }


  private _copyToClipboard(preTag: HTMLElement) {
    const codeBlock = preTag.querySelector('code');
    const text = codeBlock ? codeBlock.innerText : preTag.innerText;
    navigator.clipboard.writeText(text).then(() => {
      this.sharedService.opnSnackBar.next('Copied to clipboard!')
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  }

  private _receiveGroupMessages() {
    this._chatService.getMessage().subscribe((message: Message) => {
      message.isCurrentUser = false;
      this._addMessageToGroup(message);
    });
  }

  private _receivePrivateMessage() {
    this._chatService.getPrivateMessage().subscribe((message) => {
      if (message.type === 'privateMessage') {
        this._addMessageToUser({ ...message, isCurrentUser: false });
      }
    });
  }

  private _addMessageToUser(message) {
    this.messages.push({
      userName: message.userName,
      userId: message.userId,
      groupId: message.groupId,
      message: message.message,
      time: message.time,
      isCurrentUser: message.isCurrentUser,
      receiverId: message.receiverId,
      type: message.type,
    });
    this._scrollToBottom();
  }

  private _addMessageToGroup(message: Message) {
    this.messages.push({
      userName: message.userName,
      userId: message.userId,
      groupId: message.groupId,
      message: message.message,
      time: message.time,
      isCurrentUser: message.isCurrentUser,
    });

    const group = this._userSharedService.groupData.find(
      (ele) => ele._id === this._groupId
    );
    group.messages.push({
      userId: message.userId,
      userName: message.userName,
      time: message.time,
      message: message.message,
    });
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
      this.sharedService.opnSnackBar.next('Web Share API not supported');
    }
  }

  onBackButton() {
    this._router.navigate(['/dashboard']);
  }

  private _scrollToBottom(): void {
    requestAnimationFrame(()=>{
      if(this.type === 'ai'){
        this._userInput = this.userInput?.nativeElement;
        const chatContainer = this.chatContainer?.nativeElement
       if(chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
      }else{
        const chatContainer = this._chatContainer;
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    })
  }

  ngOnDestroy(): void {}
}
