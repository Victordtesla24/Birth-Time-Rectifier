import { queries, Queries } from '@testing-library/dom';
import { ReactElement } from 'react';
import { RenderResult } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';

declare module '@testing-library/dom' {
    export interface WithinOptions {
        container: HTMLElement;
    }

    export function within<T extends Queries = typeof queries>(
        element: HTMLElement,
        options?: WithinOptions
    ): T;

    export function getByText(text: string): HTMLElement;
    export function getByTestId(id: string): HTMLElement;
}

declare module '@testing-library/react' {
    export interface RenderResult {
        container: HTMLElement;
        getByTestId(id: string): HTMLElement;
        getByText(text: string): HTMLElement;
        getByLabelText(label: string): HTMLElement;
        getByRole(role: string): HTMLElement;
        queryByTestId(id: string): HTMLElement | null;
        queryByText(text: string): HTMLElement | null;
        queryByLabelText(label: string): HTMLElement | null;
        queryByRole(role: string): HTMLElement | null;
        findByTestId(id: string): Promise<HTMLElement>;
        findByText(text: string): Promise<HTMLElement>;
        findByLabelText(label: string): Promise<HTMLElement>;
        findByRole(role: string): Promise<HTMLElement>;
    }

    export interface RenderOptions {
        container?: HTMLElement;
        baseElement?: HTMLElement;
        hydrate?: boolean;
        wrapper?: React.ComponentType<any>;
    }

    function render(ui: ReactElement, options?: RenderOptions): RenderResult;
    function within(element: HTMLElement): RenderResult;
    function fireEvent(element: Element | null, event: Event): void;
    function fireEvent(element: Element | null, eventName: string, options?: object): void;

    export * from '@testing-library/dom';
}

declare module '@testing-library/user-event' {
    interface UserEvent {
        type(element: Element | null, text: string): Promise<void>;
        click(element: Element | null): Promise<void>;
        hover(element: Element | null): Promise<void>;
        keyboard(text: string): Promise<void>;
    }
}

declare module '@testing-library/jest-dom/extend-expect' {
    interface Matchers<R> {
        toBeInTheDocument(): R;
        toHaveClass(className: string): R;
        toHaveStyle(style: object): R;
        toBeVisible(): R;
        toBeDisabled(): R;
        toBeEnabled(): R;
        toHaveValue(value: string | number | string[]): R;
        toHaveTextContent(text: string | RegExp): R;
        toContainElement(element: HTMLElement | null): R;
        toContainHTML(html: string): R;
        toHaveAttribute(attr: string, value?: string): R;
    }
}

declare module '@testing-library/dom/types' {
    export interface EventMap {
        click: MouseEvent;
        change: Event;
        mouseup: MouseEvent;
        mousedown: MouseEvent;
        keydown: KeyboardEvent;
        keyup: KeyboardEvent;
        submit: Event;
    }

    export interface FireObject {
        <K extends keyof EventMap>(
            element: Element | Document | Window | Node,
            event: K,
            options?: Partial<EventMap[K]>
        ): void;
    }

    export const fireEvent: FireObject & {
        [K in keyof EventMap]: (
            element: Element | Document | Window | Node,
            options?: Partial<EventMap[K]>
        ) => void;
    };
}

declare module '@testing-library/jest-dom';

declare module 'p5' {
    export default class P5 {
        constructor(sketch: (p: P5) => void);
        push(): void;
        pop(): void;
        translate(x: number, y: number): void;
        scale(n: number): void;
        fill(color: string | number): void;
        stroke(color: string | number): void;
        noStroke(): void;
        rect(x: number, y: number, w: number, h: number, r?: number): void;
        circle(x: number, y: number, d: number): void;
        text(str: string, x: number, y: number, w?: number, h?: number): void;
        textAlign(h: string | number, v?: string | number): void;
        textSize(size: number): void;
        line(x1: number, y1: number, x2: number, y2: number): void;
        millis(): number;
        background(color: string | number): void;
        width: number;
        height: number;
        CENTER: string;
        TOP: string;
        LEFT: string;
        PI: number;
    }
}

declare global {
    interface Window {
        fetch: jest.Mock;
    }
}

// Mock types for test files
interface MockApiClient {
    calculateBirthTime: jest.Mock;
    generateQuestionnaire: jest.Mock;
    request: jest.Mock;
    onError: jest.Mock;
    setEventBus: jest.Mock;
}

interface MockEventBus {
    on: jest.Mock;
    off: jest.Mock;
    emit: jest.Mock;
}

interface MockFormManager {
    submitForm: jest.Mock;
    loading: boolean;
}

interface MockVisualizationManager {
    renderChart: jest.Mock;
    cleanup: jest.Mock;
}

interface MockWorkflowOrchestrator {
    processBirthData: jest.Mock;
}

interface MockContainer extends HTMLElement {
    querySelector(selector: string): HTMLElement | null;
    querySelectorAll(selector: string): NodeListOf<HTMLElement>;
    appendChild(element: HTMLElement): void;
}

// Export mock types
export {
    MockApiClient,
    MockEventBus,
    MockFormManager,
    MockVisualizationManager,
    MockWorkflowOrchestrator,
    MockContainer
}; 