import {inject} from '@angular/core/testing';
import {ComponentFixture, TestComponentBuilder} from '@angular/core/testing';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';
import {SyncComponent} from './sync.component';

describe('Component: Sync', () => {
  let builder: TestComponentBuilder;

  beforeEach(
      inject([TestComponentBuilder], function(tcb: TestComponentBuilder) { builder = tcb; }));

  it('should inject the component',
     inject([SyncComponent], (component: SyncComponent) => { expect(component).toBeTruthy(); }));

  it('should create the component', inject([], () => {
       return builder.createAsync(SyncComponentTestController)
           .then((fixture: ComponentFixture<any>) => {
             let query = fixture.debugElement.query(By.directive(SyncComponent));
             expect(query).toBeTruthy();
             expect(query.componentInstance).toBeTruthy();
           });
     }));
});

@Component({selector: 'test', template: `<app-sync></app-sync>`, directives: [SyncComponent]})
class SyncComponentTestController {
}
