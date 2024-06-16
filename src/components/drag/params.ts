export interface ComponentState {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex?: number | string;
  fixed?: boolean;
}
export interface SnapResult {
  id?: string;
  left: number;
  top: number;
  width: number;
  height: number;
  cx?: number;
  cy?: number;
  isSnap: boolean;
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
export interface ClosestParams {
  component: ComponentState;
  distance: number;
  direction: string;
  isOverlapping: boolean;
}

export type ComponentStyle = {
  width: string;
  height: string;
  top: string;
  left: string;
  id: string;
};