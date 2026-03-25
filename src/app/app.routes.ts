import { Routes } from '@angular/router';
import { LoginComponent } from './pages/books/login/login.component';
import { BookDetailComponent } from './pages/books/book-detail/book-detail.component';
import { BookListComponent } from './pages/books/book-list/book-list.component';
import { AdminComponent } from './pages/admin/admin.component';
import { AdminGuard } from './core/guards/admin.guard';



export const routes: Routes = [
  { path: '', component: BookListComponent },
  { path: 'book/:id', component: BookDetailComponent },
  { path: 'login', component: LoginComponent },

  {
    path: 'read/:id',
    loadComponent: () =>
      import('./pages/books/read-book/read-book.component')
        .then(m => m.ReadBookComponent)
  },

  // 🔐 LOGIN PAGE
  {
    path: 'admin-login',
    component: AdminComponent
  },

  // 🔒 PROTECTED ADMIN DASHBOARD
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AdminGuard]
  }
];