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
  containerWidth: number;
  tableWidth: number;
  scrollbarWidth: number;
}

export interface IScrollbarStyle {
  background: React.CSSProperties;
  backgroundFocus: React.CSSProperties;
  foreground: React.CSSProperties;
  foregroundFocus: React.CSSProperties;
}

export class TableHorizontalScrollbar extends React.Component<IProps, IState> {
  private readonly minHeight = 15;

  private scrollbarRef: HTMLDivElement;

  private isMoving: boolean;
  private previousMoveClientX: number;

  constructor(props: IProps) {
    super(props);

    this.state = {
      focused: false,
      containerWidth: 0,
      tableWidth: 0,
      scrollbarWidth: 0
    };

    this.isMoving = false;
    this.previousMoveClientX = 0;
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
    const { containerWidth, tableWidth } = this.state;

    let newContainerWidth = containerRef.getBoundingClientRect().width;
    let newTableWidth = (ReactDOM.findDOMNode(
      tableRef
    ) as HTMLTableElement).getBoundingClientRect().width;

    if (containerWidth !== newContainerWidth || tableWidth !== newTableWidth) {
      this.calculateDimensions();
    }
  }

  public render(): JSX.Element {
    const { style, tableRef, scrollTo } = this.props;
    const { focused, containerWidth, tableWidth, scrollbarWidth } = this.state;

    let isScrollable = tableRef ? containerWidth < tableWidth : false;

    let scrollbarContainerStyle: React.CSSProperties = {
      display: isScrollable ? "block" : "none",
      boxSizing: "border-box",
      position: "absolute",
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: "#E3E5EB",
      height: 8
    };

    scrollbarContainerStyle = style
      ? focused
        ? { ...scrollbarContainerStyle, ...style.backgroundFocus }
        : { ...scrollbarContainerStyle, ...style.background }
      : scrollbarContainerStyle;

    let scrollbarPositionLeft = (containerWidth - scrollbarWidth) * scrollTo;

    let scrollbarStyle: React.CSSProperties = {
      boxSizing: "border-box",
      position: "absolute",
      bottom: 0,
      left: scrollbarPositionLeft,
      backgroundColor: "#888C97",
      borderRadius: 4,
      width: scrollbarWidth,
      height: 8
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

    let containerWidth = containerRef.getBoundingClientRect().width;
    let tableWidth = (ReactDOM.findDOMNode(
      tableRef
    ) as HTMLTableElement).getBoundingClientRect().width;

    let scrollbarWidth = tableWidth
      ? Math.pow(containerWidth, 2) / tableWidth
      : 0;

    scrollbarWidth = Math.max(
      this.minHeight,
      Math.min(scrollbarWidth, containerWidth)
    );

    this.setState({
      containerWidth,
      tableWidth,
      scrollbarWidth
    });
  }

  private onMouseDown = (event: MouseEvent): void => {
    event.preventDefault();

    this.isMoving = true;
    this.previousMoveClientX = event.clientX;
  };

  private onMouseMove = (event: MouseEvent): void => {
    let { scrollTo } = this.props;
    let { containerWidth, scrollbarWidth } = this.state;

    if (!this.isMoving) {
      return;
    }

    event.preventDefault();

    let currentMoveClientX = event.clientX;
    let deltaX = currentMoveClientX - this.previousMoveClientX;

    let scrollbarMoveableDistance = containerWidth - scrollbarWidth;

    scrollTo = scrollbarMoveableDistance
      ? (scrollbarMoveableDistance * scrollTo + deltaX) /
        scrollbarMoveableDistance
      : 0;

    scrollTo = Math.max(0, Math.min(scrollTo, 1));

    this.previousMoveClientX = currentMoveClientX;

    this.props.onScroll(scrollTo);
  };

  private onMouseUp = (event: MouseEvent): void => {
    if (!this.isMoving) {
      return;
    }

    event.preventDefault();

    this.isMoving = false;
    this.previousMoveClientX = 0;
  };

  private onMouseOver = (): void => {
    this.setState({ focused: true });
  };

  private onMouseOut = (): void => {
    this.setState({ focused: false });
  };
}
