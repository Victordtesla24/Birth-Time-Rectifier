/// <reference types="react" />
/// <reference types="@mui/material" />
/// <reference types="@mui/x-date-pickers" />

// Re-export all types
export * from './components';
export * from './api';
export * from './services';
export * from './animation';
export * from './shared';

// Module declarations
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.json' {
  const content: any;
  export default content;
} 