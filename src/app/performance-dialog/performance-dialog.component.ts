import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Modal } from 'bootstrap';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

interface PerformanceData {
  performanceId?: number; // Mission Data ID
  missionId: number; // Mission ID
  objectivesMet: string; // Objectives Met
  dataCollected: string; // Data Collected
  supervisor: string; // Supervisor
  completionDate: string; // Completion Date
}

@Component({
  selector: 'app-mission-data',
  standalone: true,
  templateUrl: './performance-dialog.component.html',
  imports: [ReactiveFormsModule],
})
export class PerformanceDataComponent {
  performanceDataList: PerformanceData[] = []; // Array to store mission data
  showPerformanceData: boolean = false; // To toggle mission data view
  performanceDataForm: FormGroup; // Reactive form for mission data
  isEditMode: boolean = false; // To differentiate between add and edit mode
  selectedPerformanceData: PerformanceData | null = null; // Currently selected mission data
  private apiUrl = 'https://space-management-system-e0f7bmevhmevg0gv.westindia-01.azurewebsites.net/api/PerformanceData'; // Replace with your backend endpoint

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public dialogRef: MatDialogRef<PerformanceDataComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.performanceDataForm = this.fb.group({
      missionId: [data?.missionId || null, [Validators.required]],
      objectivesMet: [data?.objectivesMet || '', [Validators.required]],
      dataCollected: [data?.dataCollected || '', [Validators.required]],
      supervisor: [data?.supervisor || '', [Validators.required]],
      completionDate: [
        data?.completionDate ? new Date(data.completionDate).toISOString() : '',
        [Validators.required],
      ],
    });
  }

  closeDialog(): void {
    this.dialogRef.close(); // Closes the modal
  }

  togglePerformanceData(): void {
    this.showPerformanceData = !this.showPerformanceData;
  }

  openPerformanceDataDialog(performanceData: PerformanceData | null = null): void {
    this.isEditMode = performanceData !== null;
    this.selectedPerformanceData = performanceData;

    if (performanceData) {
      this.performanceDataForm.patchValue(performanceData);
    } else {
      // Reset form for add mode
      this.performanceDataForm.reset();
    }

    const modalElement = document.getElementById('missionModal') as HTMLElement;
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }

  savePerformanceData(): void {
    if (this.performanceDataForm.invalid) {
      console.error('Form is invalid:', this.performanceDataForm.errors);
      return;
    }
    const performanceData: PerformanceData = { ...this.performanceDataForm.value };
    performanceData.completionDate = new Date(performanceData.completionDate).toISOString();

    if (!this.isEditMode) {
      // Add new mission data via POST request
      this.http.post(this.apiUrl, performanceData).subscribe(
        (response) => {
          console.log('Mission Data added successfully:', response);
          this.getPerformanceData(); // Refresh the mission data list
          this.closeDialog(); // Close the modal
        },
        (error) => {
          console.error('Error adding mission data:', error);
        }
      );
    } else {
      // Update mission data via PUT request
      this.http.put(`${this.apiUrl}/${performanceData.missionId}`, performanceData).subscribe(
        (response) => {
          console.log('Mission Data updated successfully:', response);
          this.getPerformanceData(); // Refresh the mission data list
          this.closeDialog(); // Close the modal
        },
        (error) => {
          console.error('Error updating mission data:', error);
        }
      );
    }

    const modalElement = document.getElementById('missionModal') as HTMLElement;
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      modal?.hide();
    }
  }

  getPerformanceData(): void {
    this.http.get<PerformanceData[]>(this.apiUrl).subscribe(
      (data) => {
        console.log('API Response:', data);
        this.performanceDataList = data || [];
      },
      (error) => {
        console.error('Error fetching mission data:', error);
      }
    );
  }

  deletePerformanceData(performanceId: number): void {
    this.http.delete(`${this.apiUrl}/${performanceId}`).subscribe(
      () => {
        console.log('Mission Data deleted successfully');
        this.performanceDataList = this.performanceDataList.filter(
          (d) => d.performanceId !== performanceId
        );
      },
      (error) => {
        console.error('Error deleting mission data:', error);
      }
    );
  }
}
