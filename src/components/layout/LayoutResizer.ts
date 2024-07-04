/*
 * @Author: 田鑫
 * @Date: 2024-06-13 14:09:38
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-07-04 11:26:53
 * @Description:
 */

import { onMounted, onUnmounted, reactive, ref, watch } from "vue";
import {
  LayoutStrategy,
  type ComponentWidthRange,
  type Resolution,
  type Coordinate,
  ScreenResolutionMap,
  LayoutCompMap,
} from "./layout";

export default class LayoutResizer {
  screenWidth = ref(0);
  screenHeight = ref(0);
  screenMinWidth = ref(0);
  screenMaxWidth = ref(0);
  layoutCompMap = reactive(new Map<string, LayoutCompMap>());
  currentLayoutStrategy = ref<LayoutStrategy>(LayoutStrategy.PRO_RIGHT);
  resizeObserver = ref<ResizeObserver | null>(null);
  observedElement = ref<HTMLElement | null>(null);
  resolutionRange = ref('');
  currentScreenResolutionMap = ref<ScreenResolutionMap[]>();

  constructor(
    private selectorName: string,
    layoutStrategy: LayoutStrategy,
    private screenResolutionMap: ScreenResolutionMap[]
  ) {
    this.currentLayoutStrategy.value = layoutStrategy;

    onMounted(() => {
      this.initializeObserver();
    });

    watch(this.currentLayoutStrategy, () => {
      if (this.observedElement.value) {
        this.updateLayout();
      }
    });

    onUnmounted(() => {
      this.cleanupObserver();
    });
  }

  /**
   * 初始化resize observer
   */
  private initializeObserver() {
    this.observedElement.value = document.querySelector(this.selectorName);
    if (this.observedElement.value) {
      this.resizeObserver.value = new ResizeObserver((entries) => {
        const entry = entries[0];
        const { width, height } = entry.contentRect;
        this.screenWidth.value = width;
        this.screenHeight.value = height;

        this.updateLayout();
      });
      this.resizeObserver.value.observe(this.observedElement.value);
    }
  }

  /**
   * 卸载resize observer
   */
  private cleanupObserver() {
    if (this.resizeObserver.value && this.observedElement.value) {
      this.resizeObserver.value.unobserve(this.observedElement.value);
      this.resizeObserver.value.disconnect();
      this.resizeObserver.value = null;
    }
  }

  /**
   * 更新布局
   */
  private updateLayout() {
    const compStyles = this.loadComponentWidthRange(this.currentLayoutStrategy.value, this.screenWidth.value);
    if (compStyles) {
      this.setComponentStyleByStrategy(compStyles);
    }
  }

  /**
   * 加载组件宽度区间
   * @param layoutStrategy 布局策略
   * @param screenWidth 屏幕宽度
   */
  private loadComponentWidthRange(layoutStrategy: LayoutStrategy, screenWidth: number): ComponentWidthRange[] {
    let layoutStyles: ComponentWidthRange[] | null = [];
    for (let item of this.screenResolutionMap) {
      if (item.layoutStrategy === layoutStrategy) {
        this.setDefaultStorage(item);
        layoutStyles = this.getComponentWidthRange(screenWidth, item.resolution);
        break;
      }
    }
    if (!layoutStyles || layoutStyles.length === 0) {
      layoutStyles = this.getComponentWidthRange(
        screenWidth,
        this.screenResolutionMap[0].resolution
      ) as ComponentWidthRange[];
    }
    return layoutStyles;
  }

  /**
   * 设置默认缓存
   * @param layout 
   */
  private setDefaultStorage(layout: ScreenResolutionMap) {
    if (!localStorage.getItem(layout.layoutStrategy)) {
      let layoutStorage = new Map();
      for (let i in layout.resolution) {
        const resolutionItem = layout.resolution[i].map(item => {
          return Object.assign(item, {
            moved: false,
            static: true,
          });
        });
        layoutStorage.set(i, resolutionItem);
      }
      if (layoutStorage.size > 0) {
        localStorage.setItem(layout.layoutStrategy, JSON.stringify(Object.fromEntries(layoutStorage)));
      }
    }
  }

