/* eslint func-names: ['error', 'never'] */
/* eslint prefer-arrow-callback: 'off' */
/* eslint no-unused-expressions: 'off' */

import {
  click,
  $cliqzResults,
  CliqzUtils,
  expect,
  fillIn,
  press,
  release,
  respondWith,
  waitFor,
  waitForPopup,
  withHistory } from '../helpers';
import { results } from '../fixtures/resultsTwoSimpleWithoutAutocomplete';

export default function () {
  describe('generates correct telemetry signals for a "search with" result', function () {
    const win = CliqzUtils.getWindow();
    const enterSignalFields = [
      { name: 'current_position', type: 'number', expValue: 0 },
      { name: 'display_time', type: 'number' },
      { name: 'local_source', type: 'string', expValue: '' },
      { name: 'new_tab', type: 'boolean' },
      { name: 'position_type', type: 'object', resultLength: 1 },
      { name: 'query_length', type: 'number', expValue: 3 },
      { name: 'reaction_time', type: 'number' },
      { name: 'result_order', type: 'object', resultLength: 3 },
      { name: 'search', type: 'boolean', expValue: false },
      { name: 'v', type: 'number' },
    ];
    const clickSignalFields = [
      { name: 'current_position', type: 'number', expValue: 0 },
      { name: 'display_time', type: 'number' },
      { name: 'extra', type: 'object' },
      { name: 'local_source', type: 'string', expValue: '' },
      { name: 'mouse', type: 'object', resultLength: 4 },
      { name: 'new_tab', type: 'boolean', expValue: true },
      { name: 'position_type', type: 'object', resultLength: 1 },
      { name: 'query_length', type: 'number', expValue: 3 },
      { name: 'reaction_time', type: 'number' },
      { name: 'result_order', type: 'object', resultLength: 3 },
      { name: 'search', type: 'boolean', expValue: false },
      { name: 'v', type: 'number' },
    ];
    let $resultElement;
    let resultSignals;
    let resultSignalCount;
    let urlClicked;
    let handleCommandWhere;

    beforeEach(function () {
      urlClicked = false;
      handleCommandWhere = '';

      // clear telemetry
      win.allTelemetry = [];

      // mock function to open links
      win.CLIQZ.Core.urlbar.handleCommand = function (_, where) {
        urlClicked = true;
        handleCommandWhere = where;
      };

      withHistory([]);
      respondWith({ results });
      fillIn('qws');
      return waitForPopup().then(function () {
        $resultElement = $cliqzResults()[0];
      });
    });

    afterEach(function () {
      release({ key: 'Control', code: 'ControlLeft' });
      release({ key: 'Shift', code: 'ShiftLeft' });
    });

    [
      { name: 'Enter and Ctrl keys', press: { key: 'Enter', ctrlKey: true } },
      { name: 'Enter key', press: { key: 'Enter' } }
    ].forEach(function (pressedKeys) {
      context(`after pressing ${pressedKeys.name}`, function () {
        beforeEach(function () {
          press(pressedKeys.press);
          // check the boolean to make sure the function opening new links
          // has executed and finished
          return waitFor(function () {
            return urlClicked;
          })
            .then(function () {
              resultSignals = win.allTelemetry.filter(function (s) {
                return ((s.type === 'activity') && (s.action === 'result_enter'));
              });
              resultSignalCount = resultSignals.length;
            });
        });

        describe('sends an "activity > result_enter" signal', function () {
          it('only once and with correct amount of fields', function () {
            expect(resultSignalCount).to.equal(1);
            if (pressedKeys.press.ctrlKey) {
              expect(handleCommandWhere).to.equal('tab');
            } else {
              expect(handleCommandWhere).to.equal('current');
            }
            resultSignals.forEach(function (signal) {
              // add 2 to length for 'activity' and 'result_click'
              expect(Object.keys(signal).length).to.equal(enterSignalFields.length + 2);
            });
          });

          enterSignalFields.forEach(function (field) {
            it(`with an existing "${field.name}" field containing correct value(s)`, function () {
              resultSignals.forEach(function (signal) {
                expect(resultSignalCount).to.be.above(0);
                expect(signal[field.name]).to.exist;
                expect(typeof signal[field.name]).to.equal(field.type);

                if (field.expValue !== undefined) {
                  expect(signal[field.name]).to.equal(field.expValue);
                }

                if (field.resultLength !== undefined) {
                  expect(signal[field.name].length).to.equal(field.resultLength);
                }
              });
            });
          });
        });
      });
    });

    context('after pressing Ctrl key and clicking on the left mouse button', function () {
      beforeEach(function () {
        const resultSelector = 'div.history a.result';
        const $selectedResult = $resultElement.querySelector(resultSelector);
        click($selectedResult, { ctrlKey: true });
        // check the boolean to make sure the function opening new links
        // has executed and finished
        return waitFor(function () {
          return urlClicked;
        })
          .then(function () {
            resultSignals = win.allTelemetry.filter(function (s) {
              return ((s.type === 'activity') && (s.action === 'result_click'));
            });
            resultSignalCount = resultSignals.length;
          });
      });

      describe('sends an "activity > result_click signal"', function () {
        it('only once and with correct amount of fields', function () {
          expect(resultSignalCount).to.equal(1);
          resultSignals.forEach(function (signal) {
            // add 2 to length for 'activity' and 'result_click'
            expect(Object.keys(signal).length).to.equal(clickSignalFields.length + 2);
          });
        });

        clickSignalFields.forEach(function (field) {
          it(`with an existing "${field.name}" field containing correct value(s)`, function () {
            resultSignals.forEach(function (signal) {
              expect(resultSignalCount).to.be.above(0);
              // the following assertion cannot properly assert null fields
              // expect(signal[field.name]).to.exist;
              // the workaround is to check properties of the object
              expect(Object.hasOwnProperty.call(signal, field.name)).to.be.true;
              expect(typeof signal[field.name]).to.equal(field.type);

              if (field.expValue !== undefined) {
                expect(signal[field.name]).to.equal(field.expValue);
              }

              if (field.resultLength !== undefined) {
                expect(signal[field.name].length).to.equal(field.resultLength);
              }
            });
          });
        });
      });
    });
  });
}
