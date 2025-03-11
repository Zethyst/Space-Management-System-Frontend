import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { NotificationDialogComponent } from '../notification-dialog/notification-dialog.component';

@Component({
  selector: 'app-admin-only',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDialogModule,
  ],
  templateUrl: './notification.component.html',
  styles: [],
})
export class NotificationComponent implements OnInit {
  showNotification = false;

  notifications: any[] = [];

  private apiUrl = 'https://space-management-system-e0f7bmevhmevg0gv.westindia-01.azurewebsites.net/api'; // Replace with your backend endpoint
  private currentUser = '';
  constructor(private http: HttpClient, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.getNotifications();
  }

  private toggleButtonState(event: Event): void {
    const button = event.target as HTMLElement;
    button.classList.toggle('active');
  }

  //!------------------------------------------------------------------------------------------------------- Notifications
  toggleNotifications(event: Event): void {
    this.showNotification = !this.showNotification;
    this.toggleButtonState(event);
  }

  getNotifications() {
    this.http.get<any>(`${this.apiUrl}/Notification`).subscribe(
      (data) => {
        console.log('API Response:', data);
        this.notifications = Array.isArray(data) ? data : [data];
      },
      (error) => {
        console.error('Error fetching notifications:', error);
      }
    );
  }

  openNotificationDialog(notification?: any) {
    const dialogRef = this.dialog.open(NotificationDialogComponent, {
      width: '400px',
      data: notification || {}, // Pass existing notification or an empty object for a new one
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (notification) {
          // Edit notification
          this.editNotification({ ...notification, ...result });
        } else {
          // Add new notification
          this.addNotification(result);
        }
      }
    });
  }

  addNotification(newNotification: any) {
    this.http.post(`${this.apiUrl}/Notification`, newNotification).subscribe(
      () => {
        console.log('Notification added successfully');
        this.getNotifications();
      },
      (error) => {
        console.error('Error adding notification:', error);
      }
    );
  }

  editNotification(updatedNotification: any) {
    this.http
      .put(`${this.apiUrl}/Notification/${updatedNotification.notificationId}`, updatedNotification)
      .subscribe(
        () => {
          console.log('Notification updated successfully');
          this.getNotifications();
        },
        (error) => {
          console.error('Error updating notification:', error);
        }
      );
  }

  deleteNotification(id: number) {
    this.http.delete(`${this.apiUrl}/Notification/${id}`).subscribe(
      () => {
        this.notifications = this.notifications.filter((notification) => notification.id !== id);
        console.log('Deleted notification with ID:', id);
        window.location.reload();
      },
      (error) => {
        console.error('Error deleting notification:', error);
      }
    );
  }
}