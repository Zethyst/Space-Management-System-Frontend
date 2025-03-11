import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

interface CostData {
  costId?: number; // Unique ID for the cost entry
  missionId: number; // Mission ID
  expenseType: string; // Type of expense
  date: string; // Date of expense
  amount: number; // Expense amount
  responsiblePerson: string; // Responsible person
}

@Component({
  selector: 'app-cost-dialog',
  standalone: true,
  templateUrl: './cost-dialog.component.html',
  imports: [ReactiveFormsModule],
})
export class CostDialogComponent {
  costDataList: CostData[] = []; // Array to store cost data
  showCostData: boolean = false; // To toggle cost data view
  costDataForm: FormGroup; // Reactive form for cost data
  isEditMode: boolean = false; // To differentiate between add and edit mode
  selectedCostData: CostData | null = null; // Currently selected cost data
  private apiUrl = 'https://space-management-system-e0f7bmevhmevg0gv.westindia-01.azurewebsites.net/api/Cost'; // Replace with your backend endpoint

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public dialogRef: MatDialogRef<CostDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.costDataForm = this.fb.group({
      missionId: [data?.missionId || null, [Validators.required]],
      expenseType: [data?.expenseType || '', [Validators.required]],
      date: [
        data?.date ? new Date(data.date).toISOString() : '',
        [Validators.required],
      ],
      amount: [data?.amount || 0, [Validators.required, Validators.min(0)]],
      responsiblePerson: [data?.responsiblePerson || '', [Validators.required]],
    });
  }

  closeDialog(): void {
    this.dialogRef.close(); // Closes the modal
  }

  toggleCostData(): void {
    this.showCostData = !this.showCostData;
  }

  openCostDataDialog(costData: CostData | null = null): void {
    this.isEditMode = costData !== null;
    this.selectedCostData = costData;

    if (costData) {
      this.costDataForm.patchValue(costData);
    } else {
      // Reset form for add mode
      this.costDataForm.reset();
    }
  }

  saveCostData(): void {
    if (this.costDataForm.invalid) {
      console.error('Form is invalid:', this.costDataForm.errors);
      return;
    }
    const costData: CostData = { ...this.costDataForm.value };
    costData.date = new Date(costData.date).toISOString();

    if (!this.isEditMode) {
      // Add new cost data via POST request
      this.http.post(this.apiUrl, costData).subscribe(
        (response) => {
          console.log('Cost Data added successfully:', response);
          this.getCostData(); // Refresh the cost data list
          this.closeDialog(); // Close the modal
          window.location.reload();
        },
        (error) => {
          console.error('Error adding cost data:', error);
        }
      );
    } else {
      // Update cost data via PUT request
      this.http.put(`${this.apiUrl}/${this.selectedCostData?.costId}`, costData).subscribe(
        (response) => {
          console.log('Cost Data updated successfully:', response);
          this.getCostData(); // Refresh the cost data list
          this.closeDialog(); // Close the modal
          window.location.reload();
        },
        (error) => {
          console.error('Error updating cost data:', error);
        }
      );
    }
  }

  getCostData(): void {
    this.http.get<CostData[]>(this.apiUrl).subscribe(
      (data) => {
        console.log('API Response:', data);
        this.costDataList = data || [];
      },
      (error) => {
        console.error('Error fetching cost data:', error);
      }
    );
  }

  deleteCostData(costId: number): void {
    this.http.delete(`${this.apiUrl}/${costId}`).subscribe(
      () => {
        console.log('Cost Data deleted successfully');
        this.costDataList = this.costDataList.filter(
          (d) => d.costId !== costId
        );
      },
      (error) => {
        console.error('Error deleting cost data:', error);
      }
    );
  }
}
