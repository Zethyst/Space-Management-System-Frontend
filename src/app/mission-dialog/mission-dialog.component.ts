import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Modal } from 'bootstrap';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms'; // Import this

interface Mission {
  missionId?: number; // Primary key
  name: string; // Mission name
  objective: string; // Mission objective
  launchDate: string; // ISO date string for the launch date
  status: string; // Status (Active, Completed, etc.)
  assignedTeam: string; // Assigned team
  directorId: number; // Director's ID
}

@Component({
  selector: 'app-missions',
  standalone: true,
  templateUrl: './mission-dialog.component.html',
  imports: [ReactiveFormsModule],
})
export class MissionsComponent {
  missions: Mission[] = []; // Array to store missions
  showMissions: boolean = false; // To toggle missions view
  missionForm: FormGroup; // Reactive form for mission
  isEditMode: boolean = false; // To differentiate between add and edit mode
  selectedMission: Mission | null = null; // Currently selected mission
  private apiUrl = 'https://space-management-system-e0f7bmevhmevg0gv.westindia-01.azurewebsites.net/api/Mission'; // Replace with your backend endpoint
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public dialogRef: MatDialogRef<MissionsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.missionForm = this.fb.group({
      missionId: [data?.missionId || null],
      name: [data?.name || '', [Validators.required]],
      objective: [data?.objective || '', [Validators.required]],
      launchDate: [
        data?.launchDate ? new Date(data.launchDate).toISOString() : '',
        [Validators.required],
      ],
      status: [data?.status || 'Active', [Validators.required]],
      assignedTeam: [data?.assignedTeam || '', [Validators.required]],
      directorId: [
        data?.directorId || 0,
        [Validators.required, Validators.min(1)],
      ],
    });
  }

  closeDialog(): void {
    this.dialogRef.close(); // Closes the modal
  }

  toggleMissions(): void {
    this.showMissions = !this.showMissions;
  }

  openMissionDialog(mission: Mission | null = null): void {
    this.isEditMode = mission !== null;
    this.selectedMission = mission;

    if (mission) {
      this.missionForm.patchValue(mission);
    } else {
      this.missionForm.reset({ status: 'Active', directorId: 0 });
    }

    // Show the modal
    const modalElement = document.getElementById('missionModal') as HTMLElement;
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }

  save(): void {
    if (this.missionForm.valid) {
      this.dialogRef.close(this.missionForm.value);
    }
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
  getMissions() {
    this.http.get<any>(this.apiUrl).subscribe(
      (data) => {
        console.log('API Response:', data);
        this.missions = Array.isArray(data) ? data : [data];
      },
      (error) => {
        console.error('Error fetching missions:', error);
      }
    );
  }
  saveMission(): void {
    if (this.missionForm.invalid) {
      console.error('Form is invalid:', this.missionForm.errors);
      return;
    }
    const missionData: Mission = { ...this.missionForm.value };

    console.log('mission', missionData);
    missionData.launchDate = new Date(missionData.launchDate).toISOString();

    if (!this.isEditMode) {
      delete missionData.missionId; // Remove missionId for new entries
    }
    if (this.isEditMode) {
      // Update mission via PUT request
      this.http
        .put(`${this.apiUrl}/${missionData.missionId}`, missionData)
        .subscribe(
          (response) => {
            console.log('Mission updated successfully:', response);
            this.getMissions(); // Refresh the missions list
            this.closeDialog(); // Close the modal
          },
          (error) => {
            console.error('Error updating mission:', error);
          }
        );
    } else {
      // Add new mission via POST request
      this.http.post(this.apiUrl, missionData).subscribe(
        (response) => {
          console.log('Mission added successfully:', response);
          window.location.reload();
          this.getMissions(); // Refresh the missions list
          this.closeDialog(); // Close the modal
        },
        (error) => {
          console.error('Error adding mission:', error);
        }
      );
    }

    // Hide the modal
    const modalElement = document.getElementById('missionModal') as HTMLElement;
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      modal?.hide();
    }
  }

  deleteMission(missionId: number): void {
    this.missions = this.missions.filter((m) => m.missionId !== missionId);
  }
}
