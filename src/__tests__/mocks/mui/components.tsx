import React from 'react';

// Dialog Components
export const Dialog = jest.fn(({ children, ...props }) => (
  <div data-testid="mock-dialog" {...props}>
    {children}
  </div>
));

export const DialogTitle = jest.fn(({ children, ...props }) => (
  <div data-testid="mock-dialog-title" {...props}>
    {children}
  </div>
));

export const DialogContent = jest.fn(({ children, ...props }) => (
  <div data-testid="mock-dialog-content" {...props}>
    {children}
  </div>
));

export const DialogActions = jest.fn(({ children, ...props }) => (
  <div data-testid="mock-dialog-actions" {...props}>
    {children}
  </div>
));

// Button Components
export const Button = jest.fn(({ children, onClick, ...props }) => (
  <button data-testid="mock-button" onClick={onClick} {...props}>
    {children}
  </button>
));

export const IconButton = jest.fn(({ children, onClick, ...props }) => (
  <button data-testid="mock-icon-button" onClick={onClick} {...props}>
    {children}
  </button>
));

// Input Components
export const TextField = jest.fn(({ value, onChange, ...props }) => (
  <input data-testid="mock-textfield" value={value} onChange={onChange} {...props} />
));

export const Select = jest.fn(({ value, onChange, children, ...props }) => (
  <select data-testid="mock-select" value={value} onChange={onChange} {...props}>
    {children}
  </select>
));

// Layout Components
export const Box = jest.fn(({ children, ...props }) => (
  <div data-testid="mock-box" {...props}>
    {children}
  </div>
));

export const Container = jest.fn(({ children, ...props }) => (
  <div data-testid="mock-container" {...props}>
    {children}
  </div>
));

export const Grid = jest.fn(({ children, ...props }) => (
  <div data-testid="mock-grid" {...props}>
    {children}
  </div>
));

export const Paper = jest.fn(({ children, ...props }) => (
  <div data-testid="mock-paper" {...props}>
    {children}
  </div>
));

// Navigation Components
export const Tabs = jest.fn(({ children, value, onChange, ...props }) => (
  <div role="tablist" data-testid="mock-tabs" data-value={value} onChange={onChange} {...props}>
    {children}
  </div>
));

export const Tab = jest.fn(({ label, ...props }) => (
  <div role="tab" data-testid="mock-tab" {...props}>
    {label}
  </div>
));

// Feedback Components
export const CircularProgress = jest.fn(() => (
  <div data-testid="mock-circular-progress" />
));

export const LinearProgress = jest.fn(() => (
  <div data-testid="mock-linear-progress" />
));

export const Snackbar = jest.fn(({ children, ...props }) => (
  <div data-testid="mock-snackbar" {...props}>
    {children}
  </div>
));

export const Alert = jest.fn(({ children, severity, ...props }) => (
  <div data-testid="mock-alert" data-severity={severity} {...props}>
    {children}
  </div>
)); 