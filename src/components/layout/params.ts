import { defineComponent } from "vue";

export interface ComponentState {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex?: number | string;
  fixed?: boolean;
  overflow?: string;
  position?: string;
  transition?: string;
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
}


export type ComponentStyle = {
  width: string;
  height: string;
  top: string;
  left: string;
  id: string;
};

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