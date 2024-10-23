import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { WalletService } from './services/wallet.service';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { ToolbarModule } from 'primeng/toolbar';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, FormsModule, ButtonModule, ToolbarModule, DropdownModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Lumix';

  connected: boolean | undefined = true;

  constructor(private walletService: WalletService, private router: Router) {}

  connect() {
    this.connected = this.connected ? false : true;

    if (!this.connected) {
      this.router.navigateByUrl('/home');
    }
  }

  goToDashboard() {
    console.log("Dashboard");
    this.router.navigateByUrl('/dashboard');
  }

  getYear() {
    return new Date().getFullYear();
  }
}
