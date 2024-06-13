/*
 * @Author: 田鑫
 * @Date: 2024-06-12 10:17:44
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-06-13 14:52:27
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
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  height: string;
  transition: string;
}

export interface ComponentState {
  id: string;
  comp: ReturnType<typeof defineComponent>;
  x: number | string;
  y: number | string;
  width?: number | string;
  minWidth?: number | string;
  maxWidth?: number | string;
  height: number;
  zIndex?: number | string;
  background?: string;
}

export type Coordinate = number | [number, number];

export type ComponentWidthRange = {
  width: [number, number];
  height: number;
  compName: string;
  background?: string;
  x: Coordinate;
  y: number;
};

// export type LayoutStrategy = 'strategy1' | 'strategy2' | 'strategy3';

export type Resolution = {
  [resolutionRange: string]: ComponentWidthRange[];
};

export type ScreenResolutionMap = {
  layoutStrategy: LayoutStrategy;
  resolution: Resolution;
};

export const screenResolutionMap: ScreenResolutionMap[] = [
  {
    layoutStrategy: LayoutStrategy.PRO_RIGHT,
    resolution: {
      '[0, 1023]': [
        { width: [768, 1023], compName: 'Header', height: 60, x: 0, y: 0 },
        { width: [498, 753], compName: 'ExchangeChart', height: 550, x: 266, y: 60 },
        { width: [498, 753], compName: 'ExchangeList', height: 306, x: 266, y: 610 },
        { width: [266, 266], compName: 'ExchangeInfo', height: 856, x: 0, y: 60 },
        { width: [768, 1023], compName: 'UserExchangeTable', height: 356, x: 0, y: 916 },
      ],
      '[1024, 1280]': [
        { width: [1024, 1280], compName: 'Header', height: 60, x: 0, y: 0 },
        { width: [484, 743], compName: 'ExchangeChart', height: 460, x: 532, y: 60 },
        { width: [266, 266], compName: 'ExchangeList', height: 460, x: 266, y: 60 },
        { width: [266, 266], compName: 'ExchangeInfo', height: 968, x: 0, y: 60 },
        { width: [760, 1011], compName: 'UserExchangeTable', height: 505, x: 266, y: 520 },
      ],
      '[1281, 1440]': [
        { width: [1281, 1440], compName: 'Header', height: 60, x: 0, y: 0 },
        { width: [738, 836], compName: 'ExchangeChart', height: 610, x: 0, y: 60 },
        { width: [266, 300], compName: 'ExchangeList', height: 610, x: [738, 836], y: 60 },
        { width: [266, 300], compName: 'ExchangeInfo', height: 968, x: [1004, 1136], y: 60 },
        { width: [1012, 1138], compName: 'UserExchangeTable', height: 356, x: 0, y: 670 },
      ],
      '[1441, 1920]': [
        { width: [1441, 1920], compName: 'Header', height: 60, x: 0, y: 0 },
        { width: [836, 1196], compName: 'ExchangeChart', height: 610, x: 0, y: 60 },
        { width: [300, 360], compName: 'ExchangeList', height: 610, x: [836, 1196], y: 60 },
        { width: [300, 360], compName: 'ExchangeInfo', height: 968, x: [1136, 1556], y: 60 },
        { width: [1138, 1558], compName: 'UserExchangeTable', height: 356, x: 0, y: 670 },
      ],
      '[1921, 2560]': [
        { width: [1921, 2560], compName: 'Header', height: 60, x: 0, y: 0 },
        { width: [1196, 1696], compName: 'ExchangeChart', height: 610, x: 0, y: 60 },
        { width: [360, 430], compName: 'ExchangeList', height: 610, x: [1196, 1696], y: 60 },
        { width: [360, 430], compName: 'ExchangeInfo', height: 968, x: [1556, 2126], y: 60 },
        { width: [1558, 2128], compName: 'UserExchangeTable', height: 356, x: 0, y: 670 },
      ],
    },
  },
  {
    layoutStrategy: LayoutStrategy.STANDARD,
    resolution: {
      '[0, 1023]': [
        { width: [768, 1023], compName: 'Header', height: 60, x: 0, y: 0 },
        { width: [498, 753], compName: 'ExchangeChart', height: 550, x: 266, y: 60 },
        { width: [498, 753], compName: 'ExchangeList', height: 306, x: 266, y: 610 },
        { width: [266, 266], compName: 'ExchangeInfo', height: 856, x: 0, y: 60 },
        { width: [768, 1023], compName: 'UserExchangeTable', height: 356, x: 0, y: 916 },
      ],
      '[1024, 1280]': [
        { width: [1024, 1280], compName: 'Header', height: 60, x: 0, y: 0 },
        { width: [484, 743], compName: 'ExchangeChart', height: 460, x: 532, y: 60 },
        { width: [266, 266], compName: 'ExchangeList', height: 460, x: 266, y: 60 },
        { width: [266, 266], compName: 'ExchangeInfo', height: 968, x: 0, y: 60 },
        { width: [760, 1011], compName: 'UserExchangeTable', height: 505, x: 266, y: 520 },
      ],
      '[1281, 1440]': [
        { width: [1281, 1440], compName: 'Header', height: 60, x: 0, y: 0 },
        { width: [738, 836], compName: 'ExchangeChart', height: 610, x: [532, 600], y: 60 },
        { width: [266, 300], compName: 'ExchangeList', height: 610, x: [266, 300], y: 60 },
        { width: [266, 300], compName: 'ExchangeInfo', height: 968, x: 0, y: 60 },
        { width: [1012, 1138], compName: 'UserExchangeTable', height: 356, x: [266, 300], y: 670 },
      ],
      '[1441, 1920]': [
        { width: [1441, 1920], compName: 'Header', height: 60, x: 0, y: 0 },
        { width: [836, 1196], compName: 'ExchangeChart', height: 610, x: [600, 720], y: 60 },
        { width: [300, 360], compName: 'ExchangeList', height: 610, x: [300, 360], y: 60 },
        { width: [300, 360], compName: 'ExchangeInfo', height: 968, x: 0, y: 60 },
        { width: [1138, 1558], compName: 'UserExchangeTable', height: 356, x: [300, 360], y: 670 },
      ],
      '[1921, 2560]': [
        { width: [1921, 2560], compName: 'Header', height: 60, x: 0, y: 0 },
        { width: [1196, 1696], compName: 'ExchangeChart', height: 610, x: [720, 860], y: 60 },
        { width: [360, 430], compName: 'ExchangeList', height: 610, x: [360, 430], y: 60 },
        { width: [360, 430], compName: 'ExchangeInfo', height: 968, x: 0, y: 60 },
        { width: [1558, 2128], compName: 'UserExchangeTable', height: 356, x: [360, 430], y: 670 },
      ],
    },
  },
  {
    layoutStrategy: LayoutStrategy.PRO_LEFT,
    resolution: {
      '[0, 1023]': [
        { width: [768, 1023], compName: 'Header', height: 60, x: 0, y: 0 },
        { width: [498, 753], compName: 'ExchangeChart', height: 550, x: 266, y: 60 },
        { width: [498, 753], compName: 'ExchangeList', height: 306, x: 266, y: 610 },
        { width: [266, 266], compName: 'ExchangeInfo', height: 856, x: 0, y: 60 },
        { width: [768, 1023], compName: 'UserExchangeTable', height: 356, x: 0, y: 916 },
      ],
      '[1024, 1280]': [
        { width: [1024, 1280], compName: 'Header', height: 60, x: 0, y: 0 },
        { width: [484, 743], compName: 'ExchangeChart', height: 460, x: 532, y: 60 },
        { width: [266, 266], compName: 'ExchangeList', height: 460, x: 266, y: 60 },
        { width: [266, 266], compName: 'ExchangeInfo', height: 968, x: 0, y: 60 },
        { width: [760, 1011], compName: 'UserExchangeTable', height: 505, x: 266, y: 520 },
      ],
      '[1281, 1440]': [
        { width: [1281, 1440], compName: 'Header', height: 60, x: 0, y: 0 },
        { width: [738, 836], compName: 'ExchangeChart', height: 610, x: [532, 600], y: 60 },
        { width: [266, 300], compName: 'ExchangeList', height: 610, x: [266, 300], y: 60 },
        { width: [266, 300], compName: 'ExchangeInfo', height: 968, x: 0, y: 60 },
        { width: [1012, 1138], compName: 'UserExchangeTable', height: 356, x: [266, 300], y: 670 },
      ],
      '[1441, 1920]': [
        { width: [1441, 1920], compName: 'Header', height: 60, x: 0, y: 0 },
        { width: [836, 1196], compName: 'ExchangeChart', height: 610, x: [600, 720], y: 60 },
        { width: [300, 360], compName: 'ExchangeList', height: 610, x: [300, 360], y: 60 },
        { width: [300, 360], compName: 'ExchangeInfo', height: 968, x: 0, y: 60 },
        { width: [1138, 1558], compName: 'UserExchangeTable', height: 356, x: [300, 360], y: 670 },
      ],
      '[1921, 2560]': [
        { width: [1921, 2560], compName: 'Header', height: 60, x: 0, y: 0 },
        { width: [1196, 1696], compName: 'ExchangeChart', height: 610, x: [720, 860], y: 60 },
        { width: [360, 430], compName: 'ExchangeList', height: 610, x: [360, 430], y: 60 },
        { width: [360, 430], compName: 'ExchangeInfo', height: 968, x: 0, y: 60 },
        { width: [1558, 2128], compName: 'UserExchangeTable', height: 356, x: [360, 430], y: 670 },
      ],
    },
  },
];
