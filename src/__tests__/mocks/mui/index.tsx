import React from 'react';

// Core MUI Components
export * from './components';
export * from './lab';
export * from './icons';

// Theme
export const createTheme = jest.fn(() => ({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
  spacing: (factor: number) => `${0.25 * factor}rem`,
}));

// Styles
export const styled = jest.fn((Component) => Component);
export const useTheme = jest.fn(() => ({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
  spacing: (factor: number) => `${0.25 * factor}rem`,
}));

// Date Pickers
export const DatePicker = jest.fn(({ value, onChange, ...props }) => (
  <div data-testid="mock-date-picker">
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  </div>
));

export const TimePicker = jest.fn(({ value, onChange, ...props }) => (
  <div data-testid="mock-time-picker">
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  </div>
));

// Styles Provider
export const StylesProvider = jest.fn(({ children }) => (
  <div data-testid="mock-styles-provider">{children}</div>
));

// MUI Components
export const mockDialog = {
  Dialog: jest.fn(({ children }) => <div data-testid="mock-dialog">{children}</div>),
  DialogTitle: jest.fn(({ children }) => <div data-testid="mock-dialog-title">{children}</div>),
  DialogContent: jest.fn(({ children }) => <div data-testid="mock-dialog-content">{children}</div>),
  DialogActions: jest.fn(({ children }) => <div data-testid="mock-dialog-actions">{children}</div>),
};

export const mockButtons = {
  Button: jest.fn(({ children, onClick }) => (
    <button data-testid="mock-button" onClick={onClick}>
      {children}
    </button>
  )),
  IconButton: jest.fn(({ children, onClick }) => (
    <button data-testid="mock-icon-button" onClick={onClick}>
      {children}
    </button>
  )),
};

export const mockInputs = {
  TextField: jest.fn(({ value, onChange }) => (
    <input data-testid="mock-textfield" value={value} onChange={onChange} />
  )),
  Select: jest.fn(({ value, onChange, children }) => (
    <select data-testid="mock-select" value={value} onChange={onChange}>
      {children}
    </select>
  )),
};

export const mockLayout = {
  Box: jest.fn(({ children }) => <div data-testid="mock-box">{children}</div>),
  Container: jest.fn(({ children }) => <div data-testid="mock-container">{children}</div>),
  Grid: jest.fn(({ children }) => <div data-testid="mock-grid">{children}</div>),
  Paper: jest.fn(({ children }) => <div data-testid="mock-paper">{children}</div>),
};

export const mockNavigation = {
  Tabs: jest.fn(({ children, value, onChange }) => (
    <div data-testid="mock-tabs" role="tablist" value={value} onChange={onChange}>
      {children}
    </div>
  )),
  Tab: jest.fn(({ label }) => <div data-testid="mock-tab" role="tab">{label}</div>),
};

export const mockFeedback = {
  CircularProgress: jest.fn(() => <div data-testid="mock-circular-progress" />),
  LinearProgress: jest.fn(() => <div data-testid="mock-linear-progress" />),
  Snackbar: jest.fn(({ children }) => <div data-testid="mock-snackbar">{children}</div>),
  Alert: jest.fn(({ children, severity }) => (
    <div data-testid="mock-alert" data-severity={severity}>
      {children}
    </div>
  )),
};

// MUI Lab Components
export const mockLab = {
  Timeline: jest.fn(({ children }) => <div data-testid="mock-timeline">{children}</div>),
  TimelineItem: jest.fn(({ children }) => <div data-testid="mock-timeline-item">{children}</div>),
  TimelineSeparator: jest.fn(({ children }) => <div data-testid="mock-timeline-separator">{children}</div>),
  TimelineContent: jest.fn(({ children }) => <div data-testid="mock-timeline-content">{children}</div>),
};

// MUI Icons
export const mockIcons = {
  Add: jest.fn(() => <span data-testid="mock-add-icon" />),
  Remove: jest.fn(() => <span data-testid="mock-remove-icon" />),
  Edit: jest.fn(() => <span data-testid="mock-edit-icon" />),
  Delete: jest.fn(() => <span data-testid="mock-delete-icon" />),
  Close: jest.fn(() => <span data-testid="mock-close-icon" />),
  Menu: jest.fn(() => <span data-testid="mock-menu-icon" />),
  Search: jest.fn(() => <span data-testid="mock-search-icon" />),
}; 