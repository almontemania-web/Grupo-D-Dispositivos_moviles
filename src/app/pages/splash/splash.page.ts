import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { Auth } from '@angular/fire/auth';
import { addIcons } from 'ionicons';
import { heartOutline } from 'ionicons/icons';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon]
})
export class SplashPage implements OnInit {
  private router = inject(Router);
  private auth = inject(Auth);

  animando = false;

  constructor() {
    addIcons({ heartOutline });
  }

  ngOnInit() {
    setTimeout(() => { this.animando = true; }, 100);

    const minDelay = new Promise<void>(resolve => setTimeout(resolve, 3000));
    Promise.all([minDelay, this.auth.authStateReady()]).then(() => {
      if (this.auth.currentUser) {
        this.router.navigate(['/home'], { replaceUrl: true });
      } else {
        this.router.navigate(['/login'], { replaceUrl: true });
      }
    });
  }
}