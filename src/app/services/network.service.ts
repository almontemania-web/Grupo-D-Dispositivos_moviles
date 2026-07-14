import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NetworkService {
  private onlineSubject = new BehaviorSubject<boolean>(true);
  public isOnline$ = this.onlineSubject.asObservable();
  public isOnline = true;
  private initialized = false;

  async init() {
    if (this.initialized) return;
    this.initialized = true;

    const status = await Network.getStatus();
    this.isOnline = status.connected;
    this.onlineSubject.next(status.connected);

    Network.addListener('networkStatusChange', s => {
      this.isOnline = s.connected;
      this.onlineSubject.next(s.connected);
    });
  }
}
