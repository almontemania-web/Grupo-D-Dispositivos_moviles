import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { NetworkService } from '../../services/network.service';
import { OfflineService } from '../../services/offline.service';
import { addIcons } from 'ionicons';
import { cloudOfflineOutline, cloudDoneOutline, syncOutline } from 'ionicons/icons';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-network-banner',
  template: `
    <div class="network-banner offline" *ngIf="!isOnline">
      <ion-icon name="cloud-offline-outline"></ion-icon>
      <span>Sin conexion a internet</span>
      <div class="pending-badge" *ngIf="pendingCount > 0">
        {{ pendingCount }} pendiente(s)
      </div>
    </div>
    <div class="network-banner online" *ngIf="isOnline && showOnline">
      <ion-icon name="cloud-done-outline"></ion-icon>
      <span>Conexion restaurada</span>
      <span class="sync-text" *ngIf="sincronizando">Sincronizando...</span>
    </div>
  `,
  styles: [`
    .network-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      font-size: 13px;
      font-weight: 500;
      z-index: 9999;

      ion-icon { font-size: 18px; }

      &.offline {
        background: #b71c1c;
        color: white;
      }

      &.online {
        background: #1b5e20;
        color: white;
      }

      .pending-badge {
        margin-left: auto;
        background: rgba(255,255,255,0.25);
        padding: 2px 8px;
        border-radius: 20px;
        font-size: 11px;
      }

      .sync-text {
        margin-left: auto;
        font-size: 11px;
        opacity: 0.8;
      }
    }
  `],
  standalone: true,
  imports: [CommonModule, IonIcon]
})
export class NetworkBannerComponent implements OnInit, OnDestroy {
  private networkService = inject(NetworkService);
  private offlineService = inject(OfflineService);

  isOnline = true;
  showOnline = false;
  sincronizando = false;
  pendingCount = 0;
  private sub!: Subscription;

  constructor() {
    addIcons({ cloudOfflineOutline, cloudDoneOutline, syncOutline });
  }

  ngOnInit() {
    this.isOnline = this.networkService.isOnline;
    this.pendingCount = this.offlineService.getPendingCount();

    this.sub = this.networkService.isOnline$.subscribe(async online => {
      const wasOffline = !this.isOnline;
      this.isOnline = online;
      this.pendingCount = this.offlineService.getPendingCount();

      if (online && wasOffline) {
        this.showOnline = true;
        this.sincronizando = true;
        await this.offlineService.sincronizarPendientes();
        this.sincronizando = false;
        this.pendingCount = this.offlineService.getPendingCount();
        setTimeout(() => { this.showOnline = false; }, 4000);
      }
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}