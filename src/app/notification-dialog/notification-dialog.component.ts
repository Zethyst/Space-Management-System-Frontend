import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

interface NotificationData {
  notificationId?: number; // Notification ID
  type: string; // Notification Type
  timestamp: string; // Timestamp
  message: string; // Notification Message
  userId: number; // User ID
}

@Component({
  selector: 'app-notification-dialog',
  standalone: true,
  templateUrl: './notification-dialog.component.html',
  imports: [ReactiveFormsModule],
})
export class NotificationDialogComponent {
  notificationList: NotificationData[] = []; // Array to store notifications
  showNotifications: boolean = false; // Toggle view
  notificationForm: FormGroup; // Reactive form
  isEditMode: boolean = false; // Add/Edit mode
  selectedNotification: NotificationData | null = null; // Current notification
  private apiUrl = 'https://space-management-system-e0f7bmevhmevg0gv.westindia-01.azurewebsites.net/api/Notification'; // Backend endpoint

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public dialogRef: MatDialogRef<NotificationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.notificationForm = this.fb.group({
      type: [data?.type || '', [Validators.required]],
      timestamp: [data?.timestamp ? new Date(data.timestamp).toISOString() : '', [Validators.required]],
      message: [data?.message || '', [Validators.required]],
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  saveNotification(): void {
    if (this.notificationForm.invalid) {
      console.error('Form is invalid:', this.notificationForm.errors);
      return;
    }
    const notificationData: NotificationData = { ...this.notificationForm.value };
    notificationData.timestamp = new Date(notificationData.timestamp).toISOString();

    if (!this.isEditMode) {
      // Add new notification via POST request
      this.http.post(this.apiUrl, notificationData).subscribe(
        (response) => {
          console.log('Notification added successfully:', response);
          this.getNotifications();
          this.closeDialog();
          window.location.reload();
        },
        (error) => {
          console.error('Error adding notification:', error);
        }
      );
    } else {
      // Update notification via PUT request
      this.http.put(`${this.apiUrl}/${notificationData.notificationId}`, notificationData).subscribe(
        (response) => {
          console.log('Notification updated successfully:', response);
          this.getNotifications();
          this.closeDialog();
          window.location.reload();
        },
        (error) => {
          console.error('Error updating notification:', error);
        }
      );
    }
  }

  getNotifications(): void {
    this.http.get<NotificationData[]>(this.apiUrl).subscribe(
      (data) => {
        console.log('Notifications fetched:', data);
        this.notificationList = data || [];
      },
      (error) => {
        console.error('Error fetching notifications:', error);
      }
    );
  }

  deleteNotification(notificationId: number): void {
    this.http.delete(`${this.apiUrl}/${notificationId}`).subscribe(
      () => {
        console.log('Notification deleted successfully');
        this.notificationList = this.notificationList.filter(
          (d) => d.notificationId !== notificationId
        );
      },
      (error) => {
        console.error('Error deleting notification:', error);
      }
    );
  }
}
