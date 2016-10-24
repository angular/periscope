import {Component} from '@angular/core';
import {Observable} from 'rxjs/Observable';

import {Digest, GithubStore} from '../github/store';
import {Event} from '../github/v3';

@Component({
  selector: 'app-sync',
  templateUrl: 'sync.component.html',
  styleUrls: ['sync.component.css'],
})
export class SyncComponent {
  prs: Observable<Digest[]>;
  events: Observable<Event[]>;

  constructor(private store: GithubStore) {
    this.events = store.getWebhookEvents();
    this.prs = store.getOpenPrDigests();
  }

  syncPr(count: string) { this.store.updatePr(parseInt(count, 10)); }

  syncAllPRs() { this.store.updatePrs(); }
}
