import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

interface SafetyData {
  LogId?: number; // Safety Data ID
  missionId: number; // Mission ID
  description: string; // Safety incident description
  date: string; // Incident date
  severity: string; // Severity level
  resolutionStatus: string; // Status of resolution
  reportedBy: string; // Name of the reporter
}

@Component({
  selector: 'app-safety-dialog',
  standalone: true,
  templateUrl: './safety-dialog.component.html',
  imports: [ReactiveFormsModule],
})
export class SafetyDialogComponent {
  safetyDataList: SafetyData[] = []; // Array to store safety data
  showSafetyData: boolean = false; // To toggle safety data view
  safetyDataForm: FormGroup; // Reactive form for safety data
  isEditMode: boolean = false; // To differentiate between add and edit mode
  selectedSafetyData: SafetyData | null = null; // Currently selected safety data
  private apiUrl = 'https://space-management-system-e0f7bmevhmevg0gv.westindia-01.azurewebsites.net/api/SafetyData'; // Replace with your backend endpoint

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public dialogRef: MatDialogRef<SafetyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.safetyDataForm = this.fb.group({
      missionId: [data?.missionId || null, [Validators.required]],
      description: [data?.description || '', [Validators.required]],
      date: [
        data?.date ? new Date(data.date).toISOString() : '',
        [Validators.required],
      ],
      severity: [data?.severity || '', [Validators.required]],
      resolutionStatus: [data?.resolutionStatus || '', [Validators.required]],
      reportedBy: [data?.reportedBy || '', [Validators.required]],
    });
  }

  closeDialog(): void {
    this.dialogRef.close(); // Closes the modal
  }

  toggleSafetyData(): void {
    this.showSafetyData = !this.showSafetyData;
  }

  openSafetyDataDialog(safetyData: SafetyData | null = null): void {
    this.isEditMode = safetyData !== null;
    this.selectedSafetyData = safetyData;

    if (safetyData) {
      this.safetyDataForm.patchValue(safetyData);
    } else {
      // Reset form for add mode
      this.safetyDataForm.reset();
    }
  }

  saveSafetyData(): void {
    if (this.safetyDataForm.invalid) {
      console.error('Form is invalid:', this.safetyDataForm.errors);
      return;
    }
    const safetyData: SafetyData = { ...this.safetyDataForm.value };
    safetyData.date = new Date(safetyData.date).toISOString();

    if (!this.isEditMode) {
      // Add new safety data via POST request
      this.http.post(this.apiUrl, safetyData).subscribe(
        (response) => {
          console.log('Safety Data added successfully:', response);
          this.getSafetyData(); // Refresh the safety data list
          this.closeDialog(); // Close the modal
          window.location.reload();
        },
        (error) => {
          console.error('Error adding safety data:', error);
        }
      );
    } else {
      // Update safety data via PUT request
      this.http.put(`${this.apiUrl}/${this.selectedSafetyData?.LogId}`, safetyData).subscribe(
        (response) => {
          console.log('Safety Data updated successfully:', response);
          this.getSafetyData(); // Refresh the safety data list
          this.closeDialog(); // Close the modal
          window.location.reload();
        },
        (error) => {
          console.error('Error updating safety data:', error);
        }
      );
    }
  }

  getSafetyData(): void {
    this.http.get<SafetyData[]>(this.apiUrl).subscribe(
      (data) => {
        console.log('API Response:', data);
        this.safetyDataList = data || [];
      },
      (error) => {
        console.error('Error fetching safety data:', error);
      }
    );
  }

  deleteSafetyData(LogId: number): void {
    this.http.delete(`${this.apiUrl}/${LogId}`).subscribe(
      () => {
        console.log('Safety Data deleted successfully');
        this.safetyDataList = this.safetyDataList.filter(
          (d) => d.LogId !== LogId
        );
      },
      (error) => {
        console.error('Error deleting safety data:', error);
      }
    );
  }
}
