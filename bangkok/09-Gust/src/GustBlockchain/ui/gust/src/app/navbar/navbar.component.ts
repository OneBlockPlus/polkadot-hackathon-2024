import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  lastScrollY = 0;
  isNavHidden = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const currentScrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;

    if (currentScrollY > this.lastScrollY && currentScrollY < docHeight - windowHeight) {
      this.isNavHidden = true;
    } else {
      this.isNavHidden = false;
    }

    if (currentScrollY + windowHeight >= docHeight) {
      this.isNavHidden = false;
    }

    this.lastScrollY = currentScrollY;
  }

}
