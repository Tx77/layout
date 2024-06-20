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


/**
 * 获取距离最近的组件
 * @param currentComponent
 */
export interface DistanceResult {
  component: ComponentState;
  distance: number;
  direction: "left" | "right";
}


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


// const affectedComponents = findAffectedComponents(item, filterComponents).concat(item);
// console.log("affectedComponents", affectedComponents);
// if (
//   currentComponentHeight >= item.height &&
//   currentComponentTop + currentComponentHeight >= item.y + item.height
// ) {
//   console.log("++++++");
//   item.y = ghostTop;
//   ghostTop = item.y + item.height;
// } else if (currentComponentHeight < item.height && currentComponentTop >= item.y) {
//   console.log("========");
//   item.y = ghostTop;
//   ghostTop = item.y + item.height;
// } else {
//   console.log("%%%%%", item.id);
//   item.y = ghostTop + currentComponentHeight;
// }
// 		} else {
//   if (intersectComponent.value) {
//     componentsStorage.value.forEach((comp) => {
//       if (
//         comp.id === intersectComponent.value!.id &&
//         (intersectComponent.value!.x > ghostLeft + currentComponentWidth ||
//           intersectComponent.value!.x + intersectComponent.value!.width < ghostLeft)
//       ) {
//         console.log("intersectComponent", intersectComponent.value!.id);
//         intersectComponent.value!.y = comp.y;
//       }
//     });
//   }

// //* 过滤掉固定组件以及当前组件，进入组件重新定位的逻辑
// filterComponents.forEach((item) => {
//   //! 幽灵组件定位规则：
//   //! 1、幽灵组件永远不会和组件重叠
//   //! 2、重叠组件的重新定位不能叠加
//   //! 3、重叠组件重新定位时，需要依赖幽灵组件的初始值参数
//   //! 4、幽灵组件y轴初始值与重叠组件不一致时，需根据幽灵组件和重叠组件的高度不同来分别判断
//   //! 5、幽灵组件移出重叠组件后，重叠组件都需减去幽灵组件的高度
//   //* 幽灵组件进入组件x轴范围内
//   if (ghostInComponent(item) && overlappedComponents.length > 0 && overlappedComponents[0].id === item.id) {
//     console.log(item.id);
//     const intersectComponentStorage = componentsStorage.value.filter((comp) => comp.id === item.id)[0];

