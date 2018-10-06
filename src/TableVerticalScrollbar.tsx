import * as React from "react";
import * as ReactDOM from "react-dom";

interface IProps {
  style?: IScrollbarStyle;
  containerRef: HTMLDivElement;
  tableRef;
  scrollTo: number;
  onScroll: (scrollTo: number) => void;
}

interface IState {
  focused: boolean;
  containerHeight: number;
  tableHeight: number;
  theadHeight: number;
  scrollbarHeight: number;
}

export interface IScrollbarStyle {
  background: React.CSSProperties;
  backgroundFocus: React.CSSProperties;
  foreground: React.CSSProperties;
  foregroundFocus: React.CSSProperties;
}

export class TableVerticalScrollbar extends React.Component<IProps, IState> {
  private readonly minHeight = 15;

  private scrollbarRef: HTMLDivElement;

  private isMoving: boolean;
  private previousMoveClientY: number;

  constructor(props: IProps) {
    super(props);

    this.state = {
      focused: false,
      containerHeight: 0,
      tableHeight: 0,
      theadHeight: 0,
      scrollbarHeight: 0
    };

    this.isMoving = false;
    this.previousMoveClientY = 0;
  }

  public componentDidMount(): void {
    this.calculateDimensions();

    this.scrollbarRef.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("mouseup", this.onMouseUp);
  }

  public componentWillUnmount(): void {
    this.scrollbarRef.removeEventListener("mousedown", this.onMouseDown);
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("mouseup", this.onMouseUp);
  }

  public componentDidUpdate(): void {
    const { containerRef, tableRef } = this.props;
    const { containerHeight, tableHeight } = this.state;

    let newContainerHeight = containerRef.getBoundingClientRect().height;
    let newTableHeight = (ReactDOM.findDOMNode(
      tableRef
    ) as HTMLTableElement).getBoundingClientRect().height;

    if (
      containerHeight !== newContainerHeight ||
      tableHeight !== newTableHeight
    ) {
      this.calculateDimensions();
    }
  }

  public render(): JSX.Element {
    const { style, tableRef, scrollTo } = this.props;
    const {
      focused,
      containerHeight,
      tableHeight,
      theadHeight,
      scrollbarHeight
    } = this.state;

    let isScrollable = tableRef
      ? containerHeight - theadHeight < tableHeight - theadHeight
      : false;

    let scrollbarContainerStyle: React.CSSProperties = {
      display: isScrollable ? "block" : "none",
      boxSizing: "border-box",
      position: "absolute",
      top: theadHeight,
      right: 0,
      bottom: 0,
      backgroundColor: "#E3E5EB",
      width: 8
    };

    scrollbarContainerStyle = style
      ? focused
        ? { ...scrollbarContainerStyle, ...style.backgroundFocus }
        : { ...scrollbarContainerStyle, ...style.background }
      : scrollbarContainerStyle;

    let scrollbarPositionTop =
      (containerHeight - theadHeight - scrollbarHeight) * scrollTo;

    let scrollbarStyle: React.CSSProperties = {
      boxSizing: "border-box",
      position: "absolute",
      top: scrollbarPositionTop,
      right: 0,
      backgroundColor: "#888C97",
      borderRadius: 4,
      width: 8,
      height: scrollbarHeight
    };

    scrollbarStyle = style
      ? focused
        ? { ...scrollbarStyle, ...style.foregroundFocus }
        : { ...scrollbarStyle, ...style.foreground }
      : scrollbarStyle;

    return (
      <div
        style={scrollbarContainerStyle}
        onMouseOver={this.onMouseOver}
        onMouseOut={this.onMouseOut}
      >
        <div ref={ref => (this.scrollbarRef = ref)} style={scrollbarStyle} />
      </div>
    );
  }

  private calculateDimensions(): void {
    const { containerRef, tableRef } = this.props;

    if (!containerRef || !tableRef) {
      return;
    }

    let containerHeight = containerRef.getBoundingClientRect().height;

    let tableElement = ReactDOM.findDOMNode(tableRef) as HTMLTableElement;
    let tableHeight = tableElement.getBoundingClientRect().height;
    let theadHeight = tableElement
      .querySelector("thead")
      .getBoundingClientRect().height;
    let noHeaderTableHeight = tableHeight - theadHeight;

    let visibleContainerHeight = containerHeight - theadHeight;

    let scrollbarHeight = noHeaderTableHeight
      ? Math.pow(visibleContainerHeight, 2) / noHeaderTableHeight
      : 0;

    scrollbarHeight = Math.max(
      this.minHeight,
      Math.min(scrollbarHeight, visibleContainerHeight)
    );

    this.setState({
      containerHeight,
      tableHeight,
      theadHeight,
      scrollbarHeight
    });
  }

  private onMouseDown = (event: MouseEvent): void => {
    event.preventDefault();

    this.isMoving = true;
    this.previousMoveClientY = event.clientY;
  };

  private onMouseMove = (event: MouseEvent): void => {
    let { scrollTo } = this.props;
    let { containerHeight, theadHeight, scrollbarHeight } = this.state;

    if (!this.isMoving) {
      return;
    }

    event.preventDefault();

    let currentMoveClientY = event.clientY;
    let deltaY = currentMoveClientY - this.previousMoveClientY;

    let scrollbarMoveableDistance =
      containerHeight - theadHeight - scrollbarHeight;

    scrollTo = scrollbarMoveableDistance
      ? (scrollbarMoveableDistance * scrollTo + deltaY) /
        scrollbarMoveableDistance
      : 0;

    scrollTo = Math.max(0, Math.min(scrollTo, 1));

    this.previousMoveClientY = currentMoveClientY;

    this.props.onScroll(scrollTo);
  };

  private onMouseUp = (event: MouseEvent): void => {
    if (!this.isMoving) {
      return;
    }

    event.preventDefault();

    this.isMoving = false;
    this.previousMoveClientY = 0;
  };

  private onMouseOver = (): void => {
    this.setState({ focused: true });
  };

  private onMouseOut = (): void => {
    this.setState({ focused: false });
  };
}
