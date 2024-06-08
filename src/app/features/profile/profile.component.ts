import { Component } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

// Models
import { Role } from '../../shared/models/role.model';
import { User } from '../../shared/models/user.model';

// Services
import { ApiService } from '../../core/services/api.service';
import { UserService } from '../../core/services/user.service';

// Impports
import {
  FormBuilder,
  FormGroup,
  FormGroupDirective,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
  // user
  users: User[] = [];
  user: User = {} as User;
  userRole: Role = {} as Role;
  userForm: FormGroup;

  // notification
  notificationMessage: string = '';
  isErrorNotification: boolean = false;

  // User topics and comments count
  userTopicsCount: number = 0;
  userCommentsCount: number = 0;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private userService: UserService
  ) {
    this.userForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(5)]],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
            ),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      { validator: this.confirmPasswordValidator }
    );
  }

  ngOnInit(): void {
    this.fetchUsers();
  }

  // Checks that the selected user exists
  userExist(): boolean {
    return Object.keys(this.user).length > 0;
  }

  // Handling form submission
  onSubmit(formDirective: FormGroupDirective): void {
    if (this.userForm.invalid) {
      return;
    }

    const { name, email, password, confirmPassword } = this.userForm.value;

    this.apiService
      .updateUser(this.user.id, { name, email })
      .pipe(
        catchError((error) => {
          this.handleFormSubmissionError();
          return throwError(error);
        }),
        switchMap(() => {
          if (password && confirmPassword) {
            return this.apiService.updatePassword(
              this.user.id,
              password,
              confirmPassword
            );
          }
          return [];
        })
      )
      .subscribe(
        (response: any) => {
          this.handleFormSubmissionSuccess(formDirective);
          this.resetPasswordFields();
        },
        (error: any) => {
          this.handleFormSubmissionError();
        }
      );
  }

  // Method to fetch users from the API
  fetchUsers(): void {
    this.apiService.getUsers().subscribe(
      (response: any) => {
        this.users = response.data;
      },
      (error: any) => {
        console.error('Error fetching user data:', error);
      }
    );
  }

  // Method to handle form submission success
  private handleFormSubmissionSuccess(formDirective: FormGroupDirective): void {
    formDirective.resetForm();
    this.userForm.reset();
    this.fetchUsers();
    this.user = this.users.find((u) => u.id === this.user.id) as User;
    this.showNotification('Updated successfully');
  }

  // Method to handle form submission error
  private handleFormSubmissionError(): void {
    // Show error message
    this.showNotification('Error updating', true);
  }

  // Method to reset password fields
  private resetPasswordFields(): void {
    this.userForm.patchValue({ password: '', confirmPassword: '' });
  }

  // Show notification
  showNotification(message: string, error: boolean = false): void {
    this.notificationMessage = message;
    this.isErrorNotification = error;
    setTimeout(() => {
      this.notificationMessage = '';
    }, 3000);
  }

  // Check field validation
  validateField(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!field && field.invalid;
  }

  // Generate error messages for input fields
  getErrorMessage(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;
    if (errors['required']) return 'Required field';
    if (errors['minlength']) return 'Must be at least 5 characters long';
    if (errors['email']) return 'Must be a valid email format';
    if (errors['pattern']) return 'Not strong enough';
    if (errors['passwordMismatch']) return 'Passwords do not match';
    return '';
  }

  // Custom validator for confirmPassword
  confirmPasswordValidator(control: FormGroup): any {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    return password &&
      confirmPassword &&
      password.value !== confirmPassword.value
      ? confirmPassword.setErrors({ passwordMismatch: true })
      : null;
  }

  // Function to set the color of permissions
  getPrivilegeColor(privilege: string): string {
    const userRoleName = this.userRole.name;
    if (!userRoleName) {
      return 'red';
    }

    const privileges = this.userService.getRolePrivileges(userRoleName);
    return privileges.includes(privilege) ? 'green' : 'red';
  }

  // Function to display user roles and privileges
  getPrivileges(): { privilege: string; description: string }[] {
    return this.userService.getPrivileges();
  }

  // Set form values based on selected user
  onUserSelected(): void {
    this.userForm.reset();
    this.userForm.patchValue({
      name: this.user?.name,
      email: this.user?.email,
    });
    this.apiService.getRoleById(this.user.role).subscribe(
      (response: any) => {
        this.userRole = response.data;
      },
      (error: any) => {
        console.error('Error fetching role data:', error);
      }
    );
    this.userService.setCurrentUser(this.user);
    this.fetchUserTopicsAndComments();
  }

  // Fetch topics and comments for the current user
  fetchUserTopicsAndComments(): void {
    this.userTopicsCount = 0;
    this.userCommentsCount = 0;
    this.apiService.getTopics().subscribe(
      (response: any) => {
        const topics = response.data;
        topics.forEach((topic: any) => {
          if (topic.author.id === this.user.id) {
            this.userTopicsCount++;
          }
          this.countUserComments(topic.comments);
        });
      },
      (error: any) => {
        console.error('Error fetching topics:', error);
      }
    );
  }

  // Helper function to count user comments recursively
  countUserComments(comments: any[]): void {
    comments.forEach((comment: any) => {
      if (comment.author.id === this.user.id) {
        this.userCommentsCount++;
      }
      if (comment.comments && comment.comments.length > 0) {
        this.countUserComments(comment.comments);
      }
    });
  }
}
