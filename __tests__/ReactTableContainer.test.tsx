import * as React from "react";
import ReactDOMServer from 'react-dom/server';
import ReactTableContainer from "../src/index";

const tableHtml = `
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
`;


describe(
  "something",
  () => {
    let page;

    beforeAll(async () => {
      page = await global.__BROWSER__.newPage();

      await page.setContent(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body>
          <div id="app"></div>
        </body>
        </html>
      `);
    });

    afterAll(async () => {
      await page.close();
    })

    it('should load without error', async () => {
      // let text = await page.evaluate(() => document.body.textContent)
      // expect(text).toContain('google')

      let wrapper = ReactDOMServer.renderToString(
        <ReactTableContainer width="100px" height="100px">
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
      );

      await page.evaluate(() => {
        document.querySelector('#app').innerHTML = wrapper;
      });

      await expect(page.$('table')).resolves.not.toBeNull();
    })
  }
);
