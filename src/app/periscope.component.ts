import {Component} from '@angular/core';
import {AngularFire, FirebaseAuthState} from 'angularfire2';

import {GithubStore} from './github/store';
import {PrBoardService} from './pr-board.service';

@Component({
  selector: 'periscope-app',
  templateUrl: 'periscope.component.html',
  styleUrls: ['periscope.component.css'],
  providers: [
    GithubStore, PrBoardService
  ]
})
export class PeriscopeAppComponent {
  authState: FirebaseAuthState = null;

  constructor(private af: AngularFire) {
    af.auth.subscribe((authState: FirebaseAuthState) => {
      this.authState = authState;
      console.log(authState);
    });
  }

  auth() {
    console.log('AUTH');
    this.af.auth.login().then((authState) => this.authState = authState);
  }

  logout() {
    console.log('LOGOUT');
    this.af.auth.logout();
    this.authState = null;
  }
}
