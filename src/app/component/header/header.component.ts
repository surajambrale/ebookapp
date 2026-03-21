import { CommonModule } from '@angular/common';
import { Component, HostListener, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule,RouterModule,SidebarComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  isSidebarOpen=signal(false);
  isScrolled = signal(false);
  isMobile=signal(window.innerWidth<=768);

  toggleSidebar(){
    if(this.isMobile()){
      this.isSidebarOpen.update(value=> !value);
    }
  }

   closeSidebar = () => {
    this.isSidebarOpen.set(false);
  };

  @HostListener('window:resize', [])
  onResize() {
    this.isMobile.set(window.innerWidth <= 768);
    if (!this.isMobile()) {
      this.isSidebarOpen.set(false); // auto-close if switched to desktop
    }
  }

  @HostListener('window:scroll', [])
  onScroll() {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    this.isScrolled.set(scrollY > 10);
  }

}


