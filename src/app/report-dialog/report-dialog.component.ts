import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

interface ReportData {
  reportId?: number; // Report ID
  type: string; // Report Type
  generatedDate: string; // Generated Date
  data: string; // Report Data
  createdBy: string; // Created By
}

@Component({
  selector: 'app-report-dialog',
  standalone: true,
  templateUrl: './report-dialog.component.html',
  imports: [ReactiveFormsModule],
})
export class ReportDialogComponent {
  reportDataList: ReportData[] = []; // Array to store reports
  showReportData: boolean = false; // Toggle view
  reportDataForm: FormGroup; // Reactive form
  isEditMode: boolean = false; // Add/Edit mode
  selectedReportData: ReportData | null = null; // Current report data
  private apiUrl = 'https://space-management-system-e0f7bmevhmevg0gv.westindia-01.azurewebsites.net/api/Report'; // Backend endpoint

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public dialogRef: MatDialogRef<ReportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.reportDataForm = this.fb.group({
      type: [data?.type || '', [Validators.required]],
      generatedDate: [data?.generatedDate ? new Date(data.generatedDate).toISOString() : '', [Validators.required]],
      data: [data?.data || '', [Validators.required]],
      createdBy: [data?.createdBy || '', [Validators.required]],
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  saveReportData(): void {
    if (this.reportDataForm.invalid) {
      console.error('Form is invalid:', this.reportDataForm.errors);
      return;
    }
    const reportData: ReportData = { ...this.reportDataForm.value };
    reportData.generatedDate = new Date(reportData.generatedDate).toISOString();

    if (!this.isEditMode) {
      this.http.post(this.apiUrl, reportData).subscribe(
        (response) => {
          console.log('Report added successfully:', response);
          this.getReportData();
          this.closeDialog();
          window.location.reload();
        },
        (error) => {
          console.error('Error adding report:', error);
        }
      );
    } else {
      this.http.put(`${this.apiUrl}/${this.selectedReportData?.reportId}`, reportData).subscribe(
        (response) => {
          console.log('Report updated successfully:', response);
          this.getReportData();
          this.closeDialog();
          window.location.reload();
        },
        (error) => {
          console.error('Error updating report:', error);
        }
      );
    }
  }

  getReportData(): void {
    this.http.get<ReportData[]>(this.apiUrl).subscribe(
      (data) => {
        console.log('API Response:', data);
        this.reportDataList = data || [];
      },
      (error) => {
        console.error('Error fetching report data:', error);
      }
    );
  }

  deleteReportData(reportId: number): void {
    this.http.delete(`${this.apiUrl}/${reportId}`).subscribe(
      () => {
        console.log('Report deleted successfully');
        this.reportDataList = this.reportDataList.filter(
          (d) => d.reportId !== reportId
        );
      },
      (error) => {
        console.error('Error deleting report:', error);
      }
    );
  }
}
