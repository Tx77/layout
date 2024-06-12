/*
 * @Author: 田鑫
 * @Date: 2024-06-12 10:17:44
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-06-12 18:08:21
 * @Description:
 */

import { defineComponent } from "vue";

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
  width: [number, number] | string;
  height: number;
  compName: string;
  background?: string;
  x: Coordinate;
  y: number;
};

export type LayoutStrategy = 'strategy1' | 'strategy2' | 'strategy3';

export type Resolution = {
  [resolutionRange: string]: ComponentWidthRange[];
};

export type ScreenResolutionMap = {
  layoutStrategy: LayoutStrategy;
  resolution: Resolution;
};

export const screenResolutionMap: ScreenResolutionMap[] = [
  {
    layoutStrategy: 'strategy1',
    resolution: {
      '[0, 1023]': [
        { width: [768, 1023], compName: 'Header', height: 60, x: 0, y: 0 },
        { width: [498, 753], compName: 'ExchangeChart', height: 550, x: 266, y: 60 },
        { width: [498, 753], compName: 'ExchangeList', height: 306, x: 266, y: 610 },
        { width: [266, 266], compName: 'ExchangeInfo', height: 856, x: 0, y: 60 },
        { width: [768, 1023], compName: 'UserExchangeTable', height: 356, x: 0, y: 856 },
      ],
      '[1024, 1280]': [
        { width: [1024, 1280], compName: 'Header', height: 60, x: 0, y: 0 },
        { width: [484, 743], compName: 'ExchangeChart', height: 460, x: 0, y: 60 },
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
      //* 0.9281 2376px

      //* x+y+z = 0.072
      //* screenWidth*(0.6225 + x) + screenWidth*(0.1874+y) + screenWidth*(0.1874+z) >= screenWidth
      //* screenWidth*[0.6225 - 0.6625] + screenWidth*[0.1874 - 0.1679] + screenWidth*0.1874 >= screenWidth
      //* screenWidth*(0.6225+x) + screenWidth*(0.1874+x)+screenWidth*0.1874 >= screenWidth
      //* screenWidth*(0.6225+0.072) + screenWidth*(0.1874+0.072)+screenWidth*0.1874 >= screenWidth
      '[1921, 2560]': [
        { width: [1921, 2560], compName: 'Header', height: 60, x: 0, y: 0 },
        //* 0.6225* Math.abs(0.6225 - 0.6625) = 0.0249
        //* 2560 - screenWidth*0.0249
        //* 0.6225 - 0.6625  1325
        { width: [1196, 1696], compName: 'ExchangeChart', height: 610, x: 0, y: 60 },
        //* 0.003
        //* 1696 - screenWidth*0.003
        //* 0.1874 - 0.1679  336
        { width: [360, 430], compName: 'ExchangeList', height: 610, x: [1196, 1696], y: 60 },
        //* 360
        //* 0.1874 - 0.1874 360
        { width: [360, 360], compName: 'ExchangeInfo', height: 968, x: [1556, 2126], y: 60 },
        //* 0.8110 - 0.8313 1663
        { width: [1558, 2128], compName: 'UserExchangeTable', height: 356, x: 0, y: 670 },
      ],
    },
  },
  {
    layoutStrategy: 'strategy2',
    resolution: {
      '[0, 768]': [
        { width: [200, 300], compName: 'comp1', height: 500, x: 0, y: 0 },
        { width: [300, 400], compName: 'comp2', height: 500, x: [200, 300], y: 0 },
        { width: [300, 400], compName: 'comp3', height: 970, x: [500, 700], y: 0 },
        { width: [300, 400], compName: 'comp4', height: 410, x: 0, y: 500 },
      ],
      '[769, 1280]': [
        { width: [200, 300], compName: 'comp1', height: 500, x: 0, y: 0 },
        { width: [300, 400], compName: 'comp2', height: 500, x: [200, 300], y: 0 },
        { width: [300, 400], compName: 'comp3', height: 970, x: [500, 700], y: 0 },
        { width: [300, 400], compName: 'comp4', height: 410, x: 0, y: 500 },
      ],
      '[1281, 1440]': [
        { width: [280, 400], compName: 'comp1', height: 600, x: 0, y: 0 },
        { width: [350, 450], compName: 'comp2', height: 500, x: [280, 400], y: 0 },
        { width: [350, 450], compName: 'comp3', height: 970, x: [630, 850], y: 0 },
        { width: [350, 450], compName: 'comp4', height: 410, x: 0, y: 600 },
      ],
      '[1441, 1920]': [
        { width: [320, 420], compName: 'comp1', height: 500, x: 0, y: 0 },
        { width: [400, 500], compName: 'comp2', height: 500, x: [320, 420], y: 0 },
        { width: [400, 500], compName: 'comp3', height: 970, x: [720, 920], y: 0 },
        { width: [400, 500], compName: 'comp4', height: 410, x: 0, y: 500 },
      ],
      '[1921, 3860]': [
        { width: [800, 1000], compName: 'comp1', height: 600, x: 0, y: 0 },
        { width: [500, 600], compName: 'comp2', height: 600, x: [800, 1000], y: 0 },
        { width: [500, 600], compName: 'comp3', height: 1070, x: [1300, 1600], y: 0 },
        { width: [500, 600], compName: 'comp4', height: 510, x: 0, y: 600 },
      ],
    },
  },
  {
    layoutStrategy: 'strategy3',
    resolution: {
      '[0, 768]': [
        { width: [200, 300], compName: 'comp1', height: 500, x: 0, y: 0 },
        { width: [300, 400], compName: 'comp2', height: 500, x: [200, 300], y: 0 },
        { width: [300, 400], compName: 'comp3', height: 970, x: [500, 700], y: 0 },
        { width: [300, 400], compName: 'comp4', height: 410, x: 0, y: 500 },
      ],
      '[769, 1280]': [
        { width: [200, 300], compName: 'comp1', height: 500, x: 0, y: 0 },
        { width: [300, 400], compName: 'comp2', height: 500, x: [200, 300], y: 0 },
        { width: [300, 400], compName: 'comp3', height: 970, x: [500, 700], y: 0 },
        { width: [300, 400], compName: 'comp4', height: 410, x: 0, y: 500 },
      ],
      '[1281, 1440]': [
        { width: [280, 400], compName: 'comp1', height: 600, x: 0, y: 0 },
        { width: [350, 450], compName: 'comp2', height: 500, x: [280, 400], y: 0 },
        { width: [350, 450], compName: 'comp3', height: 970, x: [630, 850], y: 0 },
        { width: [350, 450], compName: 'comp4', height: 410, x: 0, y: 600 },
      ],
      '[1441, 1920]': [
        { width: [320, 420], compName: 'comp1', height: 500, x: 0, y: 0 },
        { width: [400, 500], compName: 'comp2', height: 500, x: [320, 420], y: 0 },
        { width: [400, 500], compName: 'comp3', height: 970, x: [720, 920], y: 0 },
        { width: [400, 500], compName: 'comp4', height: 410, x: 0, y: 500 },
      ],
      '[1921, 3860]': [
        { width: [800, 1000], compName: 'comp1', height: 600, x: 0, y: 0 },
        { width: [500, 600], compName: 'comp2', height: 600, x: [800, 1000], y: 0 },
        { width: [500, 600], compName: 'comp3', height: 1070, x: [1300, 1600], y: 0 },
        { width: [500, 600], compName: 'comp4', height: 510, x: 0, y: 600 },
      ],
    },
  },
];
