/* eslint func-names: ['error', 'never'] */
/* eslint prefer-arrow-callback: 'off' */
/* eslint no-unused-expressions: 'off' */

import {
  $cliqzResults,
  expect,
  fillIn,
  respondWith,
  waitForPopup,
  withHistory } from './helpers';
import results from './fixtures/resultsTime';

export default function () {
  context('for a time result', function () {
    const timeSelector = 'div.time p';
    let timeItems;
    let $resultElement;

    before(function () {
      respondWith({ results });
      withHistory([]);
      fillIn('time berlin');
      return waitForPopup().then(function () {
        $resultElement = $cliqzResults()[0];
        timeItems = $resultElement.querySelectorAll(timeSelector);
      });
    });

    it('renders the main result', function () {
      expect(timeItems[0]).to.exist;
    });

    it('renders the main result with correct time', function () {
      expect(timeItems[0]).to.contain.text(results[0].snippet.extra.answer);
    });

    it('renders the main result with correct location', function () {
      expect(timeItems[0]).to.contain.text(results[0].snippet.extra.mapped_location);
    });

    it('renders the caption line', function () {
      expect(timeItems[1]).to.exist;
    });

    it('renders the caption line with correct date', function () {
      expect(timeItems[1]).to.contain.text(results[0].snippet.extra.expression);
    });

    it('renders the caption line with correct time zone', function () {
      expect(timeItems[1]).to.contain.text(results[0].snippet.extra.line3);
    });
  });
}
