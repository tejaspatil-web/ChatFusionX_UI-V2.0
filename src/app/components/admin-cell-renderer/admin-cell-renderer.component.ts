import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-admin-cell-renderer',
  standalone: true,
  imports: [],
  templateUrl: './admin-cell-renderer.component.html',
  styleUrl: './admin-cell-renderer.component.css',
})
export class AdminCellRendererComponent implements ICellRendererAngularComp {
  public params: ICellRendererParams;

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

  acceptChangesForUpdateBtn() {}

  rejectChangesForUpdateBtn() {
    this.params.data.isShowActionUpdateBtn = false;
  }

  acceptChangesForDeleteBtn() {}

  rejectChangesForDeleteBtn() {
    this.params.data.isShowActionDeleteBtn = false;
  }

  refresh(params: ICellRendererParams<any, any, any>): boolean {
    return false;
  }
}
