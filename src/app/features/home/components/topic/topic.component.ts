import { Component, EventEmitter, Input, Output } from '@angular/core';

// Models
import { Topic } from '../../../../shared/models/topic.model';
import { Comment } from './../../../../shared/models/comment.model';
import { User } from '../../../../shared/models/user.model';

// Services
import { ApiService } from '../../../../core/services/api.service';
import { UserService } from '../../../../core/services/user.service';

// Imports
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CommentComponent } from '../comment/comment.component';

@Component({
  selector: 'app-topic',
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionModule,
    MatButtonModule,
    MatInputModule,
    FormsModule,
    MatIconModule,
    MatAccordion,
    CommentComponent,
  ],
  templateUrl: './topic.component.html',
  styleUrls: ['./topic.component.scss'],
})
export class TopicComponent {
  constructor(
    private apiService: ApiService,
    public userService: UserService
  ) {}

  @Input() topic!: Topic;
  @Input() user: User | null = null;
  @Output() topicRemoved: EventEmitter<void> = new EventEmitter<void>();

  // Comment
  comment: string = '';

  // The total number of comments on the topic that do not have a removed key
  numberOfComments: number = 0;

  // Calculates the total number of comments on a topic that does not have a removed key
  getTotalCommentCount(comments: Comment[]): number {
    let count = 0;

    for (const comment of comments) {
      if (!comment.removed) {
        count++;
        if (comment.comments && comment.comments.length > 0) {
          count += this.getTotalCommentCount(comment.comments);
        }
      }
    }

    return count;
  }

  // Update number of comments
  updateNumberOfComments() {
    this.numberOfComments = this.getTotalCommentCount(this.topic.comments);
  }

  ngOnInit() {
    this.numberOfComments = this.getTotalCommentCount(this.topic.comments);
  }

  // Add comment for topic
  addComment() {
    if (!this.user) return;
    this.apiService
      .addCommentToRoot(this.topic.id, this.comment, this.user)
      .subscribe((response: any) => {
        this.topic.comments.push(response.data); // Refresh UI
        this.comment = ''; // Clear the input field
        // Refresh number of comments
        this.numberOfComments = this.getTotalCommentCount(this.topic.comments);
      });
  }

  // Remove Topic ById
  removeTopicById(id: string, e: Event): void {
    e.stopPropagation();
    this.apiService.removeTopicById(id).subscribe(
      () => {
        this.topicRemoved.emit();
      },
      (error: any) => {
        console.error('Error occurred while removing topic:', error);
      }
    );
  }
}
