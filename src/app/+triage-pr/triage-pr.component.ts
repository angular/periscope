import {Component} from '@angular/core';
import {PrBoardService, Staleness} from '../pr-board.service';

@Component({
  selector: 'app-triage-pr',
  templateUrl: './triage-pr.component.html',
  styleUrls: ['./triage-pr.component.css']
})
export class TriagePrComponent {
  constructor(public state: PrBoardService) {}

  sum(s: Staleness): number { return s.length; }
}
