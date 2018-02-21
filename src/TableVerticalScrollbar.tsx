import * as React from "react";

interface IProps {
  customStyle?: IScrollbarStyle;
  container: HTMLElement;
  table: HTMLTableElement;
  scrollTo: number;
  onScroll: (scrollTo: number) => void;
}

interface IState {
  focused: boolean;
  containerHeight: number;
  tableHeight: number;
  theadHeight: number;
  scrollbarHeight: number;
  percentageScrolled: number;
  isMoving: boolean;
  previousMoveClientY: number;
}

export interface IScrollbarStyle {
  background: React.CSSProperties;
  backgroundFocus: React.CSSProperties;
  foreground: React.CSSProperties;
  foregroundFocus: React.CSSProperties;
}

export class TableVerticalScrollbar extends React.Component<IProps, IState> {
  private readonly minHeight = 15;

  private scrollbar: HTMLElement;

  constructor(props: IProps) {
    super(props);

    this.state = {
      focused: false,
      containerHeight: 0,
      tableHeight: 0,
      theadHeight: 0,
      scrollbarHeight: 0,
      percentageScrolled: props.scrollTo,
      isMoving: false,
      previousMoveClientY: 0
    };
  }

  public componentDidMount(): void {
    this.calculateDimensions();

    this.scrollbar.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("mouseup", this.onMouseUp);
  }

  public componentWillReceiveProps(nextProps: IProps): void {
    if (this.state.percentageScrolled !== nextProps.scrollTo) {
      this.setState({ percentageScrolled: nextProps.scrollTo });
    }
  }

  public componentDidUpdate(): void {
    const { container, table } = this.props;
    const { containerHeight, tableHeight } = this.state;

    const newContainerHeight = container.getBoundingClientRect().height;
    const newTableHeight = table.getBoundingClientRect().height;

    if (
      containerHeight !== newContainerHeight ||
      tableHeight !== newTableHeight
    ) {
      this.calculateDimensions();
    }
  }

  public render(): JSX.Element {
    const { customStyle, table } = this.props;
    const {
      focused,
      percentageScrolled,
      containerHeight,
      tableHeight,
      theadHeight,
      scrollbarHeight
    } = this.state;

    const isScrollable = table
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
      borderRadius: 4,
      width: 8
    };

    scrollbarContainerStyle = customStyle
      ? focused
        ? { ...scrollbarContainerStyle, ...customStyle.backgroundFocus }
        : { ...scrollbarContainerStyle, ...customStyle.background }
      : scrollbarContainerStyle;

    const scrollbarPositionTop =
      (containerHeight - theadHeight - scrollbarHeight) * percentageScrolled;

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

    scrollbarStyle = customStyle
      ? focused
        ? { ...scrollbarStyle, ...customStyle.foregroundFocus }
        : { ...scrollbarStyle, ...customStyle.foreground }
      : scrollbarStyle;

    return (
      <div
        style={scrollbarContainerStyle}
        onMouseOver={this.onMouseOver}
        onMouseOut={this.onMouseOut}
      >
        <div ref={ref => (this.scrollbar = ref)} style={scrollbarStyle} />
      </div>
    );
  }

  public componentWillUnmount(): void {
    this.scrollbar.removeEventListener("mousedown", this.onMouseDown);
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("mouseup", this.onMouseUp);
  }

  private calculateDimensions(): void {
    const { container, table } = this.props;

    if (!container || !table) {
      return;
    }

    const containerHeight = container.getBoundingClientRect().height;
    const tableHeight = table.getBoundingClientRect().height;
    const theadHeight = table.querySelector("thead").getBoundingClientRect()
      .height;
    const tbodyHeight = tableHeight - theadHeight;

    const visibleContainerHeight = containerHeight - theadHeight;

    let scrollbarHeight = tbodyHeight
      ? Math.pow(visibleContainerHeight, 2) / tbodyHeight
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

    this.setState({
      isMoving: true,
      previousMoveClientY: event.clientY
    });
  };

  private onMouseMove = (event: MouseEvent): void => {
    event.preventDefault();

    /* tslint:disable:prefer-const */
    let {
      percentageScrolled,
      containerHeight,
      theadHeight,
      scrollbarHeight,
      isMoving,
      previousMoveClientY
    } = this.state;
    /* tslint:enable:prefer-const */

    if (!isMoving) {
      return;
    }

    const currentMoveClientY = event.clientY;
    const deltaY = currentMoveClientY - previousMoveClientY;

    const scrollbarMoveableDistance =
      containerHeight - theadHeight - scrollbarHeight;

    percentageScrolled = scrollbarMoveableDistance
      ? (scrollbarMoveableDistance * percentageScrolled + deltaY) /
        scrollbarMoveableDistance
      : 0;

    percentageScrolled = Math.max(0, Math.min(percentageScrolled, 1));

    previousMoveClientY = currentMoveClientY;

    this.props.onScroll(percentageScrolled);

    this.setState({
      percentageScrolled,
      previousMoveClientY
    });
  };

  private onMouseUp = (event: MouseEvent): void => {
    event.preventDefault();

    const { isMoving } = this.state;

    this.setState({
      isMoving: false,
      previousMoveClientY: 0
    });
  };

  private onMouseOver = (): void => {
    this.setState({ focused: true });
  };

  private onMouseOut = (): void => {
    this.setState({ focused: false });
  };
}
