import React from 'react';

// Timeline Components
export const Timeline = jest.fn(({ children, ...props }) => (
  <div data-testid="mock-timeline" {...props}>
    {children}
  </div>
));

export const TimelineItem = jest.fn(({ children, ...props }) => (
  <div data-testid="mock-timeline-item" {...props}>
    {children}
  </div>
));

export const TimelineSeparator = jest.fn(({ children, ...props }) => (
  <div data-testid="mock-timeline-separator" {...props}>
    {children}
  </div>
));

export const TimelineContent = jest.fn(({ children, ...props }) => (
  <div data-testid="mock-timeline-content" {...props}>
    {children}
  </div>
));

// Date/Time Pickers
export const DateTimePicker = jest.fn(({ value, onChange, ...props }) => (
  <div data-testid="mock-datetime-picker">
    <input
      type="datetime-local"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  </div>
));

export const MobileDatePicker = jest.fn(({ value, onChange, ...props }) => (
  <div data-testid="mock-mobile-date-picker">
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  </div>
));

export const MobileTimePicker = jest.fn(({ value, onChange, ...props }) => (
  <div data-testid="mock-mobile-time-picker">
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  </div>
)); 