# Adaptive Layout Components & Drag & Resize

## 功能

- 自定义布局【更好的语义化配置文件】
- 模块自适应【不同分辨率、屏幕 resize】
- 刷新后缓存当前布局配置
- 模块 Drag
- 模块 Resize

## 技术栈

Vue3+Typescript+Vite

## 功能描述

1. 自定义布局

   ```js
   // 部分配置文件展示：
   export const contractTradeLayout: ScreenResolutionMap[] = [
   	{
   		layoutStrategy: LayoutStrategy.PRO_RIGHT,
   		resolution: {
   			"[768, 1023]": [
   				{ width: [768, 1023], compName: "Header", height: 60, x: 0, y: 2, zIndex: "2", fixed: true, show: true },
   				{ width: [500, 755], compName: "ExchangeChart", height: 550, x: 268, y: 64, zIndex: "1", fixed: true, show: true },
   				{ width: [500, 755], compName: "ExchangeList", height: 306, x: 268, y: 616, zIndex: "1", fixed: true, show: true },
   				{ width: [266, 266], compName: "ExchangeInfo", height: 858, x: 0, y: 64, zIndex: "1", fixed: true, show: true },
   				{ width: [768, 1023], compName: "UserExchangeTable", height: 356, x: 0, y: 924, zIndex: "1", fixed: true, show: true },
   			],
   			"[1024, 1280]": [
   				{ width: [1024, 1280], compName: "Header", height: 60, x: 0, y: 2, zIndex: "2", fixed: true, show: true },
   				{ width: [484, 742], compName: "ExchangeChart", height: 461, x: 536, y: 64, zIndex: "1", fixed: true, show: true },
   				{ width: [266, 266], compName: "ExchangeList", height: 461, x: 268, y: 64, zIndex: "1", fixed: true, show: true },
   				{ width: [266, 266], compName: "ExchangeInfo", height: 1168, x: 0, y: 64, zIndex: "1", fixed: true, show: true },
   				{ width: [760, 1010], compName: "UserExchangeTable", height: 706, x: 268, y: 527, zIndex: "1", fixed: true, show: true },
   			],
   		},
   	},
   ];
   ```

   可以看到 `resolution`的 key 为屏幕宽度区间值，value 为各个模块在当前区间值下的定位属性

   ### **属性释义**

   | key       | 释义       |  类型  |
   | :-------- | :--------- | :----: |
   | width     | 宽度       | 区间值 |
   | height    | 高度       |  数字  |
   | x         | x 轴坐标   | 区间值 |
   | y         | y 轴坐标   |  数字  |
   | zIndex    | 层级       | 字符串 |
   | fixed     | 是否固定   | 布尔值 |
   | show      | 是否显示   | 布尔值 |
   | minW      | 步进值倍率 |  数字  |
   | minHeight | 最小高度   |  数字  |

   `width`和`x`为区间值，起始和结束区间值分别为当前屏幕分辨率下的最小和最大宽度以及对应的 x 轴坐标。定义为区间值可以更方便地根据 UI 图设计来配置

   `minW`定义为步进值倍率，而不是像`minHeight`一样用具体的值的原因是，模块的 resize 和 drag 是根据步进值来变化的。因此，最小宽度不能是一个具体的值，否则值对不上

2. 模块自适应

   这里说明下模块`width`和`x`为什么要用百分比。正常来说用`px`也可以，在模块没有 resize 时，对屏幕进行 resize 其实无影响。但如果在某一个区间值内，对模块 resize 后，再对屏幕 resize，如果模块的`width`和`x`不用百分比，在这种情况下模块就没办法随屏幕变化而变化了
