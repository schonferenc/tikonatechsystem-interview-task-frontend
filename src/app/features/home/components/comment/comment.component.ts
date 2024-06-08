import { Component, EventEmitter, Input, Output } from '@angular/core';

// Models
import { Comment } from '../../../../shared/models/comment.model';
import { User } from '../../../../shared/models/user.model';

// Services
import { ApiService } from '../../../../core/services/api.service';
import { UserService } from '../../../../core/services/user.service';

// Imports
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
})
export class CommentComponent {
  constructor(private apiService: ApiService , public userService: UserService) {}

  @Input() topicId!: string;
  @Input() comments!: Comment[];
  @Input() user: User | null = null;

  @Output() commentChanged: EventEmitter<void> = new EventEmitter<void>();

  isCommentOpen: boolean = false;
  isAnswerFieldOpen: boolean[] = [];
  reply: string = '';

  // Toggle comment replies
  toggleComment(): void {
    this.isCommentOpen = !this.isCommentOpen;
    this.isAnswerFieldOpen.fill(false);
  }

  // Returns the count of visible comments, excluding the removed ones
  visibleCommentCount(comment: Comment): number {
    return comment.comments.filter((c) => !c.removed).length;
  }

  // Toggle answer field
  toggleAnswerField(index: number): void {
    this.isAnswerFieldOpen[index] = !this.isAnswerFieldOpen[index];
  }

  // Add new comment
  addComment(comment: Comment): void {
    if (!this.user) return;
    this.apiService
      .addCommentToComment(this.topicId, comment.id, this.reply, this.user)
      .subscribe((response: any) => {
        comment.comments.push(response.data);
        this.reply = '';
        this.commentChanged.emit();
      });
  }

  // Delete comment by id
  deleteComment(commentId: string): void {
    this.apiService
      .removeComment(this.topicId, commentId)
      .subscribe((response: any) => {
        const deletedCommentIndex = this.comments.findIndex(
          (comment) => comment.id === commentId
        );
        if (deletedCommentIndex !== -1) {
          this.comments[deletedCommentIndex].removed = true;

          if (this.comments[deletedCommentIndex].comments.length > 0) {
            this.markCommentsAsRemoved(
              this.comments[deletedCommentIndex].comments
            );
          }
        }
        this.commentChanged.emit();
      });
  }

  // Recursively mark comments as removed
  markCommentsAsRemoved(comments: Comment[]): void {
    for (const comment of comments) {
      comment.removed = true;
      if (comment.comments && comment.comments.length > 0) {
        this.markCommentsAsRemoved(comment.comments);
      }
    }
  }
}
