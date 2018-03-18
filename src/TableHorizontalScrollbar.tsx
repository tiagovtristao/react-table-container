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
  containerWidth: number;
  tableWidth: number;
  scrollbarWidth: number;
  percentageScrolled: number;
  isMoving: boolean;
  previousMoveClientX: number;
}

export interface IScrollbarStyle {
  background: React.CSSProperties;
  backgroundFocus: React.CSSProperties;
  foreground: React.CSSProperties;
  foregroundFocus: React.CSSProperties;
}

export class TableHorizontalScrollbar extends React.Component<IProps, IState> {
  private readonly minHeight = 15;

  private scrollbar: HTMLElement;

  constructor(props: IProps) {
    super(props);

    this.state = {
      focused: false,
      containerWidth: 0,
      tableWidth: 0,
      scrollbarWidth: 0,
      percentageScrolled: props.scrollTo,
      isMoving: false,
      previousMoveClientX: 0
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
    const { containerWidth, tableWidth } = this.state;

    const newContainerWidth = container.getBoundingClientRect().width;
    const newTableWidth = table.getBoundingClientRect().width;

    if (containerWidth !== newContainerWidth || tableWidth !== newTableWidth) {
      this.calculateDimensions();
    }
  }

  public render(): JSX.Element {
    const { customStyle, table } = this.props;
    const {
      focused,
      percentageScrolled,
      containerWidth,
      tableWidth,
      scrollbarWidth
    } = this.state;

    const isScrollable = table ? containerWidth < tableWidth : false;

    let scrollbarContainerStyle: React.CSSProperties = {
      display: isScrollable ? "block" : "none",
      boxSizing: "border-box",
      position: "absolute",
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: "#E3E5EB",
      borderRadius: 4,
      height: 8
    };

    scrollbarContainerStyle = customStyle
      ? focused
        ? { ...scrollbarContainerStyle, ...customStyle.backgroundFocus }
        : { ...scrollbarContainerStyle, ...customStyle.background }
      : scrollbarContainerStyle;

    const scrollbarPositionLeft =
      (containerWidth - scrollbarWidth) * percentageScrolled;

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

    const tableWidth = table.getBoundingClientRect().width;
    const containerWidth = container.getBoundingClientRect().width;

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

    this.setState({
      isMoving: true,
      previousMoveClientX: event.clientX
    });
  };

  private onMouseMove = (event: MouseEvent): void => {
    /* tslint:disable:prefer-const */
    let {
      percentageScrolled,
      containerWidth,
      scrollbarWidth,
      isMoving,
      previousMoveClientX
    } = this.state;
    /* tslint:enable:prefer-const */

    if (!isMoving) {
      return;
    }

    event.preventDefault();

    const currentMoveClientX = event.clientX;
    const deltaX = currentMoveClientX - previousMoveClientX;

    const scrollbarMoveableDistance = containerWidth - scrollbarWidth;

    percentageScrolled = scrollbarMoveableDistance
      ? (scrollbarMoveableDistance * percentageScrolled + deltaX) /
        scrollbarMoveableDistance
      : 0;

    percentageScrolled = Math.max(0, Math.min(percentageScrolled, 1));

    previousMoveClientX = currentMoveClientX;

    this.props.onScroll(percentageScrolled);

    this.setState({
      percentageScrolled,
      previousMoveClientX
    });
  };

  private onMouseUp = (event: MouseEvent): void => {
    const { isMoving } = this.state;

    if (!isMoving) {
      return;
    }

    event.preventDefault();

    this.setState({
      isMoving: false,
      previousMoveClientX: 0
    });
  };

  private onMouseOver = (): void => {
    this.setState({ focused: true });
  };

  private onMouseOut = (): void => {
    this.setState({ focused: false });
  };
}
