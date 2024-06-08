import { Comment } from './comment.model';
import { User } from './user.model';

export interface Topic {
  id: string;
  author: User;
  title: string;
  body:string;
  comments: Comment[];
}
