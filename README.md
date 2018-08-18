ReactTableContainer
===================

It wraps the HTML **\<table\>** element (or a component rendering it) in a container of any specified dimensions while keeping its header fixed to the top during scrolling.

* Table header event listeners are preserved;
* Tested on Chrome (Desktop & Mobile), Firefox, Safari, Edge and IE11.

Installation
------------

```bash
npm install --save react-table-container
```

Usage
-----

**Example 1** (using HTML table elements only)

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

**Example 2** (using `@material-ui`)

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
      <ReactTableContainer width="auto" height="200px">
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

> **REQUIRED**
> 
> The table's header mustn't be transparent, otherwise the body content will appear under it on scroll.

Working Examples
----------------

- [Demos](https://codesandbox.io/s/pwr8ny4vn0?view=preview)

Options
-------

* `width`: Any valid CSS value. **Required**.
* `height`: Any valid CSS value. **Required**.
* `maxWidth`: Any valid CSS value. *Optional*.
* `maxHeight`: Any valid CSS value. *Optional*.
* `style`: CSS-in-JS for the container itself. *Optional*.
* `className`: CSS class name for the container itself. *Optional*.
* `scrollbarStyle`: Object (below) to change the default scrollbar style. *Optional*.
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

Limitations
-----------

* HTML `caption` and `tfoot` table elements are currently not supported. Using them might cause unexpected behaviour.

Contributing
------------

* Feel free to send pull requests for bug fixing. But make sure to run `npm run prettify` and `npm run ci` before doing so;
* Please open an issue first for new features/ideas.

License
-------

MIT
