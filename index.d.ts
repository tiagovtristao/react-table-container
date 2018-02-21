import * as React from "react";

interface Props {
  scrollbarStyle?: {
    background: React.CSSProperties;
    backgroundFocus: React.CSSProperties;
    foreground: React.CSSProperties;
    foregroundFocus: React.CSSProperties;
  };
  width: string;
  height: string;
}

 export default class ReactTableContainer extends React.Component<Props> {}
 