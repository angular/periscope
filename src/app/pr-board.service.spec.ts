import {inject} from '@angular/core/testing';

import {PrBoardService} from './pr-board.service';

describe('PrBoard Service', () => {
  it('should ...',
     inject([PrBoardService], (service: PrBoardService) => { expect(service).toBeTruthy(); }));
});
