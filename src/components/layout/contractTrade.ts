/*
 * @Author: 田鑫
 * @Date: 2024-06-13 16:09:47
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-06-25 18:13:23
 * @Description: 
 */

import { LayoutStrategy, ScreenResolutionMap } from "./layout";

import { shallowRef } from "vue";
import Header from "./comp1.vue";
import ExchangeChart from "./comp2.vue";
import ExchangeList from "./comp3.vue";
import ExchangeInfo from "./comp4.vue";
import UserExchangeTable from "./comp5.vue";
import CompSub1 from "./compSub1.vue";
import CompSub2 from "./compSub2.vue";

export const contractTradeLayout: ScreenResolutionMap[] = [
  {
    layoutStrategy: LayoutStrategy.PRO_RIGHT,
    resolution: {
      '[768, 1023]': [
        { width: [768, 1023], compName: 'Header', comp: shallowRef(Header), height: 60, x: 0, y: 0, zIndex: '2', fixed: true, show: true },
        { width: [498, 753], compName: 'ExchangeChart', comp: shallowRef(ExchangeChart), height: 550, x: 266, y: 60, zIndex: '3', fixed: false, show: true },
        { width: [498, 753], compName: 'ExchangeList', comp: shallowRef(ExchangeList), height: 306, x: 266, y: 610, zIndex: '3', fixed: false, show: true },
        { width: [266, 266], compName: 'ExchangeInfo', comp: shallowRef(ExchangeInfo), height: 856, x: 0, y: 60, zIndex: '3', fixed: false, show: true },
        { width: [768, 1023], compName: 'UserExchangeTable', comp: shallowRef(UserExchangeTable), height: 356, x: 0, y: 916, zIndex: '3', fixed: false, show: true },
      ],
      '[1024, 1280]': [
        { width: [1024, 1280], compName: 'Header', comp: shallowRef(Header), height: 60, x: 0, y: 0, zIndex: '2', fixed: true, show: true },
        { width: [484, 743], compName: 'ExchangeChart', comp: shallowRef(ExchangeChart), height: 460, x: 532, y: 60, zIndex: '3', fixed: false, show: true },
        { width: [266, 266], compName: 'ExchangeList', comp: shallowRef(ExchangeList), height: 460, x: 266, y: 60, zIndex: '3', fixed: false, show: true },
        { width: [266, 266], compName: 'ExchangeInfo', comp: shallowRef(ExchangeInfo), height: 968, x: 0, y: 60, zIndex: '3', fixed: false, show: true },
        { width: [760, 1011], compName: 'UserExchangeTable', comp: shallowRef(UserExchangeTable), height: 505, x: 266, y: 520, zIndex: '3', fixed: false, show: true },
      ],
      '[1281, 1440]': [
        { width: [1281, 1440], compName: 'Header', comp: shallowRef(Header), height: 60, x: 0, y: 0, zIndex: '2', fixed: true, show: true },
        { width: [738, 836], compName: 'ExchangeChart', comp: shallowRef(ExchangeChart), height: 610, x: 0, y: 60, zIndex: '3', fixed: false, show: true },
        { width: [266, 300], compName: 'ExchangeList', comp: shallowRef(ExchangeList), height: 610, x: [738, 836], y: 60, zIndex: '3', fixed: false, show: true },
        { width: [266, 300], compName: 'ExchangeInfo', comp: shallowRef(ExchangeInfo), height: 968, x: [1004, 1136], y: 60, zIndex: '3', fixed: false, show: true },
        { width: [1012, 1138], compName: 'UserExchangeTable', comp: shallowRef(UserExchangeTable), height: 356, x: 0, y: 670, zIndex: '3', fixed: false, show: true },
      ],
      '[1441, 1920]': [
        { width: [1441, 1920], compName: 'Header', comp: shallowRef(Header), height: 60, x: 0, y: 0, zIndex: '2', fixed: true, show: true },
        { width: [836, 1196], compName: 'ExchangeChart', comp: shallowRef(ExchangeChart), height: 610, x: 0, y: 60, zIndex: '3', fixed: false, show: true },
        { width: [300, 360], compName: 'ExchangeList', comp: shallowRef(ExchangeList), height: 610, x: [836, 1196], y: 60, zIndex: '3', fixed: false, show: true },
        { width: [300, 360], compName: 'ExchangeInfo', comp: shallowRef(ExchangeInfo), height: 968, x: [1136, 1556], y: 60, zIndex: '3', fixed: false, show: true },
        { width: [1138, 1558], compName: 'UserExchangeTable', comp: shallowRef(UserExchangeTable), height: 356, x: 0, y: 670, zIndex: '3', fixed: false, show: true },
      ],
      '[1921, 2560]': [
        { width: [1921, 2560], compName: 'Header', comp: shallowRef(Header), height: 60, x: 0, y: 0, zIndex: '2', fixed: true, show: true },
        { width: [1196, 1696], compName: 'ExchangeChart', comp: shallowRef(ExchangeChart), height: 610, x: 0, y: 60, zIndex: '3', fixed: false, show: true },
        { width: [360, 430], compName: 'ExchangeList', comp: shallowRef(ExchangeList), height: 610, x: [1196, 1696], y: 60, zIndex: '3', fixed: false, show: true },
        { width: [360, 430], compName: 'ExchangeInfo', comp: shallowRef(ExchangeInfo), height: 968, x: [1556, 2126], y: 60, zIndex: '3', fixed: false, show: true },
        { width: [1558, 2128], compName: 'UserExchangeTable', comp: shallowRef(UserExchangeTable), height: 356, x: 0, y: 670, zIndex: '3', fixed: false, show: true },
      ],
    },
  },
  {
    layoutStrategy: LayoutStrategy.STANDARD,
    resolution: {
      '[768, 1023]': [
        { width: [768, 1023], compName: 'Header', comp: shallowRef(Header), height: 60, x: 0, y: 0, zIndex: '2', fixed: true, show: true },
        { width: [498, 753], compName: 'ExchangeChart', comp: shallowRef(ExchangeChart), height: 550, x: 266, y: 60, zIndex: '3', fixed: false, show: true },
        { width: [249, 376.5], compName: 'CompSub1', comp: shallowRef(CompSub1), height: 306, x: 266, y: 610, zIndex: '3', fixed: false, show: true },
        { width: [249, 376.5], compName: 'CompSub2', comp: shallowRef(CompSub2), height: 306, x: [515, 624.5], y: 610, zIndex: '3', fixed: false, show: true },
        { width: [266, 266], compName: 'ExchangeInfo', comp: shallowRef(ExchangeInfo), height: 856, x: 0, y: 60, zIndex: '3', fixed: false, show: true },
        { width: [768, 1023], compName: 'UserExchangeTable', comp: shallowRef(UserExchangeTable), height: 356, x: 0, y: 916, zIndex: '3', fixed: false, show: true },
      ],
      '[1024, 1280]': [
        { width: [1024, 1280], compName: 'Header', comp: shallowRef(Header), height: 60, x: 0, y: 0, zIndex: '2', fixed: true, show: true },
        { width: [484, 743], compName: 'ExchangeChart', comp: shallowRef(ExchangeChart), height: 460, x: 532, y: 60, zIndex: '3', fixed: false, show: true },
        { width: [266, 266], compName: 'ExchangeList', comp: shallowRef(ExchangeList), height: 460, x: 266, y: 60, zIndex: '3', fixed: false, show: true },
        { width: [266, 266], compName: 'ExchangeInfo', comp: shallowRef(ExchangeInfo), height: 968, x: 0, y: 60, zIndex: '3', fixed: false, show: true },
        { width: [760, 1011], compName: 'UserExchangeTable', comp: shallowRef(UserExchangeTable), height: 505, x: 266, y: 520, zIndex: '3', fixed: false, show: true },
      ],
      '[1281, 1440]': [
        { width: [1281, 1440], compName: 'Header', comp: shallowRef(Header), height: 60, x: 0, y: 0, zIndex: '2', fixed: true, show: true },
        { width: [738, 836], compName: 'ExchangeChart', comp: shallowRef(ExchangeChart), height: 610, x: 0, y: 60, zIndex: '3', fixed: false, show: true },
        { width: [266, 300], compName: 'ExchangeList', comp: shallowRef(ExchangeList), height: 610, x: [738, 836], y: 60, zIndex: '3', fixed: false, show: true },
        { width: [266, 300], compName: 'ExchangeInfo', comp: shallowRef(ExchangeInfo), height: 968, x: [1004, 1136], y: 60, zIndex: '3', fixed: false, show: true },
        { width: [1012, 1138], compName: 'UserExchangeTable', comp: shallowRef(UserExchangeTable), height: 356, x: 0, y: 670, zIndex: '3', fixed: false, show: true },
      ],
      '[1441, 1920]': [
        { width: [1441, 1920], compName: 'Header', comp: shallowRef(Header), height: 60, x: 0, y: 0, zIndex: '2', fixed: true, show: true },
        { width: [836, 1196], compName: 'ExchangeChart', comp: shallowRef(ExchangeChart), height: 610, x: 0, y: 60, zIndex: '3', fixed: false, show: true },
        { width: [300, 360], compName: 'ExchangeList', comp: shallowRef(ExchangeList), height: 610, x: [836, 1196], y: 60, zIndex: '3', fixed: false, show: true },
        { width: [300, 360], compName: 'ExchangeInfo', comp: shallowRef(ExchangeInfo), height: 968, x: [1136, 1556], y: 60, zIndex: '3', fixed: false, show: true },
        { width: [1138, 1558], compName: 'UserExchangeTable', comp: shallowRef(UserExchangeTable), height: 356, x: 0, y: 670, zIndex: '3', fixed: false, show: true },
      ],
      '[1921, 2560]': [
        { width: [1921, 2560], compName: 'Header', comp: shallowRef(Header), height: 60, x: 0, y: 0, zIndex: '2', fixed: true, show: true },
        { width: [1196, 1696], compName: 'ExchangeChart', comp: shallowRef(ExchangeChart), height: 610, x: 0, y: 60, zIndex: '3', fixed: false, show: true },
        { width: [360, 430], compName: 'ExchangeList', comp: shallowRef(ExchangeList), height: 610, x: [1196, 1696], y: 60, zIndex: '3', fixed: false, show: true },
        { width: [360, 430], compName: 'ExchangeInfo', comp: shallowRef(ExchangeInfo), height: 968, x: [1556, 2126], y: 60, zIndex: '3', fixed: false, show: true },
        { width: [1558, 2128], compName: 'UserExchangeTable', comp: shallowRef(UserExchangeTable), height: 356, x: 0, y: 670, zIndex: '3', fixed: false, show: true },
      ],
    },
  },
  {
    layoutStrategy: LayoutStrategy.PRO_LEFT,
    resolution: {
      '[768, 1023]': [
        { width: [768, 1023], compName: 'Header', comp: shallowRef(Header), height: 60, x: 0, y: 0, zIndex: '2', fixed: false, show: true },
        { width: [498, 753], compName: 'ExchangeChart', comp: shallowRef(ExchangeChart), height: 550, x: 266, y: 60, zIndex: '3', fixed: false, show: true },
        { width: [498, 753], compName: 'ExchangeList', comp: shallowRef(ExchangeList), height: 306, x: 266, y: 610, zIndex: '3', fixed: false, show: true },
        { width: [266, 266], compName: 'ExchangeInfo', comp: shallowRef(ExchangeInfo), height: 856, x: 0, y: 60, zIndex: '3', fixed: false, show: true },
        { width: [768, 1023], compName: 'UserExchangeTable', comp: shallowRef(UserExchangeTable), height: 356, x: 0, y: 916, zIndex: '3', fixed: false, show: true },
      ],
      '[1024, 1280]': [
        { width: [1024, 1280], compName: 'Header', comp: shallowRef(Header), height: 60, x: 0, y: 0, zIndex: '2', fixed: false, show: true },
        { width: [484, 743], compName: 'ExchangeChart', comp: shallowRef(ExchangeChart), height: 460, x: 532, y: 60, zIndex: '3', fixed: false, show: true },
        { width: [266, 266], compName: 'ExchangeList', comp: shallowRef(ExchangeList), height: 460, x: 266, y: 60, zIndex: '3', fixed: false, show: true },
        { width: [266, 266], compName: 'ExchangeInfo', comp: shallowRef(ExchangeInfo), height: 968, x: 0, y: 60, zIndex: '3', fixed: false, show: true },
        { width: [760, 1011], compName: 'UserExchangeTable', comp: shallowRef(UserExchangeTable), height: 505, x: 266, y: 520, zIndex: '3', fixed: false, show: true },
      ],
      '[1281, 1440]': [
        { width: [1281, 1440], compName: 'Header', comp: shallowRef(Header), height: 60, x: 0, y: 0, zIndex: '2', fixed: true, show: true },
        { width: [738, 836], compName: 'ExchangeChart', comp: shallowRef(ExchangeChart), height: 610, x: [532, 600], y: 60, zIndex: '3', fixed: false, show: true },
        { width: [266, 300], compName: 'ExchangeList', comp: shallowRef(ExchangeList), height: 610, x: [266, 300], y: 60, zIndex: '3', fixed: false, show: true },
        { width: [266, 300], compName: 'ExchangeInfo', comp: shallowRef(ExchangeInfo), height: 968, x: 0, y: 60, zIndex: '3', fixed: false, show: true },
        { width: [1012, 1138], compName: 'UserExchangeTable', comp: shallowRef(UserExchangeTable), height: 356, x: [266, 300], y: 670, zIndex: '3', fixed: false, show: true },
      ],
      '[1441, 1920]': [
        { width: [1441, 1920], compName: 'Header', comp: shallowRef(Header), height: 60, x: 0, y: 0, zIndex: '2', fixed: true, show: true },
        { width: [836, 1196], compName: 'ExchangeChart', comp: shallowRef(ExchangeChart), height: 610, x: [600, 720], y: 60, zIndex: '3', fixed: false, show: true },
        { width: [300, 360], compName: 'ExchangeList', comp: shallowRef(ExchangeList), height: 610, x: [300, 360], y: 60, zIndex: '3', fixed: false, show: true },
        { width: [300, 360], compName: 'ExchangeInfo', comp: shallowRef(ExchangeInfo), height: 968, x: 0, y: 60, zIndex: '3', fixed: false, show: true },
        { width: [1138, 1558], compName: 'UserExchangeTable', comp: shallowRef(UserExchangeTable), height: 356, x: [300, 360], y: 670, zIndex: '3', fixed: false, show: true },
      ],
      '[1921, 2560]': [
        { width: [1921, 2560], compName: 'Header', comp: shallowRef(Header), height: 60, x: 0, y: 0, zIndex: '2', fixed: true, show: true },
        { width: [1196, 1696], compName: 'ExchangeChart', comp: shallowRef(ExchangeChart), height: 610, x: [720, 860], y: 60, zIndex: '3', fixed: false, show: true },
        { width: [360, 430], compName: 'ExchangeList', comp: shallowRef(ExchangeList), height: 610, x: [360, 430], y: 60, zIndex: '3', fixed: false, show: true },
        { width: [360, 430], compName: 'ExchangeInfo', comp: shallowRef(ExchangeInfo), height: 968, x: 0, y: 60, zIndex: '3', fixed: false, show: true },
        { width: [1558, 2128], compName: 'UserExchangeTable', comp: shallowRef(UserExchangeTable), height: 356, x: [360, 430], y: 670, zIndex: '3', fixed: false, show: true },
      ],
    },
  },
];