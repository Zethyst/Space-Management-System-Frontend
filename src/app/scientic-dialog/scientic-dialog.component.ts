import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Modal } from 'bootstrap';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms'; // Import this

interface ScientificData {
  dataId?: number; // Scientific Data ID
  missionId?: number; // Mission ID
  experimentType: string; // Equipment type (Experiment Type)
  collectedDate: string; // Collected Date
  dataReport: string; // Data Report
  researcherId: number; // Researcher ID
}

@Component({
  selector: 'app-scientific-data',
  standalone: true,
  templateUrl: './scientic-dialog.component.html',
  imports: [ReactiveFormsModule],
})
export class ScientificDataComponent {
  scientificDataList: ScientificData[] = []; // Array to store scientific data
  showScientificData: boolean = false; // To toggle scientific data view
  scientificDataForm: FormGroup; // Reactive form for scientific data
  isEditMode: boolean = false; // To differentiate between add and edit mode
  selectedScientificData: ScientificData | null = null; // Currently selected scientific data
  private apiUrl = 'https://space-management-system-e0f7bmevhmevg0gv.westindia-01.azurewebsites.net/api/ScientificData'; // Replace with your backend endpoint

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public dialogRef: MatDialogRef<ScientificDataComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.scientificDataForm = this.fb.group({
      missionId: [data?.missionId || null, [Validators.required]],
      experimentType: [data?.experimentType || '', [Validators.required]],
      collectedDate: [
        data?.collectedDate ? new Date(data.collectedDate).toISOString() : '',
        [Validators.required],
      ],
      dataReport: [data?.dataReport || '', [Validators.required]],
      researcherId: [data?.researcherId || null, [Validators.required]],
    });
  }

  closeDialog(): void {
    this.dialogRef.close(); // Closes the modal
  }

  toggleScientificData(): void {
    this.showScientificData = !this.showScientificData;
  }

  openScientificDataDialog(scientificData: ScientificData | null = null): void {
    this.isEditMode = scientificData !== null;
    this.selectedScientificData = scientificData;

    if (scientificData) {
      this.scientificDataForm.patchValue(scientificData);
    } else {
      // Reset form for add mode
      this.scientificDataForm.reset();
    }

    // Ensure the modal title reflects the correct mode
    const modalTitleElement = document.getElementById('scientificModalLabel');
    if (modalTitleElement) {
      modalTitleElement.textContent = this.isEditMode
        ? 'Edit Scientific Data'
        : 'Add Scientific Data';
    }

    // Show the modal
    const modalElement = document.getElementById('scientificModal') as HTMLElement;
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }

  saveScientificData(): void {
    if (this.scientificDataForm.invalid) {
      console.error('Form is invalid:', this.scientificDataForm.errors);
      return;
    }
    const scientificData: ScientificData = { ...this.scientificDataForm.value };
    scientificData.collectedDate = new Date(scientificData.collectedDate).toISOString();

    if (!this.isEditMode) {
      // Add new scientific data via POST request
      this.http.post(this.apiUrl, scientificData).subscribe(
        (response) => {
          console.log('Scientific Data added successfully:', response);
          this.getScientificData(); // Refresh the scientific data list
          this.closeDialog(); // Close the modal
        },
        (error) => {
          console.error('Error adding scientific data:', error);
        }
      );
    } else {
      // Update scientific data via PUT request
      this.http.put(`${this.apiUrl}/${scientificData.missionId}`, scientificData).subscribe(
        (response) => {
          console.log('Scientific Data updated successfully:', response);
          this.getScientificData(); // Refresh the scientific data list
          this.closeDialog(); // Close the modal
        },
        (error) => {
          console.error('Error updating scientific data:', error);
        }
      );
    }

    // Hide the modal
    const modalElement = document.getElementById('scientificModal') as HTMLElement;
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      modal?.hide();
    }
  }

  getScientificData(): void {
    this.http.get<ScientificData[]>(this.apiUrl).subscribe(
      (data) => {
        console.log('API Response:', data);
        this.scientificDataList = data || [];
      },
      (error) => {
        console.error('Error fetching scientific data:', error);
      }
    );
  }

  deleteScientificData(dataId: number): void {
    this.http.delete(`${this.apiUrl}/${dataId}`).subscribe(
      () => {
        console.log('Scientific Data deleted successfully');
        this.scientificDataList = this.scientificDataList.filter(
          (d) => d.dataId !== dataId
        );
      },
      (error) => {
        console.error('Error deleting scientific data:', error);
      }
    );
  }
}
