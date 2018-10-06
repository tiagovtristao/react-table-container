import * as React from "react";

interface Props {
  style?: React.CSSProperties;
  className?: string;
  width: string;
  height: string;
  customHeader?: Array<React.ComponentClass<any> | React.SFC<any>>;
  scrollbarStyle?: {
    background: React.CSSProperties;
    backgroundFocus: React.CSSProperties;
    foreground: React.CSSProperties;
    foregroundFocus: React.CSSProperties;
  };
}

export default class ReactTableContainer extends React.Component<Props> {}
 