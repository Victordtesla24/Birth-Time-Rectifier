import { Selection } from 'd3';

const mockArc = () => {
  const arcFn = (d: any) => 'M0,0 L10,10 A10,10 0 0,1 20,20 Z';
  arcFn.innerRadius = (r: number) => arcFn;
  arcFn.outerRadius = (r: number) => arcFn;
  arcFn.startAngle = (a: number) => arcFn;
  arcFn.endAngle = (a: number) => arcFn;
  arcFn.padAngle = (a: number) => arcFn;
  arcFn.cornerRadius = (r: number) => arcFn;
  return arcFn;
};

const mockZoom = () => {
  const zoomFn = () => {};
  zoomFn.scaleExtent = (extent: [number, number]) => zoomFn;
  zoomFn.translateExtent = (extent: [[number, number], [number, number]]) => zoomFn;
  zoomFn.on = (event: string, handler: (event: any) => void) => zoomFn;
  return zoomFn;
};

const mockSelect = (selector: string | Element) => {
  const selection: any = {
    attr: (name: string, value: any) => selection,
    style: (name: string, value: any) => selection,
    call: (fn: Function) => selection,
    on: (event: string, handler: Function) => selection,
    append: (type: string) => selection,
    data: (data: any[]) => selection,
    enter: () => selection,
    exit: () => selection,
    remove: () => selection,
    select: (s: string) => selection,
    selectAll: (s: string) => selection,
    node: () => document.createElement('div'),
    transition: () => selection,
  };
  return selection;
};

const mockScale = () => {
  const scale = (value: any) => value;
  scale.domain = () => scale;
  scale.range = () => scale;
  scale.padding = () => scale;
  scale.round = () => scale;
  scale.clamp = () => scale;
  scale.nice = () => scale;
  return scale;
};

const mockZoomIdentity = {
  x: 0,
  y: 0,
  k: 1,
  scale: (k: number) => mockZoomIdentity,
  translate: (x: number, y: number) => mockZoomIdentity,
  apply: (point: [number, number]) => point,
  applyX: (x: number) => x,
  applyY: (y: number) => y,
  invert: (point: [number, number]) => point,
  invertX: (x: number) => x,
  invertY: (y: number) => y,
  rescaleX: (x: any) => x,
  rescaleY: (y: any) => y,
  toString: () => 'translate(0,0) scale(1)',
};

export const arc = mockArc;
export const zoom = mockZoom;
export const select = mockSelect;
export const selectAll = (selector: string) => mockSelect(selector);
export const zoomIdentity = mockZoomIdentity;
export const scaleLinear = mockScale;
export const scaleOrdinal = mockScale;
export const scaleBand = mockScale;
export const scaleTime = mockScale;

export const line = () => ({
  x: () => line(),
  y: () => line(),
  curve: () => line(),
});

export const pie = () => ({
  value: () => pie(),
  sort: () => pie(),
  startAngle: () => pie(),
  endAngle: () => pie(),
  padAngle: () => pie(),
});

export const axisBottom = () => ({});
export const axisLeft = () => ({});
export const axisTop = () => ({});
export const axisRight = () => ({});

export const timeFormat = () => (date: Date) => date.toISOString();
export const timeParser = () => (dateString: string) => new Date(dateString);

export const extent = (data: any[], accessor?: (d: any) => any) => {
  if (!data.length) return [0, 1];
  if (!accessor) return [Math.min(...data), Math.max(...data)];
  const values = data.map(accessor);
  return [Math.min(...values), Math.max(...values)];
};

export const max = (data: any[], accessor?: (d: any) => any) => {
  if (!data.length) return 0;
  if (!accessor) return Math.max(...data);
  return Math.max(...data.map(accessor));
};

export const min = (data: any[], accessor?: (d: any) => any) => {
  if (!data.length) return 0;
  if (!accessor) return Math.min(...data);
  return Math.min(...data.map(accessor));
};

export default {
  arc: mockArc,
  zoom: mockZoom,
  select: mockSelect,
  selectAll: (selector: string) => mockSelect(selector),
  zoomIdentity: mockZoomIdentity,
  scaleLinear: mockScale,
  scaleOrdinal: mockScale,
  scaleBand: mockScale,
  scaleTime: mockScale,
  line: line,
  pie: pie,
  axisBottom: axisBottom,
  axisLeft: axisLeft,
  axisTop: axisTop,
  axisRight: axisRight,
  timeFormat: timeFormat,
  timeParser: timeParser,
  extent: extent,
  max: max,
  min: min,
}; 