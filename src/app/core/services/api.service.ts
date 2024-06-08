import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:8888/api';

  constructor(private http: HttpClient) {}

  /**
   * Fetches all users.
   * @returns An observable containing the response with all users.
   */
  getUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/users`);
  }

  /**
   * Fetches a user by their ID.
   * @param id The ID of the user to fetch.
   * @returns An observable containing the response with the user data.
   */
  getUserById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/user/${id}`);
  }

  /**
   * Fetches a role by its ID.
   * @param id The ID of the role to fetch.
   * @returns An observable containing the response with the role data.
   */
  getRoleById(id: number | string): Observable<any> {
    return this.http.get(`${this.baseUrl}/role/${id}`);
  }

  /**
   * Fetches all topics.
   * @returns An observable containing the response with all topics.
   */
  getTopics(): Observable<any> {
    return this.http.get(`${this.baseUrl}/topics`);
  }

  /**
   * Adds a new topic.
   * @param title The title of the topic.
   * @param body The body content of the topic.
   * @param author The author of the topic.
   * @returns An observable containing the response after adding the topic.
   */
  addTopic(title: string, body: string, author: User): Observable<any> {
    return this.http.post(`${this.baseUrl}/topic/add`, { title, body, author });
  }

  /**
   * Adds a comment to an existing comment.
   * @param topicId The ID of the topic.
   * @param commentId The ID of the comment to which the new comment will be added.
   * @param body The body content of the comment.
   * @param author The author of the comment.
   * @returns An observable containing the response after adding the comment.
   */
  addCommentToComment(
    topicId: string,
    commentId: string,
    body: string,
    author: User
  ): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/topic/${topicId}/comment/${commentId}/add`,
      { body, author }
    );
  }

  /**
   * Adds a comment to the root of a topic.
   * @param topicId The ID of the topic.
   * @param body The body content of the comment.
   * @param author The author of the comment.
   * @returns An observable containing the response after adding the comment.
   */
  addCommentToRoot(
    topicId: string,
    body: string,
    author: User
  ): Observable<any> {
    return this.http.post(`${this.baseUrl}/topic/${topicId}/comment/add`, {
      body,
      author,
    });
  }

  /**
   * Updates user data by ID.
   * @param userId The ID of the user to update.
   * @param userData The updated user data.
   * @returns An observable of the updated user.
   */
  updateUser(
    userId: number | string | undefined,
    userData: Partial<User>
  ): Observable<any> {
    return this.http.put(`${this.baseUrl}/user/${userId}`, userData);
  }

  /**
   * Updates user password by ID.
   * @param userId The ID of the user to update password.
   * @param password1 The new password.
   * @param password2 The confirmation of the new password.
   * @returns An observable of the updated user.
   */
  updatePassword(
    userId: number | string | undefined,
    password1: string,
    password2: string
  ): Observable<any> {
    return this.http.put(`${this.baseUrl}/user/${userId}/password`, {
      password1,
      password2,
    });
  }

  /**
   * Removes a comment from a topic.
   * @param topicId The ID of the topic.
   * @param commentId The ID of the comment to remove.
   * @returns An observable containing the response after removing the comment.
   */
  removeComment(topicId: string, commentId: string): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/topic/${topicId}/comment/${commentId}`
    );
  }

  /**
   * Removes a topic by its ID.
   * @param topicId The ID of the topic to remove.
   * @returns An observable containing the response after removing the topic.
   */
  removeTopicById(topicId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/topic/${topicId}`);
  }
}
