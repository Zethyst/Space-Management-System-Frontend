import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

interface EnvironmentData {
  assessmentId?: number; // Assessment ID
  missionId: number; // Mission ID
  impactType: string; // Impact Type
  date: string; // Assessment Date
  recommendations: string; // Recommendations
  conductedBy: string; // Conducted By
}

@Component({
  selector: 'app-environment-dialog',
  standalone: true,
  templateUrl: './environment-dialog.component.html',
  imports: [ReactiveFormsModule],
})
export class EnvironmentDialogComponent {
  environmentDataList: EnvironmentData[] = []; // Array to store assessments
  showEnvironmentData: boolean = false; // Toggle view
  environmentDataForm: FormGroup; // Reactive form
  isEditMode: boolean = false; // Add/Edit mode
  selectedEnvironmentData: EnvironmentData | null = null; // Current data
  private apiUrl = 'https://space-management-system-e0f7bmevhmevg0gv.westindia-01.azurewebsites.net/api/Environment'; // Backend endpoint

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public dialogRef: MatDialogRef<EnvironmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.environmentDataForm = this.fb.group({
      missionId: [data?.missionId || null, [Validators.required]],
      impactType: [data?.impactType || '', [Validators.required]],
      date: [data?.date ? new Date(data.date).toISOString() : '', [Validators.required]],
      recommendations: [data?.recommendations || '', [Validators.required]],
      conductedBy: [data?.conductedBy || '', [Validators.required]],
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  saveEnvironmentData(): void {
    if (this.environmentDataForm.invalid) {
      console.error('Form is invalid:', this.environmentDataForm.errors);
      return;
    }
    const environmentData: EnvironmentData = { ...this.environmentDataForm.value };
    environmentData.date = new Date(environmentData.date).toISOString();
      
    if (!this.isEditMode) {
      console.log("environment",environmentData);
      
      this.http.post(this.apiUrl, environmentData).subscribe(
        (response) => {
          console.log('Environment Assessment added successfully:', response);
          this.getEnvironmentData();
          this.closeDialog();
          window.location.reload();
        },
        (error) => {
          console.error('Error adding environment assessment:', error);
        }
      );
    } else {
      this.http.put(`${this.apiUrl}/${this.selectedEnvironmentData?.assessmentId}`, environmentData).subscribe(
        (response) => {
          console.log('Environment Assessment updated successfully:', response);
          this.getEnvironmentData();
          this.closeDialog();
          window.location.reload();
        },
        (error) => {
          console.error('Error updating environment assessment:', error);
        }
      );
    }
  }

  getEnvironmentData(): void {
    this.http.get<EnvironmentData[]>(this.apiUrl).subscribe(
      (data) => {
        console.log('API Response:', data);
        this.environmentDataList = data || [];
      },
      (error) => {
        console.error('Error fetching environment data:', error);
      }
    );
  }

  deleteEnvironmentData(assessmentId: number): void {
    this.http.delete(`${this.apiUrl}/${assessmentId}`).subscribe(
      () => {
        console.log('Environment Assessment deleted successfully');
        this.environmentDataList = this.environmentDataList.filter(
          (d) => d.assessmentId !== assessmentId
        );
      },
      (error) => {
        console.error('Error deleting environment assessment:', error);
      }
    );
  }
}
