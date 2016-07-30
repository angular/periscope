import {inject} from '@angular/core/testing';

import {PeriscopeAppComponent} from '../app/periscope.component';

describe('App: Periscope', () => {
  it('should create the app', inject([PeriscopeAppComponent], (app: PeriscopeAppComponent) => {
       expect(app).toBeTruthy();
     }));
});
