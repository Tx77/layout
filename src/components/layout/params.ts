import { defineComponent } from "vue";

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
}

export interface LayoutComponents extends ComponentState {
  comp: ReturnType<typeof defineComponent>;
}
export interface GhostStyle {
  top: string;
  left: string;
  width: string;
  height: string;
  zIndex?: string;
  backgroundColor: string;
  position: string;
  transition?: string;
  cursor?: string;
}

/**
 * 获取距离最近的组件
 * @param currentComponent
 */
export interface DistanceResult {
  component: ComponentState;
  distance: number;
  direction: "left" | "right";
}

export enum GhostType {
  DRAG = 'drag',
  RESIZE = 'resize'
}