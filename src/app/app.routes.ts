import { Routes } from '@angular/router';
import { LoginComponent } from './pages/books/login/login.component';
import { BookDetailComponent } from './pages/books/book-detail/book-detail.component';
import { BookListComponent } from './pages/books/book-list/book-list.component';

export const routes: Routes = [
  { path: '', component: BookListComponent },
  { path: 'book/:id', component: BookDetailComponent },
  { path: 'login', component: LoginComponent }
];