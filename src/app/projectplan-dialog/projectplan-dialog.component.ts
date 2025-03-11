import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Modal } from 'bootstrap';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms'; // Import this
import { window } from 'rxjs';

interface ProjectPlan {
  planId?: number; // Project Plan ID
  missionId?: number; // Mission ID
  activityType: string; // Activity Type
  assignedEngineer: string; // Assigned Engineer
  status: string; // Status
  startDate: string; // Start Date
  endDate: string; // End Date
}

@Component({
  selector: 'app-scientific-data',
  standalone: true,
  templateUrl: './projectplan-dialog.component.html',
  imports: [ReactiveFormsModule],
})
export class ProjectPlanComponent {
  projectPlanList: ProjectPlan[] = []; // Array to store project plan
  showProjectPlan: boolean = false; // To toggle project plan view
  projectPlanForm: FormGroup; // Reactive form for project plan
  isEditMode: boolean = false; // To differentiate between add and edit mode
  selectedProjectPlan: ProjectPlan | null = null; // Currently selected project plan
  private apiUrl = 'https://space-management-system-e0f7bmevhmevg0gv.westindia-01.azurewebsites.net/api/ProjectPlan'; // Replace with your backend endpoint

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public dialogRef: MatDialogRef<ProjectPlanComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.projectPlanForm = this.fb.group({
      missionId: [data?.missionId || null, [Validators.required]],
      activityType: [data?.activityType || '', [Validators.required]],
      assignedEngineer: [data?.assignedEngineer || '', [Validators.required]],
      status: [data?.status || 'Pending', [Validators.required]], // Default to Pending if no status is provided
      startDate: [
        data?.startDate ? new Date(data.startDate).toISOString() : '',
        [Validators.required],
      ],
      endDate: [
        data?.endDate ? new Date(data.endDate).toISOString() : '',
        [Validators.required],
      ],
    });
  }

  closeDialog(): void {
    this.dialogRef.close(); // Closes the modal
  }

  toggleProjectPlan(): void {
    this.showProjectPlan = !this.showProjectPlan;
  }

  openProjectPlanDialog(projectPlan: ProjectPlan | null = null): void {
    this.isEditMode = projectPlan !== null;
    this.selectedProjectPlan = projectPlan;

    if (projectPlan) {
      this.projectPlanForm.patchValue(projectPlan);
    } else {
      // Reset form for add mode
      this.projectPlanForm.reset({ status: 'Pending' });
    }

    // Ensure the modal title reflects the correct mode
    const modalTitleElement = document.getElementById('projectPlanLabel');
    if (modalTitleElement) {
      modalTitleElement.textContent = this.isEditMode
        ? 'Edit Project Plan'
        : 'Add Project Plan';
    }

    // Show the modal
    const modalElement = document.getElementById('projectPlan') as HTMLElement;
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }

  saveProjectPlan(): void {
    if (this.projectPlanForm.invalid) {
      console.error('Form is invalid:', this.projectPlanForm.errors);
      return;
    }
    const projectPlan: ProjectPlan = { ...this.projectPlanForm.value };
    projectPlan.startDate = new Date(projectPlan.startDate).toISOString();
    projectPlan.endDate = new Date(projectPlan.endDate).toISOString();

    if (!this.isEditMode) {
      // Add new project plan via POST request
      this.http.post(this.apiUrl, projectPlan).subscribe(
        (response) => {
          console.log('Project Plan added successfully:', response);
          this.getProjectPlan(); // Refresh the project plan list
          this.closeDialog(); // Close the modal
        },
        (error) => {
          console.error('Error adding project plan:', error);
        }
      );
    } else {
      // Update project plan via PUT request
      this.http.put(`${this.apiUrl}/${projectPlan.missionId}`, projectPlan).subscribe(
        (response) => {
          console.log('Project Plan updated successfully:', response);
          this.getProjectPlan(); // Refresh the project plan list
          this.closeDialog(); // Close the modal
        },
        (error) => {
          console.error('Error updating project plan:', error);
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

  getProjectPlan(): void {
    this.http.get<ProjectPlan[]>(this.apiUrl).subscribe(
      (data) => {
        console.log('API Response:', data);
        this.projectPlanList = data || [];
      },
      (error) => {
        console.error('Error fetching project plan:', error);
      }
    );
  }

  deleteProjectPlan(planId: number): void {
    this.http.delete(`${this.apiUrl}/${planId}`).subscribe(
      () => {
        console.log('Project Plan deleted successfully');
        this.projectPlanList = this.projectPlanList.filter(
          (d) => d.planId !== planId
        );
      },
      (error) => {
        console.error('Error deleting project plan:', error);
      }
    );
  }
}
