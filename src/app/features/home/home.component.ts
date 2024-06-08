import { Component } from '@angular/core';

// Services
import { ApiService } from '../../core/services/api.service';
import { UserService } from '../../core/services/user.service';

// Models
import { User } from '../../shared/models/user.model';
import { Topic } from '../../shared/models/topic.model';

// Imports
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatAccordion } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TopicComponent } from './components/topic/topic.component';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatAccordion,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    TopicComponent,
  ],
})
export class HomeComponent {

  
  topics: Topic[] = [];
  topic: Topic = {
    id: '',
    title: '',
    author: {} as User,
    body: '',
    comments: [],
  };

  constructor(
    private apiService: ApiService,
    public userService: UserService
  ) {}

  user: User | null = null;

  ngOnInit() {
    // Fetch topics data on component initialization
    this.fetchTopics();

    // Get current user
    this.userService.currentUser.subscribe((user) => {
      this.user = user;
    });
  }

  // Fetch topics data
  fetchTopics() {
    this.apiService.getTopics().subscribe((response: any) => {
      if (response.status === 200 && response.data) {
        this.topics = response.data;
      } else {
        console.error('Error occurred while fetching data.');
      }
    });
  }

  // Add new topic
  addTopic() {
    if (!this.user) return;
    this.apiService
      .addTopic(this.topic.title, this.topic.body, this.user)
      .subscribe((response: any) => {
        this.topics.push(response.data);
        this.resetTopicData();
      });
  }

  // Clear topic input fields
  resetTopicData() {
    this.topic = {
      id: '',
      title: '',
      author: {} as User,
      body: '',
      comments: [],
    };
  }

  // Topic form submit button disabled state management
  topicformIsInvalid(): boolean {
    return (
      this.topic.title.trim().length === 0 ||
      this.topic.body.trim().length === 0
    );
  }
}
