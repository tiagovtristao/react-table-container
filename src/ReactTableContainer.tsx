import * as React from "react";
import * as ReactDOM from "react-dom";
import {
  TableVerticalScrollbar,
  IScrollbarStyle
} from "./TableVerticalScrollbar";
import { TableHorizontalScrollbar } from "./TableHorizontalScrollbar";

interface IDimensions {
  containerWidth: number;
  containerHeight: number;
  tableWidth: number;
  tableHeight: number;
}

interface IProps {
  style?: React.CSSProperties;
  className?: string;
  width: string;
  height: string;
  customHeader?: Array<React.ComponentClass<any> | React.SFC<any>>;
  scrollbarStyle?: IScrollbarStyle;
}

interface IState {
  containerWidth: number;
  containerHeight: number;
  tableWidth: number;
  tableHeight: number;
  tableMarginTop: number;
  verticalPercentageScrolled: number;
  tableMarginLeft: number;
  horizontalPercentageScrolled: number;
  isMoving: boolean;
  previousSwipeClientX: number;
  previousSwipeClientY: number;
}

export default class ReactTableContainer extends React.Component<
  IProps,
  IState
> {
  private readonly tableId = "main-table";
  private readonly headerTableId = "header-table";

  private readonly headerRelatedHTMLElements = ["colgroup", "thead"];

  private timeoutId = null;

  private containerRef: HTMLDivElement;
  private tableRef;
  private headerTableRef;

  private tableElement: HTMLElement;

  constructor(props: IProps) {
    super(props);

    // Some of the state below could possibly be converted into instance properties, as they don't seem to directly play a role during any rendering
    this.state = {
      containerWidth: 0,
      containerHeight: 0,
      tableWidth: 0,
      tableHeight: 0,
      tableMarginTop: 0,
      verticalPercentageScrolled: 0,
      tableMarginLeft: 0,
      horizontalPercentageScrolled: 0,
      isMoving: false,
      previousSwipeClientX: 0,
      previousSwipeClientY: 0
    };
  }

  public componentDidMount(): void {
    // Set up the Main Table
    this.tableElement = ReactDOM.findDOMNode(this.tableRef) as HTMLTableElement;

    // Register listeners
    this.tableElement.addEventListener("wheel", this.onWheel);

    this.tableElement.addEventListener("touchstart", this.onTouchStart);
    this.tableElement.addEventListener("touchmove", this.onTouchMove);
    this.tableElement.addEventListener("touchend", this.onTouchEnd);
    this.tableElement.addEventListener("touchcancel", this.onTouchEnd);

    window.addEventListener("resize", this.onWindowResize);

    // `getBoundingClientRect` can be called directly on the ref instance since it holds a DIV element instance
    let containerBoundingClientRect = this.containerRef.getBoundingClientRect();
    let tableBoundingClientRect = this.tableElement.getBoundingClientRect();

    // Apply initial dimensions
    this.applyDimensions({
      containerWidth: containerBoundingClientRect.width,
      containerHeight: containerBoundingClientRect.height,
      tableWidth: tableBoundingClientRect.width,
      tableHeight: tableBoundingClientRect.height
    });

    // Refs (which aren't null at this stage) must be propagated onto the scrollbar components.
    // This could be achieved using `this.forceUpdate()` but the `this.applyDimensions` method above already triggers the required re-render.
  }

  public componentWillUnmount(): void {
    // Remove listeners
    this.tableElement.removeEventListener("wheel", this.onWheel);

    this.tableElement.removeEventListener("touchstart", this.onTouchStart);
    this.tableElement.removeEventListener("touchmove", this.onTouchMove);
    this.tableElement.removeEventListener("touchend", this.onTouchEnd);
    this.tableElement.removeEventListener("touchcancel", this.onTouchEnd);

    window.removeEventListener("resize", this.onWindowResize);
  }

  public componentDidUpdate(): void {
    this.refreshHeaders();
    this.reevaluateDimensions();
  }

  public render(): JSX.Element {
    const {
      children,
      style,
      className,
      width,
      height,
      customHeader,
      scrollbarStyle
    } = this.props;
    const {
      tableMarginTop,
      verticalPercentageScrolled,
      tableMarginLeft,
      horizontalPercentageScrolled
    } = this.state;

    let containerStyle: React.CSSProperties = {
      boxSizing: "border-box",
      position: "relative",
      display: "inline-block",
      overflow: "hidden",
      width,
      height
    };

    let containerProps = {
      ref: ref => (this.containerRef = ref),
      style: {
        ...style,
        ...containerStyle
      },
      className
    };

    // Only one direct child (i.e. <table>) is allowed
    let table = React.Children.only(children) as React.ReactElement<any>;

    // Set table props
    let tableProps = {
      ...table.props,
      ref: ref => (this.tableRef = ref),
      "data-rtc-id": this.tableId, // Useful for targeting it outside the code base (i.e. testing)
      style: {
        ...table.props.style,
        borderSpacing: 0,
        marginTop: -tableMarginTop,
        marginLeft: -tableMarginLeft
      }
    };

    // Set header table props
    let headerTableProps = {
      ...table.props,
      ref: ref => (this.headerTableRef = ref),
      "data-rtc-id": this.headerTableId, // Useful for targeting it outside the code base (i.e. testing)
      style: {
        ...table.props.style,
        borderSpacing: 0,
        position: "absolute",
        top: 0,
        left: -tableMarginLeft,
        zIndex: 1
      },
      role: "presentation",
      "aria-hidden": "true"
    };

    let tableChildren = React.Children.toArray(table.props.children) as Array<React.ReactElement<any>>;

    let headerRelatedItems = customHeader ? [...this.headerRelatedHTMLElements, ...customHeader] : this.headerRelatedHTMLElements;

    // Extract out header related children
    let headerRelatedChildren = tableChildren.filter(({ type }) => headerRelatedItems.indexOf(type) !== -1);

    return (
      <div {...containerProps}>
        {/* Header Table: It has the purpose of only using header related children to stick them to the top of the container */}
        {React.cloneElement(table, headerTableProps, headerRelatedChildren)}

        {/* Main Table */}
        {React.cloneElement(table, tableProps)}

        <TableVerticalScrollbar
          style={scrollbarStyle}
          containerRef={this.containerRef}
          tableRef={this.tableRef}
          scrollTo={verticalPercentageScrolled}
          onScroll={this.onVerticalScroll}
        />

        <TableHorizontalScrollbar
          style={scrollbarStyle}
          containerRef={this.containerRef}
          tableRef={this.tableRef}
          scrollTo={horizontalPercentageScrolled}
          onScroll={this.onHorizontalScroll}
        />
      </div>
    );
  }

  private onWindowResize = (): void => {
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(this.reevaluateDimensions, 16);
  };

  // Make the header table's header cells the same width as the main table's header cells
  private refreshHeaders = (): void => {
    let headerTableHeaderRow = (ReactDOM.findDOMNode(
      this.headerTableRef
    ) as HTMLTableElement).querySelector("thead > tr:first-child");
    let tableHeaderRow = (ReactDOM.findDOMNode(
      this.tableRef
    ) as HTMLTableElement).querySelector("thead > tr:first-child");

    if (headerTableHeaderRow && tableHeaderRow) {
      let cellsWidth = [];

      // All necessary reads are done first for increased performance
      for (let i = 0; i < tableHeaderRow.children.length; i++) {
        cellsWidth.push(
          tableHeaderRow.children.item(i).getBoundingClientRect().width
        );
      }

      for (let i = 0; i < tableHeaderRow.children.length; i++) {
        let item = headerTableHeaderRow.children.item(i) as HTMLElement;

        item.style.boxSizing = "border-box";
        item.style.minWidth = cellsWidth[i] + "px";
      }
    }
  };

  // Update dimensions if they have changed
  private reevaluateDimensions = (): void => {
    const {
      containerWidth,
      containerHeight,
      tableWidth,
      tableHeight
    } = this.state;

    // `getBoundingClientRect` can be called directly on the ref instance since it holds a DIV element instance
    let containerBoundingClientRect = this.containerRef.getBoundingClientRect();
    let tableBoundingClientRect = (ReactDOM.findDOMNode(
      this.tableRef
    ) as HTMLTableElement).getBoundingClientRect();

    let newContainerWidth = containerBoundingClientRect.width;
    let newContainerHeight = containerBoundingClientRect.height;
    let newTableWidth = tableBoundingClientRect.width;
    let newTableHeight = tableBoundingClientRect.height;

    if (
      containerWidth !== newContainerWidth ||
      containerHeight !== newContainerHeight ||
      tableWidth !== newTableWidth ||
      tableHeight !== newTableHeight
    ) {
      this.applyDimensions({
        containerWidth: newContainerWidth,
        containerHeight: newContainerHeight,
        tableWidth: newTableWidth,
        tableHeight: newTableHeight
      });
    }
  };

  // For instance, if the table gets wider, the horizontal scrollbar will remain in the same place, but the amount of percentage scrolled will be now be less
  private applyDimensions(dimensions: IDimensions): void {
    let {
      tableMarginTop,
      verticalPercentageScrolled,
      tableMarginLeft,
      horizontalPercentageScrolled
    } = this.state;

    let verticalMaxScrollable =
      dimensions.tableHeight - dimensions.containerHeight;

    tableMarginTop = Math.max(
      0,
      Math.min(tableMarginTop, verticalMaxScrollable)
    );

    verticalPercentageScrolled = verticalMaxScrollable
      ? tableMarginTop / verticalMaxScrollable
      : 0;

    let horizontalMaxScrollable =
      dimensions.tableWidth - dimensions.containerWidth;

    tableMarginLeft = Math.max(
      0,
      Math.min(tableMarginLeft, horizontalMaxScrollable)
    );

    horizontalPercentageScrolled = horizontalMaxScrollable
      ? tableMarginLeft / horizontalMaxScrollable
      : 0;

    this.setState({
      containerWidth: dimensions.containerWidth,
      containerHeight: dimensions.containerHeight,
      tableWidth: dimensions.tableWidth,
      tableHeight: dimensions.tableHeight,
      tableMarginTop,
      verticalPercentageScrolled,
      tableMarginLeft,
      horizontalPercentageScrolled
    });
  }

  // If scrolling within the table hits any boundary, propagate it onto the window object
  private setWindowScroll(
    verticalMaxScrollable: number,
    newTableMarginTop: number,
    horizontalMaxScrollable: number,
    newTableMarginLeft: number
  ): void {
    let scrollByX = 0;
    let scrollByY = 0;

    if (newTableMarginTop < 0) {
      scrollByY = newTableMarginTop;
    } else if (newTableMarginTop > verticalMaxScrollable) {
      scrollByY = newTableMarginTop - verticalMaxScrollable;
    }

    if (newTableMarginLeft < 0) {
      scrollByX = newTableMarginLeft;
    } else if (newTableMarginLeft > horizontalMaxScrollable) {
      scrollByX = newTableMarginLeft - horizontalMaxScrollable;
    }

    window.scrollBy(scrollByX, scrollByY);
  }

  private onWheel = (event: WheelEvent): void => {
    event.preventDefault();

    let {
      containerWidth,
      containerHeight,
      tableWidth,
      tableHeight,
      tableMarginTop,
      verticalPercentageScrolled,
      tableMarginLeft,
      horizontalPercentageScrolled
    } = this.state;

    let deltaY = event.deltaY;
    let deltaX = event.deltaX;

    // Adjust if the delta values are specified in lines
    if (event.deltaMode === 1) {
      deltaY *= 10;
      deltaX *= 10;
    }

    // Get vertical properties
    let verticalMaxScrollable = Math.max(0, tableHeight - containerHeight);
    let newTableMarginTop = tableMarginTop + deltaY;

    // Get horizontal properties
    let horizontalMaxScrollable = Math.max(0, tableWidth - containerWidth);
    let newTableMarginLeft = tableMarginLeft + deltaX;

    this.setWindowScroll(
      verticalMaxScrollable,
      newTableMarginTop,
      horizontalMaxScrollable,
      newTableMarginLeft
    );

    // Set vertical properties
    tableMarginTop = Math.max(
      0,
      Math.min(newTableMarginTop, verticalMaxScrollable)
    );
    verticalPercentageScrolled = verticalMaxScrollable
      ? tableMarginTop / verticalMaxScrollable
      : 0;

    // Set horizontal properties
    tableMarginLeft = Math.max(
      0,
      Math.min(newTableMarginLeft, horizontalMaxScrollable)
    );
    horizontalPercentageScrolled = horizontalMaxScrollable
      ? tableMarginLeft / horizontalMaxScrollable
      : 0;

    this.setState({
      tableMarginTop,
      verticalPercentageScrolled,
      tableMarginLeft,
      horizontalPercentageScrolled
    });
  };

  private onTouchStart = (event: TouchEvent): void => {
    this.setState({
      isMoving: true,
      previousSwipeClientX: event.changedTouches[0].clientX,
      previousSwipeClientY: event.changedTouches[0].clientY
    });
  };

  private onTouchMove = (event: TouchEvent): void => {
    event.preventDefault();

    let {
      containerWidth,
      containerHeight,
      tableWidth,
      tableHeight,
      tableMarginTop,
      tableMarginLeft,
      isMoving,
      previousSwipeClientX,
      previousSwipeClientY
    } = this.state;

    if (!isMoving) {
      return;
    }

    // Get vertical properties
    let verticalMaxScrollable = Math.max(0, tableHeight - containerHeight);
    let currentSwipeClientY = event.changedTouches[0].clientY;
    let deltaY = previousSwipeClientY - currentSwipeClientY;
    let newTableMarginTop = tableMarginTop + deltaY;

    // Get horizontal properties
    let horizontalMaxScrollable = Math.max(0, tableWidth - containerWidth);
    let currentSwipeClientX = event.changedTouches[0].clientX;
    let deltaX = previousSwipeClientX - currentSwipeClientX;
    let newTableMarginLeft = tableMarginLeft + deltaX;

    this.setWindowScroll(
      verticalMaxScrollable,
      newTableMarginTop,
      horizontalMaxScrollable,
      newTableMarginLeft
    );

    // Set vertical properties
    tableMarginTop = Math.max(
      0,
      Math.min(newTableMarginTop, verticalMaxScrollable)
    );

    let verticalPercentageScrolled = verticalMaxScrollable
      ? tableMarginTop / verticalMaxScrollable
      : 0;

    previousSwipeClientY = currentSwipeClientY;

    // Set horizontal properties
    tableMarginLeft = Math.max(
      0,
      Math.min(newTableMarginLeft, horizontalMaxScrollable)
    );

    let horizontalPercentageScrolled = horizontalMaxScrollable
      ? tableMarginLeft / horizontalMaxScrollable
      : 0;

    previousSwipeClientX = currentSwipeClientX;

    this.setState({
      tableMarginTop,
      verticalPercentageScrolled,
      tableMarginLeft,
      horizontalPercentageScrolled,
      previousSwipeClientY,
      previousSwipeClientX
    });
  };

  private onTouchEnd = (event: TouchEvent): void => {
    this.setState({
      isMoving: false,
      previousSwipeClientX: 0,
      previousSwipeClientY: 0
    });
  };

  private onVerticalScroll = (scrollTo: number): void => {
    const { containerHeight, tableHeight } = this.state;

    let maxScrollable = tableHeight - containerHeight;

    let tableMarginTop = Math.max(
      0,
      Math.min(scrollTo * maxScrollable, maxScrollable)
    );

    this.setState({
      tableMarginTop,
      verticalPercentageScrolled: scrollTo
    });
  };

  private onHorizontalScroll = (scrollTo: number): void => {
    const { containerWidth, tableWidth } = this.state;

    let maxScrollable = tableWidth - containerWidth;

    let tableMarginLeft = Math.max(
      0,
      Math.min(scrollTo * maxScrollable, maxScrollable)
    );

    this.setState({
      tableMarginLeft,
      horizontalPercentageScrolled: scrollTo
    });
  };
}
