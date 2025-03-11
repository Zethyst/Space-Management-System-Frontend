import { Component } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { claimReq } from '../../shared/utils/claimReq-utils';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterLink, RouterModule, CommonModule],
  templateUrl: './main-layout.component.html',
  styles: [
    `
      .nav-item.active a {
        background-color: #1a2b4c;
        color: #ffffff !important;
      }
    `,
  ],
})
export class MainLayoutComponent {
  navLinks: { path: string; label: string }[] = [];
  // navLinks = [
  //   { path: '/admin-only', label: 'Admin Only' },
  //   { path: '/director', label: 'Director' },
  //   { path: '/scientist', label: 'Scientist' },
  //   { path: '/engineer', label: 'Engineer' },
  //   { path: '/research-assistant', label: 'Research Assistant' },
  //   { path: '/astronomer', label: 'Astronomer' },
  //   { path: '/notification', label: 'Notification' },
  //   { path: '/notifications', label: 'Notification' },
  // ];

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.initializeNavLinks();
  }

  claimReq = claimReq;
  private apiUrl =
    'https://space-management-system-e0f7bmevhmevg0gv.westindia-01.azurewebsites.net/api';
  public role = '';

  ngOnInit(): void {
    this.getUserRole();
  }

  getUserRole() {
    this.http.get<any>(`${this.apiUrl}/getUserRole`).subscribe(
      (data) => {
        console.log('API Role:', data);
        this.role = data.role;

        // Call initializeNavLinks after the role is set
        this.initializeNavLinks();
      },
      (error) => {
        console.error('Error fetching role:', error);
      }
    );
  }

  initializeNavLinks(): void {
    console.log('role', this.role);

    this.navLinks = [
      { path: '/admin-only', label: 'Admin Only' },
      { path: '/director', label: 'Director' },
      { path: '/scientist', label: 'Scientist' },
      { path: '/engineer', label: 'Engineer' },
      { path: '/research-assistant', label: 'Research Assistant' },
      { path: '/astronomer', label: 'Astronomer' },
      // Show the 'notification' link only for ADMIN or MISSION_DIRECTOR (but not for TEACHER)
      ...(this.role == 'ADMIN' || this.role == 'MISSION_DIRECTOR'
        ? [{ path: '/notification', label: 'Notification' }]
        : []),
      // Show the 'notifications' link for users who are not ADMIN, MISSION_DIRECTOR, or TEACHER
      ...(this.role !== 'ADMIN' &&
      this.role !== 'MISSION_DIRECTOR' &&
      this.role !== 'TEACHER'
        ? [{ path: '/notifications', label: 'Notification' }]
        : []),
    ];
  }

  onLogout() {
    this.authService.deleteToken();
    this.router.navigateByUrl('/signin');
  }

  isActive(path: string): boolean {
    return this.router.url === path;
  }
}
