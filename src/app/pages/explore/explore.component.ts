import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent {

  constructor(private router: Router) {}

  searchText = '';

  categories = [
    { name: 'Fat Loss', icon: '🔥' },
    { name: 'Muscle Gain', icon: '💪' },
    { name: 'Diet Plans', icon: '🥗' },
    { name: 'PCOD', icon: '🌸' },
    { name: 'Diabetes', icon: '🩺' }
  ];

  books = [
    {
      id: 1,
      title: 'Complete Fat Loss Guide',
      author: 'Suraj Ambrale',
      price: 49,
      image: 'assets/images/fatloss-book.jpeg'
    },
    {
      id: 2,
      title: '1500-Calorie Diet Plan',
      author: 'Suraj Ambrale',
      price: 49,
      image: 'assets/images/1500-cal-diet.jpg'
    },
    {
      id: 3,
      title: 'Muscle Gain Guide',
      author: 'Suraj Ambrale',
      price: 49,
      image: 'assets/images/habits.jpg'
    },

    {
      id: 4,
      title: "Begginer Guide",
      author: "Suraj Ambrale - Nutritionist | Fitness Trainer",
      price: 49,
      image: "assets/images/beginner-guide.jpg"
    },
    {
      id: 5,
      title: "Diabetes Control",
      author: "Suraj Ambrale - Nutritionist | Fitness Trainer",
      price: 49,
      image: "assets/images/diabetes-control.jpg"
    },
    {
      id: 6,
      title: "PCOD / PCOS Guide",
      author: "Suraj Ambrale - Nutritionist | Fitness Trainer",
      price: 49,
      image: "assets/images/pcod.jpg"
    }
  ];

  openBook(id: number) {
    this.router.navigate(['/book', id]);
  }

}