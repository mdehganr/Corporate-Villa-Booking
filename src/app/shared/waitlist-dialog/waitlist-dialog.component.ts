import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
    selector: 'app-waitlist-dialog',
    imports: [CommonModule, MatButtonModule, MatDialogModule],
    template: `
    <h2 mat-dialog-title>Dates Already Booked</h2>
    <mat-dialog-content>
      Would you like to be added to the waitlist for these dates?
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onNoClick()">No, Cancel</button>
      <button mat-button color="primary" (click)="onYesClick()">Yes, Add to Waitlist</button>
    </mat-dialog-actions>
  `
})
export class WaitlistDialogComponent {
    constructor(public dialogRef: MatDialogRef<WaitlistDialogComponent>) { }

    onNoClick(): void {
        this.dialogRef.close(false);
    }

    onYesClick(): void {
        this.dialogRef.close(true);
    }
}