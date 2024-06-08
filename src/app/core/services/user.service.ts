import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from './../../shared/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor() {
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  /**
   * Gets the current user value.
   * @returns The current user or null if not set.
   */
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Sets the current user.
   * @param user The user to set.
   */
  public setCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user);
  }

  /**
   * Checks if the current user has a specific permission.
   * @param permission The permission to check.
   * @returns True if the user has the permission, false otherwise.
   */
  public hasPermission(permission: string): boolean {
    const user = this.currentUserValue;

    if (!user) {
      return false;
    }

    switch (user.role) {
      case 0: // Administrators
        return true;
      case 1: // Guests
        return permission === 'readComments';
      case 2: // Silver Users
        return (
          permission === 'readComments' || permission === 'addDeleteComments'
        );
      case 3: // Gold Users
        return (
          permission === 'readComments' ||
          permission === 'addDeleteComments' ||
          permission === 'addDeleteTopics'
        );
      default:
        return false;
    }
  }

  /**
   * Checks if the current user is an administrator.
   * @returns True if the user is an administrator, false otherwise.
   */
  public isAdmin(): boolean {
    const user = this.currentUserValue;
    return user?.role === 0;
  }

  /**
   * Gets the privileges associated with a specific role.
   * @param roleName The name of the role.
   * @returns An array of privileges associated with the role.
   */
  public getRolePrivileges(roleName: string): string[] {
    const rolePrivileges: { [key: string]: string[] } = {
      Administrators: [
        'readComments',
        'addDeleteComments',
        'addDeleteTopics',
        'deleteOthersComments',
      ],
      Guests: ['readComments'],
      'Silver Users': ['readComments', 'addDeleteComments'],
      'Gold Users': ['readComments', 'addDeleteComments', 'addDeleteTopics'],
    };

    return rolePrivileges[roleName] || [];
  }

  /**
   * Gets the list of all possible privileges and their descriptions.
   * @returns An array of objects representing privileges and their descriptions.
   */
  public getPrivileges(): { privilege: string; description: string }[] {
    return [
      { privilege: 'readComments', description: 'Read comments' },
      { privilege: 'addDeleteComments', description: 'Add/delete comments' },
      { privilege: 'addDeleteTopics', description: 'Add/delete topics' },
      {
        privilege: 'deleteOthersComments',
        description: "Deleting other people's comments/topics",
      },
    ];
  }

  /**
   * Gets the name of a role by its ID.
   * @param id The ID of the role.
   * @returns The name of the role.
   */
  public getRoleNameById(id: number): string {
    const roleNames: { [key: number]: string } = {
      0: 'Administrators',
      1: 'Guests',
      2: 'Silver Users',
      3: 'Gold Users',
    };

    return roleNames[id] || 'Unknown';
  }
}
