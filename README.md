# ReactTableContainer

A React component container for the HTML **\<table\>** element that allows it to be of any specified dimensions while locking its header during scrolling.

### Motivation

Sometimes, you need your **\<table\>** element to have a specific height and width to fit in an area of your page, without having the tabular data within the element affecting these required dimensions, nor these dimensions affecting the layout of this element. Also, the **\<thead\>** element should ideally remain fixed/locked as you scroll down the data, so the context is not lost.

This is what this React component aims to solve.

### Demos

* https://codepen.io/tiagovtristao/full/eeyyOP/

### Installation

```
npm install --save react-table-container
```

### Usage

```js
import ReactTableContainer from 'react-table-container';

class MyTable extends Component {
  render() {
    return (
      <ReactTableContainer width="auto" height="500px">
        <table>
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
  }
}
```

**Note**: The table's header mustn't be transparent, otherwise the body content will appear under it on scroll.

### Options

* `width`: Any valid CSS value. **Required**.
* `height`: Any valid CSS value. **Required**.
* `scrollbarStyle`: Object (below) to change the default scrollbar style. **Optional**.
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

### Contributing

* The code base is written using TypeScript;
* Feel free to send pull requests for bug fixing. But make sure you run `npm run lint` and `npm run prettify` before;
* Please open an issue first for new features/ideas.

### License

MIT
