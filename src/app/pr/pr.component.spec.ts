import {inject} from '@angular/core/testing';
import {ComponentFixture, TestComponentBuilder} from '@angular/core/testing';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';
import {PrComponent} from './pr.component';

describe('Component: Pr', () => {
  let builder: TestComponentBuilder;

  beforeEach(
      inject([TestComponentBuilder], function(tcb: TestComponentBuilder) { builder = tcb; }));

  it('should inject the component',
     inject([PrComponent], (component: PrComponent) => { expect(component).toBeTruthy(); }));

  it('should create the component', inject([], () => {
       return builder.createAsync(PrComponentTestController)
           .then((fixture: ComponentFixture<any>) => {
             let query = fixture.debugElement.query(By.directive(PrComponent));
             expect(query).toBeTruthy();
             expect(query.componentInstance).toBeTruthy();
           });
     }));
});

@Component({
  selector: 'test',
  template: `
    <app-pr></app-pr>
  `,
  directives: [PrComponent]
})
class PrComponentTestController {
}
