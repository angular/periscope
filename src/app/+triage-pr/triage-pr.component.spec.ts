import {inject} from '@angular/core/testing';
import {ComponentFixture, TestComponentBuilder} from '@angular/core/testing';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';
import {TriagePrComponent} from './triage-pr.component';

describe('Component: TriagePr', () => {
  let builder: TestComponentBuilder;

  beforeEach(
      inject([TestComponentBuilder], function(tcb: TestComponentBuilder) { builder = tcb; }));

  it('should inject the component', inject([TriagePrComponent], (component: TriagePrComponent) => {
       expect(component).toBeTruthy();
     }));

  it('should create the component', inject([], () => {
       return builder.createAsync(TriagePrComponentTestController)
           .then((fixture: ComponentFixture<any>) => {
             let query = fixture.debugElement.query(By.directive(TriagePrComponent));
             expect(query).toBeTruthy();
             expect(query.componentInstance).toBeTruthy();
           });
     }));
});

@Component({
  selector: 'test',
  template: `
    <app-triage-pr></app-triage-pr>
  `,
  directives: [TriagePrComponent]
})
class TriagePrComponentTestController {
}
