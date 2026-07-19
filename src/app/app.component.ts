import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './component/header/header.component';
import { SidebarComponent } from './component/sidebar/sidebar.component';
import { LoaderComponent } from './pages/loader/loader/loader.component';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent,SidebarComponent,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})


export class AppComponent {
  isLoading = false;
  title = 'web';
  sidebarOpen = signal(false);

   

closeSidebar = () => {
    this.sidebarOpen.set(false);
  };

openSidebar = () => {
    this.sidebarOpen.set(true);
  };

//   ngDoCheck() {
//   this.isLoading = (window as any).appLoader || false;
// }

ngOnInit() {
  setInterval(() => {
    this.isLoading = (window as any).appLoader || false;
  }, 100);
}

}