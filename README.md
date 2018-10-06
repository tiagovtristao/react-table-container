<h1 align="center">
  ReactTableContainer
</h1>

<p align="center">
  A React component that wraps the HTML <strong>&lt;table&gt;</strong> element in a container of any specified dimensions <br />
  while keeping its header fixed to the top during scrolling.
</p>

<br />
<br />

<p align="center">
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#demo">Demo</a> •
  <a href="#api">API</a> •
  <a href="#limitations">Limitations</a> •
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <a href="https://travis-ci.org/tiagovtristao/react-table-container/">
    <img src="https://travis-ci.org/tiagovtristao/react-table-container.svg?branch=master" />
  </a>
  <a href="https://unpkg.com/react-table-container@latest/dist/react-table-container.min.js">
    <img src="https://img.badgesize.io/https://unpkg.com/react-table-container@latest/dist/react-table-container.min.js?compression=gzip&amp;label=size&amp;maxAge=300" />
  </a>
  <a href="./package.json">
    <img src="https://img.shields.io/npm/v/react-table-container/latest.svg?maxAge=300&label=version&colorB=007ec6&maxAge=300" />
  </a>
  <a href="./LICENSE.md">
    <img src="https://img.shields.io/npm/l/slate.svg?maxAge=300" />
  </a>
</p>

<br />
<br />

## Installation

```bash
npm install --save react-table-container
```

<br />

## Usage

```jsx
import React from "react";
import ReactTableContainer from "react-table-container";

const CustomHTMLTableResizedWithFixedHeader = () => (
  <ReactTableContainer width="auto" height="500px">
    <table>
      <colgroup>
          <col span="1" className="" />
          ...
      </colgroup>
      <thead>
        <tr>
          <th>Header cell</th>
          ...
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Body cell</td>
          ...
        </tr>
        <tr>
          <td>Body cell</td>
          ...
        </tr>
        ...
      </tbody>
    </table>
  </ReactTableContainer>
);

export default CustomHTMLTableResizedWithFixedHeader;
```

<br />

**Is there support for React components that render HTML table elements?** Yes, the `customHeader` prop (as seen below) exists as an escape hatch for this purpose. The table's direct child components that render `thead` and `colgroup` elements must be passed to it. This is required in order to successfully stick the custom table header to the top.

```jsx
// Based on https://github.com/mui-org/material-ui/blob/master/docs/src/pages/demos/tables/SimpleTable.js
import React from "react";
// Import components from `@material-ui/core`
import ReactTableContainer from "react-table-container";

// Define `styles`

// Define `data`

function CustomMaterialUITableResizedWithFixedHeader(props) {
  const { classes } = props;

  return (
    <Paper className={classes.root}>
      <ReactTableContainer width="auto" height="200px" customHeader={[TableHead]}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>Dessert (100g serving)</TableCell>
              <TableCell numeric>Calories</TableCell>
              <TableCell numeric>Fat (g)</TableCell>
              <TableCell numeric>Carbs (g)</TableCell>
              <TableCell numeric>Protein (g)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            { data.map(n => 
              <TableRow key={n.id}>
                <TableCell>{n.name}</TableCell>
                <TableCell numeric>{n.calories}</TableCell>
                <TableCell numeric>{n.fat}</TableCell>
                <TableCell numeric>{n.carbs}</TableCell>
                <TableCell numeric>{n.protein}</TableCell>
              </TableRow>
            ) }
          </TableBody>
        </Table>
      </ReactTableContainer>
    </Paper>
  );
}

export default withStyles(styles)(CustomMaterialUITableResizedWithFixedHeader);
```

<br />

## Demo

- [Examples](https://pwr8ny4vn0.codesandbox.io/)

<br />

## API

- `<ReactTableContainer width height>`
  - `width`: Any valid CSS value. **Required**.
  - `height`: Any valid CSS value. **Required**.
  - `customHeader`: List of table's direct child components that render `thead` and `colgroup` elements.
  - `style`: CSS-in-JS for the container itself.
  - `className`: CSS class name for the container itself.
  - `scrollbarStyle`: Object (below) to change the default scrollbar style.
    ```js
    {
      // How the container of the scrollbar should look like
      background: {
        /* Any valid CSS properties or empty */
      },
      // How the container should look like on mouse over
      backgroundFocus: {
        /* Any valid CSS properties or empty */
      },
      // How the scrollbar should look like
      foreground: {
        /* Any valid CSS properties or empty */
      },
      // How it should look like on mouse over
      foregroundFocus: {
        /* Any valid CSS properties or empty */
      }
    }
    ```

> **REQUIRED**
> 
> The table's header mustn't be transparent, otherwise the body content will appear under it on scroll.

<br />

## Limitations

- HTML `caption` table element is currently not supported. Using it might cause unexpected behaviour.

<br />

## Contributing

- Feel free to send pull requests for bug fixing. But make sure to run `npm run prettify` and `npm run ci` before doing so;
- Please open an issue first for new features/ideas.
