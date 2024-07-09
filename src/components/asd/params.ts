/*
 * @Author: 田鑫
 * @Date: 2024-07-03 11:24:42
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-07-04 16:28:52
 * @Description:
 */

export enum LayoutStrategy {
  PRO_RIGHT = 'pro_right',
  STANDARD = 'standard',
  PRO_LEFT = 'pro_left',
}

export interface ComponentStyle {
  position: string;
  left: string;
  top: string;
  width: string;
  minWidth: string;
  maxWidth?: string;
  minHeight: string;
  height: string;
  transition: string;
  display?: string;
  overflow?: string;
  zIndex: string;
}
export interface LayoutCompMap {
  compName: string;
  layoutStyle: ComponentStyle;
  fixed: boolean;
  show: boolean;
}

export type Coordinate = number | [number, number];

export type ComponentWidthRange = {
  width: [number, number];
  minWidth?: number;
  minHeight?: number;
  height: number;
  compName: string;
  background?: string;
  x: Coordinate;
  y: number;
  zIndex: string;
  fixed: boolean;
  show: boolean;
  moved?: boolean;
  static?: boolean;
};

export type Resolution = {
  [resolutionRange: string]: ComponentWidthRange[];
};

export type ScreenResolutionMap = {
  layoutStrategy: LayoutStrategy;
  resolution: Resolution;
};

export interface ComponentState {
  compName: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  zIndex?: number | string;
  fixed?: boolean;
  overflow?: string;
  position?: string;
  transition?: string;
  moved?: boolean;
  static?: boolean;
  show?: boolean;
  pointerEvents?: string;
}

export interface LayoutComponents extends ComponentState {
  comp: ReturnType<typeof defineComponent>;
}
export interface GhostStyle {
  width: string;
  height: string;
  zIndex?: string;
  backgroundColor: string;
  position: string;
  transition?: string;
  cursor?: string;
  transform?: string;
}

/**
 * 获取距离最近的组件
 * @param currentComponent
 */
export interface DistanceResult {
  component: ComponentState;
  distance: number;
  direction: 'left' | 'right';
}

export enum GhostType {
  DRAG = 'drag',
  RESIZE = 'resize',
}
