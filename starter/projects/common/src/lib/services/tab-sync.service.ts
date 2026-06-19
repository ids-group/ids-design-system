import { Injectable } from '@angular/core';
import { JWT_KEY } from '../constants/storage-keys.constants';

const PING_CHANNEL = 'app_auth_ping';
const PING_TIMEOUT_MS = 500;

/** Cross-tab auth sync: storage-event login/logout propagation + BroadcastChannel session pinging. */
@Injectable({ providedIn: 'root' })
export class TabSyncService {
  private pingChannel: BroadcastChannel | null = null;

  private get isBroadcastChannelSupported(): boolean {
    return typeof BroadcastChannel !== 'undefined';
  }

  listenForExternalChanges(
    onLogin: () => void,
    onLogout: () => void,
  ): () => void {
    const handler = (event: StorageEvent): void => {
      if (event.key === JWT_KEY) {
        if (event.newValue) {
          onLogin();
        } else {
          onLogout();
        }
      } else if (event.key === null) {
        onLogout();
      }
    };

    window.addEventListener('storage', handler);

    return () => window.removeEventListener('storage', handler);
  }

  startRespondingToTabPings(): void {
    if (this.pingChannel || !this.isBroadcastChannelSupported) {
      return;
    }

    try {
      this.pingChannel = new BroadcastChannel(PING_CHANNEL);

      this.pingChannel.onmessage = (event) => {
        if (event.data === 'ping') {
          this.pingChannel?.postMessage('pong');
        }
      };
    } catch {
      this.pingChannel = null;
    }
  }

  stopRespondingToTabPings(): void {
    this.pingChannel?.close();
    this.pingChannel = null;
  }

  hasActiveSessionTabs(): Promise<boolean> {
    if (!this.isBroadcastChannelSupported) {
      return Promise.resolve(true);
    }

    if ((document as { prerendering?: boolean }).prerendering) {
      return new Promise<boolean>((resolve) => {
        document.addEventListener(
          'prerenderingchange',
          () => {
            this.hasActiveSessionTabs().then(resolve);
          },
          { once: true },
        );
      });
    }

    try {
      return new Promise<boolean>((resolve) => {
        const channel = new BroadcastChannel(PING_CHANNEL);

        const timeoutId = setTimeout(() => {
          channel.close();
          resolve(false);
        }, PING_TIMEOUT_MS);

        channel.onmessage = (event) => {
          if (event.data === 'pong') {
            clearTimeout(timeoutId);
            channel.close();
            resolve(true);
          }
        };

        channel.postMessage('ping');
      });
    } catch {
      return Promise.resolve(true);
    }
  }
}
