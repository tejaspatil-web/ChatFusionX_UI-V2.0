import { Component, OnInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  GridApi,
  GridOptions,
  GridReadyEvent,
} from 'ag-grid-community';
import { themeQuartz } from 'ag-grid-community';
import { UserService } from '../../services/user.service';
import { AdminCellRendererComponent } from '../admin-cell-renderer/admin-cell-renderer.component';
import { UserList } from '../../shared/models/user.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [AgGridAngular],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent implements OnInit {
  constructor(private _userService: UserService) {}
  public rowData = [];
  public columnDefs: ColDef[] = [];
  public theme = themeQuartz;
  public isRefresh: boolean = false;
  private _gridApi: GridApi;
  public gridOptions: GridOptions = {
    rowHeight: 48,
    alwaysShowVerticalScroll: true,
    suppressDragLeaveHidesColumns: true,
  };
  public defaultColDef: ColDef = {
    resizable: true,
    flex: 1,
  };

  ngOnInit(): void {
    this._setColumnDefs();
    this._setRowData();
  }

  onGridReady(event: GridReadyEvent) {
    this._gridApi = event.api;
  }

  private _setColumnDefs() {
    this.columnDefs = [
      {
        field: 'userName',
        headerName: 'Name',
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        cellClass: 'center-divider',
        editable: true,
      },
      {
        field: 'userEmail',
        headerName: 'Email',
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        cellClass: 'center-divider',
        editable: true,
      },
      {
        field: 'userPassword',
        headerName: 'Password',
        cellClass: 'center-divider',
        editable: true,
      },
      {
        field: 'updateUser',
        headerName: 'Update',
        minWidth: 75,
        cellClass: ['center-divider', 'cell-button'],
        cellRenderer: AdminCellRendererComponent,
        cellRendererParams: { type: 'update' },
      },
      {
        field: 'deleteUser',
        headerName: 'Delete',
        minWidth: 75,
        cellClass: ['center-divider', 'cell-button'],
        cellRenderer: AdminCellRendererComponent,
        cellRendererParams: { type: 'delete' },
      },
    ];
  }

  private _setRowData() {
    this.rowData = [];
    this._userService.userList.forEach((user) => {
      this.rowData.push({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userPassword: '',
        isShowActionUpdateBtn: false,
        isShowActionDeleteBtn: false,
      });
    });
  }

  private async _getAllUsers() {
    this._userService.getAllUsers().subscribe({
      next: (users: UserList[]) => {
        this._userService.userList = users;
        this._setRowData();
        this.isRefresh = false;
      },
      error: (error) => {
        console.log(error);
        this.isRefresh = false;
      },
    });
  }

  refresh() {
    this.isRefresh = true;
    this._getAllUsers();
    this._gridApi.refreshCells();
  }
}
