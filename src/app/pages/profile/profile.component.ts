import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  user: any = null;

  purchases: any[] = [];

  totalSpent = 0;

  isLoggedIn = false;

  ngOnInit(): void {

    const storedUser = localStorage.getItem('user');

    if (storedUser) {

      this.isLoggedIn = true;

      this.user = JSON.parse(storedUser);

      this.loadProfile();

    }

  }

  loadProfile() {

    this.http.get<any>(
      `https://ebookapp.onrender.com/profile-data/${this.user._id}`
    )
    .subscribe({

      next: (res) => {

        this.user = res.user;

        this.purchases = res.purchases;

        this.totalSpent = res.totalSpent;

      },

      error: (err) => {

        console.log(err);

      }

    });

  }

  logout() {

    localStorage.clear();

    this.router.navigate(['/']);

  }

  login() {

    this.router.navigate(['/login']);

  }

}