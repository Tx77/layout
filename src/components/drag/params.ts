export interface ComponentState {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex?: number | string;
  fixed?: boolean;
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

export interface Position {
  x: number;
  y: number;
}

export type Direction = 'left' | 'right' | 'top' | 'bottom';

// const closestComponents = findIntersectComponents(formatCurrentComponentStyle);
// const closestComponent = closestComponents[0];
// console.log("closestComponents", closestComponent);
//* 碰撞中
// if (closestComponents && closestComponents.length > 0) {
// 	intersectComponent.value = closestComponent;
// 	const currentComponentStatic = componentsStorage.value.filter((item) => item.id === currentComponentStyle.id)[0];
// 	const closestComponentStatic = componentsStorage.value.filter((item) => item.id === closestComponent.id)[0];
// 	if (currentComponentTop <= closestComponent.y) {
// 		ghostTop = closestComponentStatic.y;
// 		closestComponent.y = ghostTop + currentComponentHeight;
// 	} else {
// 		ghostTop = closestComponent.y + closestComponent.height;
// 	}
// }
// //* 非碰撞
// else {
// 	if (
// 		intersectComponent.value &&
// 		(intersectComponent.value.x > ghostLeft + currentComponentWidth ||
// 			intersectComponent.value.x + intersectComponent.value.width < ghostLeft)
// 	) {
// 		const closestComponentStatic = componentsStorage.value.filter(
// 			(item) => item.id === intersectComponent.value!.id
// 		)[0];
// 		intersectComponent.value.y = closestComponentStatic.y;
// 	}
// }
