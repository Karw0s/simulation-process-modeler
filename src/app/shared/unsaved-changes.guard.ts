import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable, Observer } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';

export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UnsavedChangesGuard implements CanDeactivate<CanComponentDeactivate> {

  constructor(private dialog: MatDialog) {}

  canDeactivate(component: CanComponentDeactivate) {
    // Allow navigation if the component says that it is OK or it doesn't have a canDeactivate function
    if (!component.canDeactivate || component.canDeactivate()) {
      return true;
    }

    return new Observable((observer: Observer<boolean>) => {
      // UnsavedChangesDialog defined somewhere else and imported above
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '350px',
        data: `You have unsaved changes! \nDo you want to leave?`
      });

      dialogRef.afterClosed().subscribe(result => {
        observer.next(result);
        observer.complete();
      }, (error) => {
        observer.next(false);
        observer.complete();
      });
    });
  }

}
