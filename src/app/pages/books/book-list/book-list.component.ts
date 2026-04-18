import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.scss']
})
export class BookListComponent {

  constructor(private router: Router) {}

  books = [
    {
    id: 1,
    title: "Complete Fat Loss Guide",
    author: "Suraj Ambrale - Nutritionist | Fitness Trainer",
    price: 1,              // 🔥 offer price
    originalPrice: 499,      // 🔥 cut price
    reviews: 19,
    image: "assets/images/fatloss-book.jpeg",
    description: "Welcome to the Complete Fitness & Nutrition program..."
  },
    {
      id: 2,
      title: "1500-Calorie Diet Plan",
      author: "Suraj Ambrale - Nutritionist | Fitness Trainer",
      price: 1,
      originalPrice: 499,
      reviews: 6505,
      image: "assets/images/1500-cal-diet.jpg",
      description: "Healthy Diet Plan for Regular People Who Want to Stay Fit"
    },
     {
      id: 3,
      title: "Habits That Change Your Life",
      author: "Suraj Ambrale - Nutritionist | Fitness Trainer",
      price: 1,
      originalPrice: 499, 
      reviews: 6505,
      image: "assets/images/habits.jpg",
      description: "Small habits. Big changes. Build discipline, grow daily, and transform your life."
    },
    {
      id: 4,
      title: "Begginer Guide",
      author: "Suraj Ambrale - Nutritionist | Fitness Trainer",
      price: 1,
      originalPrice: 499, 
      reviews: 6505,
      image: "assets/images/beginner-guide.jpg",
      description: "Complete beginner Guide..."
    },
    {
      id: 5,
      title: "Diabetes Control",
      author: "Suraj Ambrale - Nutritionist | Fitness Trainer",
      price: 1,
      originalPrice: 499, 
      reviews: 6505,
      image: "assets/images/diabetes-control.jpg",
      description: "Control your diabetes..."
    },
    {
      id: 6,
      title: "PCOD / PCOS Guide",
      author: "Suraj Ambrale - Nutritionist | Fitness Trainer",
      price: 1,
      originalPrice: 499, 
      reviews: 6505,
      image: "assets/images/pcod.jpg",
      description: "A Complete Guide for Women to Balance Hormones Naturally."
    }
   
  ];

  openBook(id: number) {
    this.router.navigate(['/book', id]);
  }
}