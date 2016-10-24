import {ModuleWithProviders, NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {MaterialModule} from '@angular/material';
import {BrowserModule} from '@angular/platform-browser';
import {RouterModule, Routes} from '@angular/router';
import {AuthMethods, AuthProviders, FIREBASE_PROVIDERS, FirebaseAuthConfig, FirebaseConfig} from 'angularfire2';

import {SyncComponent} from './+sync/sync.component';
import {TriagePrComponent} from './+triage-pr/triage-pr.component';
import {PeriscopeAppComponent} from './periscope.component';
import {PrComponent} from './pr/pr.component';

@NgModule({})
export class TestModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MaterialModule,
      providers: [],
    };
  }
}

export const routes: Routes = [
  {path: 'triage_pr', component: TriagePrComponent}, {path: 'sync', component: SyncComponent},
  {path: '', redirectTo: 'triage_pr', pathMatch: 'full'}
];

@NgModule({
  declarations: [PeriscopeAppComponent, SyncComponent, TriagePrComponent, PrComponent],
  imports: [
    BrowserModule, FormsModule, RouterModule.forRoot(routes), HttpModule, MaterialModule.forRoot()
  ],
  providers: [
    FIREBASE_PROVIDERS, {
      provide: FirebaseConfig,
      useValue: {
        apiKey: 'AIzaSyDtDqmYnJVGCBSyiIABFHpo5Hvmu3kjvpU',
        authDomain: 'project-934503789961360947.firebaseapp.com',
        databaseURL: 'https://project-934503789961360947.firebaseio.com',
        storageBucket: 'project-934503789961360947.appspot.com'
      }
    },
    {
      provide: FirebaseAuthConfig,
      useValue: {provider: AuthProviders.Github, method: AuthMethods.Redirect}
    }
  ],
  bootstrap: [PeriscopeAppComponent]
})
export class PeriscopeModule {
}
