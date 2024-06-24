/*
 * @Author: 田鑫
 * @Date: 2024-06-12 10:17:44
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-06-24 18:04:44
 * @Description:
 */

import { defineComponent } from "vue";

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
  minWidth?: string;
  maxWidth?: string;
  height: string;
  transition: string;
  display?: string;
  overflow?: string;
  zIndex: string;
}

export interface ComponentState {
  comp: ReturnType<typeof defineComponent>;
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

export type Coordinate = number | [number, number];

export type ComponentWidthRange = {
  width: [number, number];
  height: number;
  compName: string;
  comp: ReturnType<typeof defineComponent>;
  background?: string;
  x: Coordinate;
  y: number;
  zIndex: string;
  fixed: boolean;
};

export type Resolution = {
  [resolutionRange: string]: ComponentWidthRange[];
};

export type ScreenResolutionMap = {
  layoutStrategy: LayoutStrategy;
  resolution: Resolution;
};