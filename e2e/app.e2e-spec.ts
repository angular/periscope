import { PeriscopePage } from './app.po';

describe('periscope App', function() {
  let page: PeriscopePage;

  beforeEach(() => {
    page = new PeriscopePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
