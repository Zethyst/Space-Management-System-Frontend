import { environment } from './../../../environments/environment.development';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MissionsComponent } from '../../mission-dialog/mission-dialog.component';
import { EquipmentComponent } from '../../equipment-dialog/equipment-dialog.component';
import { ScientificDataComponent } from '../../scientic-dialog/scientic-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { ProjectPlanComponent } from '../../projectplan-dialog/projectplan-dialog.component';
import { PerformanceDataComponent } from '../../performance-dialog/performance-dialog.component';
import { UserManagementComponent } from '../../user-dialog/user-dialog.component';
import { SafetyDialogComponent } from '../../safety-dialog/safety-dialog.component';
import { CostDialogComponent } from '../../cost-dialog/cost-dialog.component';
import { EnvironmentDialogComponent } from '../../environment-dialog/environment-dialog.component';
import { ReportDialogComponent } from '../../report-dialog/report-dialog.component';

@Component({
  selector: 'app-admin-only',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDialogModule,
  ],
  templateUrl: './admin-only.component.html',
  styles: [],
})
export class AdminOnlyComponent implements OnInit {
  showUsers = false;
  showMissions = false;
  showEquipments = false;
  showScientificData = false;
  showProjectPlan = false;
  showPerformanceData = false;
  showSafetyData = false;
  showCostData = false;
  showEnvironmentData = false;
  showReportData = false;
  showNotification = false;

  roles: any[] = [];
  users: any[] = [];
  missions: any[] = [];
  equipments: any[] = [];
  scientificDataRecords: any[] = [];
  projectPlanRecords: any[] = [];
  performanceDataRecords: any[] = [];
  safetyDataRecords: any[] = [];
  environmentDataRecords: any[] = [];
  costDataRecords: any[] = [];
  reportDataRecords: any[] = [];

  private apiUrl = 'https://space-management-system-e0f7bmevhmevg0gv.westindia-01.azurewebsites.net/api'; // Replace with your backend endpoint
  private currentUser = '';
  constructor(private http: HttpClient, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.getUsers();
    this.getRoles();
    this.getMissions();
    this.getEquipments();
    this.getScientificDataRecords();
    this.getProjectPlanRecords();
    this.getPerformanceDataRecords();
    this.getSafetyDataRecords();
    this.getCostDataRecords();
    this.getEnvironmentDataRecords();
    this.getReportDataRecords();
  }

  private toggleButtonState(event: Event): void {
    const button = event.target as HTMLElement;
    button.classList.toggle('active');
  }

  //!------------------------------------------------------------------------------------------------------- Users
  toggleUsers(event: Event): void {
    this.showUsers = !this.showUsers; // Toggle visibility
    this.toggleButtonState(event); // Change button appearance
  }

  getRoles() {
    this.http.get<any>(`${this.apiUrl}/Roles`).subscribe(
      (data) => {
        console.log('Roles API Response:', data);
        this.roles = Array.isArray(data) ? data : [];
      },
      (error) => {
        console.error('Error fetching roles:', error);
      }
    );
  }

  updateUserRole(userId: string, newRoleId: string) {
    // Find the selected role from the roles list
    const updatedRole = this.roles.find((role) => role.id === newRoleId);
    if (!updatedRole) {
      console.error('Selected role not found.');
      return;
    }

    // Create the payload in the expected format
    const payload = {
      userId: userId,
      roleName: updatedRole.name, // Use role name as required by the API
    };

    // Send the PATCH request to the backend
    this.http.post(`${this.apiUrl}/AssignRole`, payload).subscribe(
      () => {
        console.log(`Updated role for user ${userId} to ${updatedRole.name}`);

        // Update the user object in the client-side data
        const user = this.users.find((u) => u.id === userId);
        if (user) {
          user.role = updatedRole.name;
        }
      },
      (error) => {
        console.error('Error updating user role:', error);
      }
    );
  }

