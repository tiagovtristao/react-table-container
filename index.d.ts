import * as React from "react";

interface Props {
  style?: React.CSSProperties;
  className?: string;
  width: string;
  height: string;
  maxWidth?: string;
  maxHeight?: string;
  scrollbarStyle?: {
    background: React.CSSProperties;
    backgroundFocus: React.CSSProperties;
    foreground: React.CSSProperties;
    foregroundFocus: React.CSSProperties;
  };
}

export default class ReactTableContainer extends React.Component<Props> {}
 