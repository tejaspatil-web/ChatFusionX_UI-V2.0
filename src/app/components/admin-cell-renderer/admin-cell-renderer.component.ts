import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { AdminService } from '../../services/admin.service';
import { SharedService } from '../../shared/services/shared.service';

@Component({
  selector: 'app-admin-cell-renderer',
  standalone: true,
  imports: [],
  templateUrl: './admin-cell-renderer.component.html',
  styleUrl: './admin-cell-renderer.component.css',
})
export class AdminCellRendererComponent implements ICellRendererAngularComp {
  public params: ICellRendererParams;
  public: boolean = false;

  constructor(
    private _adminService: AdminService,
    private _sharedService: SharedService
  ) {}
  agInit(params: ICellRendererParams<any, any, any>): void {
    this.params = params;
    this.params.colDef.cellRendererParams;
  }

  onUpdate() {
    this.params.data.isShowActionUpdateBtn = true;
  }

  onDelete() {
    this.params.data.isShowActionDeleteBtn = true;
  }

  acceptChangesForUpdateBtn() {
    this.params.data.acceptChangesForUpdateBtnClick = true;
    const { userId, userName, userEmail, userPassword } = this.params.data;
    this._adminService
      .updateUser({
        id: userId,
        name: userName,
        email: userEmail,
        password: userPassword || null,
      })
      .subscribe({
        next: (res: any) => {
          this._sharedService.opnSnackBar.next(res.res);
        },
        error: (error) => {
          this._sharedService.opnSnackBar.next('Failed to update user details');
        },
        complete: () => {
          this.params.data.acceptChangesForUpdateBtnClick = false;
          this.params.data.isShowActionUpdateBtn = false;
        },
      });
  }

  rejectChangesForUpdateBtn() {
    this.params.data.isShowActionUpdateBtn = false;
  }

  acceptChangesForDeleteBtn() {
    this.params.data.acceptChangesForDeleteBtnClick = true;
    const userId = this.params.data.userId;
    this._adminService.deleteUser(userId).subscribe({
      next: (res: any) => {
        this._sharedService.opnSnackBar.next(res.res);
      },
      error: (err) => {
        this._sharedService.opnSnackBar.next('Failed to delete user details');
      },
      complete: () => {
        this.params.data.acceptChangesForDeleteBtnClick = false;
        this.params.data.isShowActionDeleteBtn = false;
      },
    });
  }

  rejectChangesForDeleteBtn() {
    this.params.data.isShowActionDeleteBtn = false;
  }

  refresh(params: ICellRendererParams<any, any, any>): boolean {
    return false;
  }
}
