import { Component, Input, OnInit } from '@angular/core';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.css'],
  standalone: true,
})
export class SnackbarComponent implements OnInit {
  message: string = '';
  showSnackbar: boolean = false;
  hideSnackbar: boolean = false;
  private _snackbarTimeout: any;

  constructor(private readonly _sharedService: SharedService) {}

  ngOnInit(): void {
    this._sharedService.opnSnackBar.subscribe((message) => {
      this.message = message;
      this.show();
    });
  }

  show() {
    if (this._snackbarTimeout) {
      clearTimeout(this._snackbarTimeout);
    }

    this.showSnackbar = true;
    this.hideSnackbar = false;

    this._snackbarTimeout = setTimeout(() => {
      this.hideSnackbar = true;
      setTimeout(() => {
        this.showSnackbar = false;
      }, 500);
    }, 2000);
  }
}