//     //* 重叠组件记录器
//     if (intersectComponents.value.length > 0) {
//       const index = intersectComponents.value.findIndex((comp) => comp.id === item.id);
//       if (index < 0) {
//         intersectComponents.value.push(item);
//       }
//     } else {
//       intersectComponents.value.push(item);
//     }
//     // affectedComponents = findAffectedComponents(
//     // 	intersectComponentStorage,
//     // 	componentsStorage.value.filter((item) => item.id !== currentComponentStyle.id && !item.fixed)
//     // );
//     // console.log(currentComponentStorage.y, intersectComponentStorage.y);
//     //?【初始值判断】---- 当前组件y轴【初始值】与重叠组件【初始值】处于同一高度
//     if (currentComponentStorage.y === intersectComponentStorage.y) {
//       // console.log("currentComponentTop", currentComponentTop, "itemY", item.y);
//       //* 当前组件y轴高度小于等于重叠组件y轴高度
//       if (currentComponentTop <= item.y) {
//         item.y = currentComponentStorage.y + currentComponentStorage.height;
//       }
//       //* 当前组件y轴高度大于重叠组件y轴高度
//       else {
//         ghostTop = item.y + item.height;
//         item.y = currentComponentStorage.y;
//       }
//     }
//     //?【初始值判断】---- 当前组件y轴【初始值】高于重叠组件【初始值】
//     if (currentComponentStorage.y < intersectComponentStorage.y) {
//       // console.log(item.id);
//       const itemUp = () => {
//         item.y = currentComponentStorage.y;
//         ghostTop = item.y + item.height;
//       };
//       const itemDown = () => {
//         item.y = intersectComponentStorage.y;
//       };
//       //* 当前组件【初始值】的y轴高度 + height 处于重叠组件【初始值】y轴高度 + height之间，需要将重叠组件移动到当前组件【初始值】的底部
//       const currentBetweenItem = () => {
//         return (
//           currentComponentStorage.y + currentComponentStorage.height > intersectComponentStorage.y &&
//           currentComponentStorage.y + currentComponentStorage.height <
//           intersectComponentStorage.y + intersectComponentStorage.height
//         );
//       };
//       //* 当前组件height大于等于重叠组件height
//       if (currentComponentHeight >= item.height) {
//         if (currentComponentTop <= item.y) {
//           item.y = ghostTop + currentComponentHeight;
//         } else {
//           ghostTop = item.y + item.height;
//         }
//         //* 当前组件y轴高度+height低于重叠组件y轴高度
//         // if (currentComponentTop + currentComponentHeight >= item.y + item.height) {
//         // 	itemUp();
//         // 	if (currentComponentTop < item.y) {
//         // 		itemDown();
//         // 	}
//         // } else {
//         // 	if (currentBetweenItem()) {
//         // 		// console.log("===");
//         // 		item.y = currentComponentStorage.y + currentComponentStorage.height;
//         // 	} else {
//         // 		itemDown();
//         // 	}
//         // }
//       }
//       //* 当前组件height小于重叠组件height
//       else {
//         if (currentComponentTop >= item.y) {
//           itemUp();
//         } else {
//           if (currentBetweenItem()) {
//             item.y = currentComponentStorage.y + currentComponentStorage.height;
//           } else {
//             itemDown();
//           }
//         }
//       }
//     }
//     //?【初始值判断】---- 当前组件y轴【初始值】低于重叠组件【初始值】
//     if (currentComponentStorage.y > intersectComponentStorage.y) {
//       const itemBetweenCurrent = () => {
//         return (
//           currentComponentStorage.y < intersectComponentStorage.y + intersectComponentStorage.height &&
//           currentComponentStorage.y + currentComponentStorage.height >
//           intersectComponentStorage.y + intersectComponentStorage.height
//         );
//       };
//       if (itemBetweenCurrent()) {
//         // console.log("====", intersectComponentStorage.id);
//         ghostTop = intersectComponentStorage.y + intersectComponentStorage.height;
//       } else {
//         if (currentComponentTop < item.y + item.height) {
//           ghostTop = intersectComponentStorage.y;
//           item.y = ghostTop + currentComponentHeight;
//         }
//         if (currentComponentTop + currentComponentHeight > item.y + item.height) {
//           item.y = intersectComponentStorage.y;
//         }
//       }
//     }
//     targetComponent = item;
//   }
//   //* 幽灵组件不在组件x轴范围内
//   else {
//     if (intersectComponents.value.length > 0) {
//       for (let i = intersectComponents.value.length - 1; i >= 0; i--) {
//         const compStorages = componentsStorage.value.filter((comp) => comp.id === intersectComponents.value[i].id);
//         if (!ghostInComponent(intersectComponents.value[i]) && compStorages.length > 0) {
//           intersectComponents.value[i].y = compStorages[0].y;
//           intersectComponents.value.splice(i, 1);
//         }
//       }
//     }
//   }
// });

// //* 判断受重叠组件重新定位而影响的其他组件
// if (targetComponent) {
//   // console.log(targetComponent);
//   const isAffectedByTargetComponent = (comp: ComponentState) => {
//     return (
//       targetComponent!.y + targetComponent!.height >= comp.y &&
//       targetComponent!.y + targetComponent!.height <= comp.y + comp.height
//     );
//   };
//   const affectedComponents = filterComponents.filter((item) => item.id !== targetComponent?.id);
//   if (affectedComponents.length > 0) {
//     affectedComponents.forEach((item) => {
//       if (isAffectedByTargetComponent(item)) {
//         // console.log(item.id, targetComponent!.y + targetComponent!.height);
//         // item.y += targetComponent!.y + targetComponent!.height;
//       }
//     });
//   }
// }


// //* ----------------------------
// //* 无论是【当前】否有碰撞组件，都需要调用此函数，因为存在都有碰撞组件，但当前和之前的碰撞组件不是同一个的情况
// if (overlappedComponents.length > 0) {
//   intersectComponents.value = overlappedComponents;
//   overlappedComponents.forEach((item) => {
//     const itemStorage = getComponentStorage(item);
//     let arr = findAffectedComponents(item, filterComponents);
//     arr.push(item);
//     affectedComponents.value = arr;
//     if (currentComponentStorage.y === itemStorage.y) {
//       if (currentComponentTop <= item.y) {
//         arr.forEach((comp) => {
//           comp.y += currentComponentHeight;
//         });
//       }
//     }
//     if (currentComponentStorage.y < itemStorage.y) {
//       //* 当前组件比碰撞组件更矮
//       if (currentComponentHeight <= item.height && ghostInComponent(item)) {
//         if (currentComponentTop >= item.y) {
//           item.y = currentComponentStorage.y;
//           ghostTop = item.y + item.height;
//         }
//         if (currentComponentTop + currentComponentHeight <= item.y + item.height) {
//           item.y = itemStorage.y;
//         }
//       }
//       //* 当前组件比碰撞组件更高
//       else {
//       }
//     }
//   });
// }