  getUsers() {
    this.http.get<any>(`${this.apiUrl}/Users`).subscribe(
      (data) => {
        console.log('API Response:', data);
        this.users = Array.isArray(data) ? data : [data];
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  }

  openUsersDialog(user?: any) {
    const dialogRef = this.dialog.open(UserManagementComponent, {
      width: '400px',
      data: user || {}, // Pass existing user or an empty object for a new one
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (user) {
          // Edit user
          this.editUser({ ...user, ...result });
        } else {
          // Add new user
          this.addUser(result);
        }
      }
    });
  }

  addUser(newUser: any) {
    this.http.post(`${this.apiUrl}/Users`, newUser).subscribe(
      () => {
        console.log('User added successfully');
        this.getUsers();
      },
      (error) => {
        console.error('Error adding user:', error);
      }
    );
  }

  editUser(updatedUser: any) {
    this.http
      .put(`${this.apiUrl}/Users/${updatedUser.Id}`, updatedUser)
      .subscribe(
        () => {
          console.log('User updated successfully');
          this.getUsers();
        },
        (error) => {
          console.error('Error updating user:', error);
        }
      );
  }

  deleteUser(id: string) {
    // Fetch the current user profile first
    this.getCurrentUser().then(() => {
      // Find the user being deleted
      console.log('users', this.users);
      const userToDelete = this.users.find((user) => user.id === id);
      console.log('userToDelete', userToDelete);

      // Check if the current user's email matches the email of the user to delete
      if (userToDelete && this.currentUser === userToDelete.email) {
        alert('Cannot delete the currently logged-in user.');
        return;
      }

      // Proceed with deletion
      this.http.delete(`${this.apiUrl}/Users/${id}`).subscribe(
        () => {
          this.users = this.users.filter((user) => user.Id !== id);
          console.log('Deleted user with ID:', id);
          window.location.reload();
        },
        (error) => {
          console.error('Error deleting user:', error);
        }
      );
    });
  }

  // Updated getCurrentUser method to return a Promise
  getCurrentUser(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get<any>(`${this.apiUrl}/UserProfile`).subscribe(
        (data) => {
          console.log('API Response:', data);
          this.currentUser = data.email;
          resolve();
        },
        (error) => {
          console.error('Error fetching current user:', error);
          reject(error);
        }
      );
    });
  }

  //!------------------------------------------------------------------------------------------------------- Missions
  toggleMissions(event: Event): void {
    this.showMissions = !this.showMissions;
    this.toggleButtonState(event);
  }

  getMissions() {
    this.http.get<any>(`${this.apiUrl}/Mission`).subscribe(
      (data) => {
        console.log('API Response:', data);
        this.missions = Array.isArray(data) ? data : [data];
      },
      (error) => {
        console.error('Error fetching missions:', error);
      }
    );
  }

  openMissionDialog(mission?: any) {
    const dialogRef = this.dialog.open(MissionsComponent, {
      width: '400px',
      data: mission || {}, // Pass existing mission or an empty object for a new one
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (mission) {
          // Edit mission
          this.editMission({ ...mission, ...result });
        } else {
          // Add new mission
          this.addMission(result);
        }
      }
    });
  }

  addMission(newMission: any) {
    this.http.post(`${this.apiUrl}/Mission`, newMission).subscribe(
      () => {
        console.log('Mission added successfully');
        this.getMissions();
      },
      (error) => {
        console.error('Error adding mission:', error);
      }
    );
  }

  editMission(updatedMission: any) {
    this.http
      .put(`${this.apiUrl}/Mission/${updatedMission.missionId}`, updatedMission)
      .subscribe(
        () => {
          console.log('Mission updated successfully');
          this.getMissions();
        },
        (error) => {
          console.error('Error updating mission:', error);
        }
      );
  }

  deleteMission(id: number) {
    this.http.delete(`${this.apiUrl}/Mission/${id}`).subscribe(
      () => {
        this.missions = this.missions.filter((mission) => mission.id !== id);
        console.log('Deleted mission with ID:', id);
        window.location.reload();
      },
      (error) => {
        console.error('Error deleting mission:', error);
      }
    );
  }

  //!------------------------------------------------------------------------------------------------------- Equipments

  toggleEquipments(event: Event): void {
    this.showEquipments = !this.showEquipments;
    this.toggleButtonState(event);
  }

  getEquipments() {
    this.http.get<any>(`${this.apiUrl}/Equipment`).subscribe(
      (data) => {
        console.log('API Response:', data);
        this.equipments = Array.isArray(data) ? data : [data];
      },
      (error) => {
        console.error('Error fetching equipments:', error);
      }
    );
  }

  openEquipmentDialog(equipment?: any) {
    const dialogRef = this.dialog.open(EquipmentComponent, {
      width: '400px',
      data: equipment || {}, // Pass existing equipment or an empty object for a new one
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (equipment) {
          // Edit equipment
          this.editMission({ ...equipment, ...result });
        } else {
          // Add new equipment
          this.addMission(result);
        }
      }
    });
  }

  addEquipment(newEquipment: any) {
    this.http.post(`${this.apiUrl}/Equipment`, newEquipment).subscribe(
      () => {
        console.log('Equipment added successfully');
        this.getEquipments();
      },
      (error) => {
        console.error('Error adding mission:', error);
      }
    );
  }

  editEquipment(updatedEquipment: any) {
    this.http
      .put(
        `${this.apiUrl}/Equipment/${updatedEquipment.equipmentId}`,
        updatedEquipment
      )
      .subscribe(
        () => {
          console.log('Equipment updated successfully');
          this.getEquipments();
        },
        (error) => {
          console.error('Error updating mission:', error);
        }
      );
  }

  deleteEquipment(id: number) {
    this.http.delete(`${this.apiUrl}/Equipment/${id}`).subscribe(
      () => {
        this.equipments = this.equipments.filter(
          (equipment) => equipment.id !== id
        );
        console.log('Deleted equipment with ID:', id);
        window.location.reload();
      },
      (error) => {
        console.error('Error deleting equipment:', error);
      }
    );
  }
  //!------------------------------------------------------------------------------------------------------- Scientific Data

  toggleScientificData(event: Event): void {
    this.showScientificData = !this.showScientificData;
    this.toggleButtonState(event);
  }

  getScientificDataRecords() {
    this.http.get<any>(`${this.apiUrl}/ScientificData`).subscribe(
      (data) => {
        console.log('API Response:', data);
        this.scientificDataRecords = Array.isArray(data) ? data : [data];
      },
      (error) => {
        console.error('Error fetching scientificDataRecords:', error);
      }
    );
  }

  openScientificDataDialog(scientificData?: any) {
    const dialogRef = this.dialog.open(ScientificDataComponent, {
      width: '400px',
      data: scientificData || {}, // Pass existing scientificData or an empty object for a new one
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (scientificData) {
          // Edit scientificData
          this.editMission({ ...scientificData, ...result });
        } else {
          // Add new scientificData
          this.addMission(result);
        }
      }
    });
  }

  addScientificData(scientificData: any) {
    this.http.post(`${this.apiUrl}/ScientificData`, scientificData).subscribe(
      () => {
        console.log('Scientific Data added successfully');
        this.getScientificDataRecords();
        window.location.reload();
      },
      (error) => {
        console.error('Error adding scientific data:', error);
      }
    );
  }

  editScientificData(updatedScientificData: any) {
    this.http
      .put(
        `${this.apiUrl}/ScientificData/${updatedScientificData.dataId}`,
        updatedScientificData
      )
      .subscribe(
        () => {
          console.log('Scientific Data updated successfully');
          this.getScientificDataRecords();
        },
        (error) => {
          console.error('Error updating scientific data:', error);
        }
      );
  }

  deleteScientificData(id: number) {
    this.http.delete(`${this.apiUrl}/ScientificData/${id}`).subscribe(
      () => {
        this.scientificDataRecords = this.scientificDataRecords.filter(
          (scientificData) => scientificData.id !== id
        );
        console.log('Deleted scientificData with ID:', id);
        window.location.reload();
      },
      (error) => {
        console.error('Error deleting scientificData:', error);
      }
    );
  }
  //!------------------------------------------------------------------------------------------------------- Project Plans

  toggleProjectPlan(event: Event): void {
    this.showProjectPlan = !this.showProjectPlan;
    this.toggleButtonState(event);
  }

  getProjectPlanRecords() {
    this.http.get<any>(`${this.apiUrl}/ProjectPlan`).subscribe(
      (data) => {
        console.log('API Response:', data);
        this.projectPlanRecords = Array.isArray(data) ? data : [data];
      },
      (error) => {
        console.error('Error fetching Project Plan Records:', error);
      }
    );
  }

  openProjectPlanDialog(projectPlan?: any) {
    const dialogRef = this.dialog.open(ProjectPlanComponent, {
      width: '400px',
      data: projectPlan || {}, // Pass existing projectPlan or an empty object for a new one
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (projectPlan) {
          // Edit projectPlan
          this.editMission({ ...projectPlan, ...result });
        } else {
          // Add new projectPlan
          this.addMission(result);
        }
      }
    });
  }

  addProjectPlan(projectPlan: any) {
    this.http.post(`${this.apiUrl}/ProjectPlan`, projectPlan).subscribe(
      () => {
        console.log('Project Plan added successfully');
        this.getProjectPlanRecords();
        window.location.reload();
      },
      (error) => {
        console.error('Error adding project plan:', error);
      }
    );
  }

  editProjectPlan(updatedProjectPlan: any) {
    this.http
      .put(
        `${this.apiUrl}/ProjectPlan/${updatedProjectPlan.PlanId}`,
        updatedProjectPlan
      )
      .subscribe(
        () => {
          console.log('Project Plan updated successfully');
          this.getProjectPlanRecords();
          window.location.reload();
        },
        (error) => {
          console.error('Error updating project plan:', error);
        }
      );
  }

  deleteProjectPlan(id: number) {
    this.http.delete(`${this.apiUrl}/ProjectPlan/${id}`).subscribe(
      () => {
        this.projectPlanRecords = this.projectPlanRecords.filter(
          (projectPlan) => projectPlan.id !== id
        );
        console.log('Deleted project plan with ID:', id);
        window.location.reload();
      },
      (error) => {
        console.error('Error deleting project plan:', error);
      }
    );
  }
  //!------------------------------------------------------------------------------------------------------- Performance Data

  togglePerformanceData(event: Event): void {
    this.showPerformanceData = !this.showPerformanceData;
    this.toggleButtonState(event);
  }

  getPerformanceDataRecords() {
    this.http.get<any>(`${this.apiUrl}/PerformanceData`).subscribe(
      (data) => {
        console.log('API Response:', data);
        this.performanceDataRecords = Array.isArray(data) ? data : [data];
      },
      (error) => {
        console.error('Error fetching Performance Data Records:', error);
      }
    );
  }

  openPerformanceDataDialog(performanceData?: any) {
    const dialogRef = this.dialog.open(PerformanceDataComponent, {
      width: '400px',
      data: performanceData || {}, // Pass existing performanceData or an empty object for a new one
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (performanceData) {
          // Edit performanceData
          this.editMission({ ...performanceData, ...result });
        } else {
          // Add new performanceData
          this.addMission(result);
        }
      }
    });
  }

  addPerformanceData(performanceData: any) {
    this.http.post(`${this.apiUrl}/PerformanceData`, performanceData).subscribe(
      () => {
        console.log('Performance Data added successfully');
        this.getPerformanceDataRecords();
        window.location.reload();
      },
      (error) => {
        console.error('Error adding performance data:', error);
      }
    );
  }

  editPerformanceData(updatedPerformanceData: any) {
    this.http
      .put(
        `${this.apiUrl}/PerformanceData/${updatedPerformanceData.performanceId}`,
        updatedPerformanceData
      )
      .subscribe(
        () => {
          console.log('Performance Data updated successfully');
          this.getPerformanceDataRecords();
          window.location.reload();
        },
        (error) => {
          console.error('Error updating performance data:', error);
        }
      );
  }

  deletePerformanceData(id: number) {
    this.http.delete(`${this.apiUrl}/PerformanceData/${id}`).subscribe(
      () => {
        this.performanceDataRecords = this.performanceDataRecords.filter(
          (performanceData) => performanceData.performanceId !== id
        );
        console.log('Deleted performance data with ID:', id);
        window.location.reload();
      },
      (error) => {
        console.error('Error deleting performance data:', error);
      }
    );
  }
  //!------------------------------------------------------------------------------------------------------- Safety Data

  toggleSafetyData(event: Event): void {
    this.showSafetyData = !this.showSafetyData;
    this.toggleButtonState(event);
  }

  getSafetyDataRecords() {
    this.http.get<any>(`${this.apiUrl}/SafetyData`).subscribe(
      (data) => {
        console.log('API Response:', data);
        this.safetyDataRecords = Array.isArray(data) ? data : [data];
      },
      (error) => {
        console.error('Error fetching Safety Data Records:', error);
      }
    );
  }

  openSafetyDataDialog(safetyData?: any) {
    const dialogRef = this.dialog.open(SafetyDialogComponent, {
      width: '400px',
      data: safetyData || {}, // Pass existing safetyData or an empty object for a new one
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (safetyData) {
          // Edit safetyData
          this.editMission({ ...safetyData, ...result });
        } else {
          // Add new safetyData
          this.addMission(result);
        }
      }
    });
  }

  addSafetyData(safetyData: any) {
    this.http.post(`${this.apiUrl}/SafetyData`, safetyData).subscribe(
      () => {
        console.log('Safety Data added successfully');
        this.getSafetyDataRecords();
        window.location.reload();
      },
      (error) => {
        console.error('Error adding safety data:', error);
      }
    );
  }

  editSafetyData(updatedSafetyData: any) {
    this.http
      .put(
        `${this.apiUrl}/SafetyData/${updatedSafetyData.LogId}`,
        updatedSafetyData
      )
      .subscribe(
        () => {
          console.log('Safety Data updated successfully');
          this.getSafetyDataRecords();
          window.location.reload();
        },
        (error) => {
          console.error('Error updating safety data:', error);
        }
      );
  }

  deleteSafetyData(id: number) {
    this.http.delete(`${this.apiUrl}/SafetyData/${id}`).subscribe(
      () => {
        this.safetyDataRecords = this.safetyDataRecords.filter(
          (safetyData) => safetyData.LogId !== id
        );
        console.log('Deleted safety data with ID:', id);
        window.location.reload();
      },
      (error) => {
        console.error('Error deleting safety data:', error);
      }
    );
  }

  //!------------------------------------------------------------------------------------------------------- Cost Data

  toggleCostData(event: Event): void {
    this.showCostData = !this.showCostData;
    this.toggleButtonState(event);
  }

  getCostDataRecords() {
    this.http.get<any>(`${this.apiUrl}/Cost`).subscribe(
      (data) => {
        console.log('API Response:', data);
        this.costDataRecords = Array.isArray(data) ? data : [data];
      },
      (error) => {
        console.error('Error fetching Cost Data Records:', error);
      }
    );
  }

  openCostDataDialog(costData?: any) {
    const dialogRef = this.dialog.open(CostDialogComponent, {
      width: '400px',
      data: costData || {}, // Pass existing costData or an empty object for a new one
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (costData) {
          // Edit costData
          this.editMission({ ...costData, ...result });
        } else {
          // Add new costData
          this.addMission(result);
        }
      }
    });
  }

  addCostData(costData: any) {
    this.http.post(`${this.apiUrl}/Cost`, costData).subscribe(
      () => {
        console.log('Cost Data added successfully');
        this.getCostDataRecords();
        window.location.reload();
      },
      (error) => {
        console.error('Error adding cost data:', error);
      }
    );
  }

  editCostData(updatedCostData: any) {
    this.http
      .put(
        `${this.apiUrl}/Cost/${updatedCostData.CostId}`,
        updatedCostData
      )
      .subscribe(
        () => {
          console.log('Cost Data updated successfully');
          this.getCostDataRecords();
          window.location.reload();
        },
        (error) => {
          console.error('Error updating cost data:', error);
        }
      );
  }

  deleteCostData(id: number) {
    this.http.delete(`${this.apiUrl}/Cost/${id}`).subscribe(
      () => {
        this.costDataRecords = this.costDataRecords.filter(
          (costData) => costData.CostId !== id
        );
        console.log('Deleted cost data with ID:', id);
        window.location.reload();
      },
      (error) => {
        console.error('Error deleting cost data:', error);
      }
    );
  }

  //!------------------------------------------------------------------------------------------------------- Environment Data

  toggleEnvironmentData(event: Event): void {
    this.showEnvironmentData = !this.showEnvironmentData;
    this.toggleButtonState(event);
  }

  getEnvironmentDataRecords() {
    this.http.get<any>(`${this.apiUrl}/Environment`).subscribe(
      (data) => {
        console.log('API Response:', data);
        this.environmentDataRecords = Array.isArray(data) ? data : [data];
      },
      (error) => {
        console.error('Error fetching Environment Data Records:', error);
      }
    );
  }

  openEnvironmentDataDialog(environmentData?: any) {
    const dialogRef = this.dialog.open(EnvironmentDialogComponent, {
      width: '400px',
      data: environmentData || {}, // Pass existing environmentData or an empty object for a new one
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (environmentData) {
          // Edit environmentData
          this.editMission({ ...environmentData, ...result });
        } else {
          // Add new environmentData
          this.addMission(result);
        }
      }
    });
  }

  addEnvironmentData(environmentData: any) {
    this.http.post(`${this.apiUrl}/Environment`, environmentData).subscribe(
      () => {
        console.log('Environment Data added successfully');
        this.getEnvironmentDataRecords();
        window.location.reload();
      },
      (error) => {
        console.error('Error adding environment data:', error);
      }
    );
  }

  editEnvironmentData(updatedEnvironmentData: any) {
    this.http
      .put(
        `${this.apiUrl}/Environment/${updatedEnvironmentData.assessmentId}`,
        updatedEnvironmentData
      )
      .subscribe(
        () => {
          console.log('Environment Data updated successfully');
          this.getEnvironmentDataRecords();
          window.location.reload();
        },
        (error) => {
          console.error('Error updating environment data:', error);
        }
      );
  }

  deleteEnvironmentData(id: number) {
    this.http.delete(`${this.apiUrl}/Environment/${id}`).subscribe(
      () => {
        this.environmentDataRecords = this.environmentDataRecords.filter(
          (environmentData) => environmentData.assessmentId !== id
        );
        console.log('Deleted environment data with ID:', id);
        window.location.reload();
      },
      (error) => {
        console.error('Error deleting environment data:', error);
      }
    );
  }
  //!------------------------------------------------------------------------------------------------------- Report Data

  toggleReportData(event: Event): void {
    this.showReportData = !this.showReportData;
    this.toggleButtonState(event);
  }

  getReportDataRecords() {
    this.http.get<any>(`${this.apiUrl}/Report`).subscribe(
      (data) => {
        console.log('API Response:', data);
        this.reportDataRecords = Array.isArray(data) ? data : [data];
      },
      (error) => {
        console.error('Error fetching Report Data Records:', error);
      }
    );
  }

  openReportDataDialog(reportData?: any) {
    const dialogRef = this.dialog.open(ReportDialogComponent, {
      width: '400px',
      data: reportData || {}, // Pass existing reportData or an empty object for a new one
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (reportData) {
          // Edit reportData
          this.editMission({ ...reportData, ...result });
        } else {
          // Add new reportData
          this.addMission(result);
        }
      }
    });
  }

  addReportData(reportData: any) {
    this.http.post(`${this.apiUrl}/Report`, reportData).subscribe(
      () => {
        console.log('Report Data added successfully');
        this.getReportDataRecords();
        window.location.reload();
      },
      (error) => {
        console.error('Error adding report data:', error);
      }
    );
  }

  editReportData(updatedReportData: any) {
    this.http
      .put(
        `${this.apiUrl}/Report/${updatedReportData.ReportId}`,
        updatedReportData
      )
      .subscribe(
        () => {
          console.log('Report Data updated successfully');
          this.getReportDataRecords();
          window.location.reload();
        },
        (error) => {
          console.error('Error updating report data:', error);
        }
      );
  }

  deleteReportData(id: number) {
    this.http.delete(`${this.apiUrl}/Report/${id}`).subscribe(
      () => {
        this.reportDataRecords = this.reportDataRecords.filter(
          (reportData) => reportData.ReportId !== id
        );
        console.log('Deleted report data with ID:', id);
        window.location.reload();
      },
      (error) => {
        console.error('Error deleting report data:', error);
      }
    );
  }
}
