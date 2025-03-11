import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

interface User {
  id: string;        // User ID
  fullName: string;  // Full Name
  email: string;     // Email
  gender: string;    // Gender
  role: string;      // Role
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  templateUrl: './user-dialog.component.html',
  imports: [ReactiveFormsModule],
})
export class UserManagementComponent {
  userForm: FormGroup; // Reactive form for user data
  isEditMode: boolean = false; // To differentiate between add and edit mode
  private apiUrl = 'https://space-management-system-e0f7bmevhmevg0gv.westindia-01.azurewebsites.net/api/api/Users'; // Replace with your backend endpoint

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public dialogRef: MatDialogRef<UserManagementComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User | null
  ) {
    // Initialize the reactive form with user data or default values
    this.userForm = this.fb.group({
      fullName: [data?.fullName || '', [Validators.required]],
      email: [data?.email || '', [Validators.required, Validators.email]],
      gender: [data?.gender || '', [Validators.required]],
      role: [data?.role || '', [Validators.required]],
    });

    this.isEditMode = !!data; // Set edit mode based on provided data
  }

  closeDialog(): void {
    this.dialogRef.close(); // Close the modal dialog
  }

  saveUserData(): void {
    if (this.userForm.invalid) {
      console.error('Form is invalid:', this.userForm.errors);
      return;
    }

    const user: User = { id: this.data?.id || '', ...this.userForm.value };

    if (!this.isEditMode) {
      // Add a new user via POST request
      this.http.post(this.apiUrl, user).subscribe(
        (response) => {
          console.log('User added successfully:', response);
          this.dialogRef.close(true); // Close the modal and indicate success
        },
        (error) => {
          console.error('Error adding user:', error);
        }
      );
    } else {
      // Update user via PUT request
      this.http.put(`${this.apiUrl}/${user.id}`, user).subscribe(
        (response) => {
          console.log('User updated successfully:', response);
          this.dialogRef.close(true); // Close the modal and indicate success
          window.location.reload();
        },
        (error) => {
          console.error('Error updating user:', error);
        }
      );
    }
  }
}
