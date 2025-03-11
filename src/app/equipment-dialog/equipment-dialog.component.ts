import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Modal } from 'bootstrap';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms'; // Import this

interface Equipment {
  equipmentId?: number; // Primary key
  name: string; // Equipment name
  type: string; // Equipment type
  condition: string; // Equipment condition
  assignedMission: string; // Assigned mission
  maintenanceDate: string; // Maintenance date
}

@Component({
  selector: 'app-equipments',
  standalone: true,
  templateUrl: './equipment-dialog.component.html',
  imports: [ReactiveFormsModule],
})
export class EquipmentComponent {
  equipments: Equipment[] = []; // Array to store equipments
  showEquipments: boolean = false; // To toggle equipments view
  equipmentForm: FormGroup; // Reactive form for equipment
  isEditMode: boolean = false; // To differentiate between add and edit mode
  selectedEquipment: Equipment | null = null; // Currently selected equipment
  private apiUrl = 'https://space-management-system-e0f7bmevhmevg0gv.westindia-01.azurewebsites.net/api/Equipment'; // Replace with your backend endpoint

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public dialogRef: MatDialogRef<EquipmentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.equipmentForm = this.fb.group({
      equipmentId: [data?.equipmentId || null],
      name: [data?.name || '', [Validators.required]],
      type: [data?.type || '', [Validators.required]],
      condition: [data?.condition || '', [Validators.required]],
      assignedMission: [data?.assignedMission || '', [Validators.required]],
      maintenanceDate: [
        data?.maintenanceDate
          ? new Date(data.maintenanceDate).toISOString()
          : '',
        [Validators.required],
      ],
    });
  }

  closeDialog(): void {
    this.dialogRef.close(); // Closes the modal
  }

  toggleEquipments(): void {
    this.showEquipments = !this.showEquipments;
  }

  openEquipmentDialog(equipment: Equipment | null = null): void {
    this.isEditMode = equipment !== null;
    this.selectedEquipment = equipment;

    if (equipment) {
      this.equipmentForm.patchValue(equipment);
    } else {
      // Reset form for add mode
      this.equipmentForm.reset({ maintenanceDate: '' });
    }
   // Ensure the modal title reflects the correct mode
   const modalTitleElement = document.getElementById('equipmentModalLabel');
   if (modalTitleElement) {
     modalTitleElement.textContent = this.isEditMode
       ? 'Edit Equipment'
       : 'Add Equipment';
   }
   // Show the modal
   const modalElement = document.getElementById('equipmentModal') as HTMLElement;
   if (modalElement) {
     const modal = new Modal(modalElement);
     modal.show();
   }
  }

  saveEquipment(): void {
    if (this.equipmentForm.invalid) {
      console.error('Form is invalid:', this.equipmentForm.errors);
      return;
    }
    const equipmentData: Equipment = { ...this.equipmentForm.value };
    equipmentData.maintenanceDate = new Date(
      equipmentData.maintenanceDate
    ).toISOString();

    if (!this.isEditMode) {
      delete equipmentData.equipmentId; // Remove equipmentId for new entries
    }

    if (this.isEditMode) {
      // Update equipment via PUT request
      this.http
        .put(`${this.apiUrl}/${equipmentData.equipmentId}`, equipmentData)
        .subscribe(
          (response) => {
            console.log('Equipment updated successfully:', response);
            this.getEquipments(); // Refresh the equipments list
            this.closeDialog(); // Close the modal
          },
          (error) => {
            console.error('Error updating equipment:', error);
          }
        );
    } else {
      // Add new equipment via POST request
      this.http.post(this.apiUrl, equipmentData).subscribe(
        (response) => {
          console.log('Equipment added successfully:', response);
          this.getEquipments(); // Refresh the equipments list
          this.closeDialog(); // Close the modal
        },
        (error) => {
          console.error('Error adding equipment:', error);
        }
      );
    }

    // Hide the modal
    const modalElement = document.getElementById('equipmentModal') as HTMLElement;
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      modal?.hide();
    }
  }

  getEquipments() {
    this.http.get<Equipment[]>(this.apiUrl).subscribe(
      (data) => {
        console.log('API Response:', data);
        this.equipments = data || [];
      },
      (error) => {
        console.error('Error fetching equipments:', error);
      }
    );
  }

  deleteEquipment(equipmentId: number): void {
    this.http.delete(`${this.apiUrl}/${equipmentId}`).subscribe(
      () => {
        console.log('Equipment deleted successfully');
        this.equipments = this.equipments.filter(
          (e) => e.equipmentId !== equipmentId
        );
      },
      (error) => {
        console.error('Error deleting equipment:', error);
      }
    );
  }
}