  /**
   * 获取组件宽度区间
   * @param screenWidth
   * @param resolution
   */
  private getComponentWidthRange(screenWidth: number, resolution: Resolution): ComponentWidthRange[] | null {
    for (const resolutionRange in resolution) {
      const [minWidth, maxWidth] = JSON.parse(resolutionRange.replace("[", "[").replace("]", "]"));
      if (screenWidth >= minWidth && screenWidth <= maxWidth) {
        this.screenMinWidth.value = minWidth;
        this.screenMaxWidth.value = maxWidth;
        return resolution[resolutionRange];
      }
    }
    return null;
  }

  /**
   * 根据布局策略设置组件样式
   * @param compStyles
   */
  private setComponentStyleByStrategy(compStyles: ComponentWidthRange[]) {
    this.layoutCompMap.clear();
    compStyles.forEach((item: ComponentWidthRange) => {
      const compPosition = this.getRelativePosition(item, this.screenWidth.value);
      this.layoutCompMap.set(item.compName, {
        compName: item.compName,
        layoutStyle: {
          position: "absolute",
          left: `${compPosition.x}%`,
          top: `${item.y}px`,
          width: `${compPosition.width}%`,
          height: `${item.height}px`,
          transition: "all 0.15s ease-out",
          overflow: 'hidden',
          zIndex: item.zIndex,
          minWidth: `${item.minWidth}px`,
          minHeight: `${item.minHeight}px`,
        },
        fixed: item.fixed,
        show: item.show,
      });
    });
  }

  /**
   * 计算组件相对位置和大小的函数
   * @param compStyles - 组件的样式信息
   * @param screenWidth - 屏幕宽度
   * @returns 组件的计算位置和大小
   */
  private getRelativePosition(compStyles: ComponentWidthRange, screenWidth: number): { x: string; width: string; } {
    const { x, width } = compStyles;

    /**
     * 解析区间值
     * @param value
     */
    const parseRange = (value: Coordinate): { min: number; max: number; } => {
      if (Array.isArray(value)) {
        const [min, max] = value;
        return { min, max };
      }
      return { min: value, max: value };
    };

    /**
     * 转换为基于屏幕宽度的百分比
     * @param range
     * @param screenWidth
     */
    const toPercentage = (
      range: { min: number; max: number; },
      screenWidth: number
    ): { minPercentage: number; maxPercentage: number; } => {
      const minPercentage = (range.min / screenWidth) * 100;
      const maxPercentage = (range.max / screenWidth) * 100;
      return { minPercentage, maxPercentage };
    };

    /**
     * 计算在当前屏幕宽度下的具体值
     * @param range
     * @param screenWidth
     * @param screenMinWidth
     * @param screenMaxWidth
     */
    const calculateValue = (range: { min: number; max: number; }, screenWidth: number): number => {
      const screenRange = this.screenMaxWidth.value - this.screenMinWidth.value;
      const valueRange = range.max - range.min;
      const normalizedScreenWidth = screenWidth - this.screenMinWidth.value;
      return range.min + (valueRange * normalizedScreenWidth) / screenRange;
    };

    //* 解析并计算宽度和x值
    const widthRange = parseRange(width);
    const xRange = parseRange(x);

    const calculatedWidth = calculateValue(widthRange, screenWidth);
    const calculatedX = calculateValue(xRange, screenWidth);

    //* 转换为百分比
    const widthPercentage = toPercentage(
      { min: Math.round(calculatedWidth), max: Math.round(calculatedWidth) },
      screenWidth
    );
    const xPercentage = toPercentage({ min: Math.round(calculatedX), max: Math.round(calculatedX) }, screenWidth);
    return {
      x: (xPercentage.minPercentage).toFixed(4),
      width: (widthPercentage.minPercentage).toFixed(4),
    };
  }
}
