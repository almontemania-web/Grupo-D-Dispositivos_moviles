import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, playCircleOutline, videocamOffOutline } from 'ionicons/icons';

@Component({
  selector: 'app-multimedia',
  templateUrl: './multimedia.page.html',
  styleUrls: ['./multimedia.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon]
})
export class MultimediaPage {
  private router = inject(Router);

  videoUrl = 'assets/video/demo-app.mp4';
  videoDisponible = false;

  constructor() {
    addIcons({ arrowBackOutline, playCircleOutline, videocamOffOutline });
    this.verificarVideo();
  }

  private async verificarVideo() {
    try {
      const res = await fetch(this.videoUrl, { method: 'HEAD' });
      this.videoDisponible = res.ok;
    } catch {
      this.videoDisponible = false;
    }
  }

  volver() { this.router.navigate(['/home']); }
}
