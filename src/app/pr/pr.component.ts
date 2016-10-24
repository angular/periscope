import {Component, Input} from '@angular/core';
import {Digest} from '../github/store';

@Component({
  selector: 'app-pr',
  templateUrl: './pr.component.html',
  styleUrls: ['./pr.component.css']
})
export class PrComponent {
  prDigest: Digest;
  @Input()
  set pr(pr: number|Digest) { this.prDigest = <Digest>pr; }
}
