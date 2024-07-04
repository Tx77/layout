/*
 * @Author: 田鑫
 * @Date: 2024-06-12 10:17:44
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-07-04 10:35:43
 * @Description:
 */


export enum LayoutStrategy {
  PRO_RIGHT = 'pro_right',
  STANDARD = 'standard',
  PRO_LEFT = 'pro_left'
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

export interface ComponentState {
  x: number | string;
  y: number | string;
  width?: number | string;
  minWidth?: number | string;
  maxWidth?: number | string;
  height: number;
  zIndex?: number | string;
  background?: string;
  fixed?: boolean;
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