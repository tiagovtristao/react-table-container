import * as React from "react";
import * as ReactDOMServer from 'react-dom/server';
import ReactTableContainer from "../src/index";

const containerHTML = (dimensions) => (
  ReactDOMServer.renderToString(
    <ReactTableContainer width={dimensions.width} height={dimensions.height}>
      <table>
        <thead>
          <tr>
            <th>Header cell</th>
            <th>Header cell</th>
            <th>Header cell</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Body cell</td>
            <td>Body cell</td>
            <td>Body cell</td>
          </tr>
          <tr>
            <td>Body cell</td>
            <td>Body cell</td>
            <td>Body cell</td>
          </tr>
        </tbody>
      </table>
    </ReactTableContainer>
  )
);

describe('container', () => {
  let page;

  beforeAll(async () => {
    page = await (global as any).__BROWSER__.newPage();

    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          #app {
            width: 1000px;
            height: 1000px;
          }
        </style>
      </head>
      <body>
        <div id="app"></div>
      </body>
      </html>
    `);
  });

  afterAll(async () => {
    await page.close();
  });

  const attachTable = async (dimensions) => {
    await page.evaluate(html => {
      document.querySelector('#app').innerHTML = html;
    }, containerHTML(dimensions));
  };

  const getComputedDimensions = async (selector) => {
   let computedDimensions = await page.evaluate(s => {
      let el = document.querySelector(s);

      return {
        width: window.getComputedStyle(el).width,
        height: window.getComputedStyle(el).height,
      }
    }, selector);

    return computedDimensions;
  };

  it('renders \'100px\' by \'100px\'', async () => {
    expect.assertions(2);

    await attachTable({ width: '100px', height: '100px' });

    let { width, height } = await getComputedDimensions('#app > div');

    expect(width).toBe('100px');
    expect(height).toBe('100px');
  });

  it('renders \'100%\' by \'100%\' (ie. the dimensions of the parent component)', async () => {
    expect.assertions(2);

    await attachTable({ width: '100%', height: '100%' });

    let parentContainerDimensions = await getComputedDimensions('#app');
    let containerDimensions = await getComputedDimensions('#app > div');

    expect(containerDimensions.width).toBe(parentContainerDimensions.width);
    expect(containerDimensions.height).toBe(parentContainerDimensions.height);
  });

  it('renders \'auto\' by \'auto\' (ie. the dimensions of the table itself)', async () => {
    expect.assertions(2);

    await attachTable({ width: 'auto', height: 'auto' });

    let containerDimensions = await getComputedDimensions('#app > div');
    let tableDimensions = await getComputedDimensions('#app table[data-rtc-id="1"]');

    expect(containerDimensions.width).toBe(tableDimensions.width);
    expect(containerDimensions.height).toBe(tableDimensions.height);
  });
});
