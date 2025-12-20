import { Component, OnInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions } from 'ag-grid-community';
import { themeQuartz } from 'ag-grid-community';
import { UserService } from '../../services/user.service';
import { AdminCellRendererComponent } from '../admin-cell-renderer/admin-cell-renderer.component';

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
  public components = {};
  public theme = themeQuartz;
  public gridOptions: GridOptions = {
    rowHeight: 48,
    alwaysShowVerticalScroll: true,
  };
  public defaultColDef: ColDef = {
    resizable: true,
    flex: 1,
  };

  ngOnInit(): void {
    this.components = {
      'admin-cell-renderer': AdminCellRendererComponent,
    };
    this._setColumnDefs();
    this._setRowData();
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
        cellRenderer: 'admin-cell-renderer',
        cellRendererParams: { type: 'update' },
      },
      {
        field: 'deleteUser',
        headerName: 'Delete',
        minWidth: 75,
        cellClass: ['center-divider', 'cell-button'],
        cellRenderer: 'admin-cell-renderer',
        cellRendererParams: { type: 'delete' },
      },
    ];
  }

  private _setRowData() {
    this._userService.userList.forEach((user) => {
      this.rowData.push({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        isShowActionUpdateBtn: false,
        isShowActionDeleteBtn: false,
      });
    });
  }
}
