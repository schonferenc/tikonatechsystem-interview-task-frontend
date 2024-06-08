import { User } from './user.model';

export interface Comment {
  id: string;
  body: string;
  author: User;
  comments: Comment[];
  removed?: boolean;

}
