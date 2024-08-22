/*
 * @Author: 田鑫
 * @Date: 2024-08-15 17:30:53
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-08-15 17:42:22
 * @Description:
 */

import { LayoutStrategy, ScreenResolutionMap } from "./layout";

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
				{ width: [511, 746], compName: "ExchangeChart", height: 610, x: [513, 534], y: 64, zIndex: "1", fixed: true, show: true },
				{ width: [255, 265], compName: "ExchangeList", height: 610, x: [256, 267], y: 64, zIndex: "1", fixed: true, show: true },
				{ width: [254, 265], compName: "ExchangeInfo", height: 1168, x: 0, y: 64, zIndex: "1", fixed: true, show: true },
				{ width: [768, 1013], compName: "UserExchangeTable", height: 556, x: [256, 267], y: 676, zIndex: "1", fixed: true, show: true },
			],
			"[1281, 1440]": [
				{ width: [1281, 1440], compName: "Header", height: 60, x: 0, y: 2, zIndex: "2", fixed: true, show: true },
				{ width: [746, 839], compName: "ExchangeChart", height: 610, x: 0, y: 64, zIndex: "1", fixed: false, show: true, minW: 8, minHeight: 40 },
				{ width: [265, 299], compName: "ExchangeList", height: 610, x: [748, 841], y: 64, zIndex: "1", fixed: false, show: true, minW: 4, minHeight: 307 },
				{ width: [265, 298], compName: "ExchangeInfo", height: 1171, x: [1015, 1142], y: 64, zIndex: "1", fixed: false, show: true, minW: 4, minHeight: 52 },
				{ width: [1013, 1140], compName: "UserExchangeTable", height: 559, x: 0, y: 676, zIndex: "1", fixed: false, show: true, minW: 10, minHeight: 40 },
			],
			"[1441, 1920]": [
				{ width: [1441, 1920], compName: "Header", height: 60, x: 0, y: 2, zIndex: "2", fixed: true, show: true },
				{ width: [839, 1278], compName: "ExchangeChart", height: 610, x: 0, y: 64, zIndex: "1", fixed: false, show: true, minW: 7, minHeight: 40 },
				{ width: [299, 319], compName: "ExchangeList", height: 610, x: [841, 1280], y: 64, zIndex: "1", fixed: false, show: true, minW: 3, minHeight: 307 },
				{ width: [298, 318], compName: "ExchangeInfo", height: 1171, x: [1142, 1601], y: 64, zIndex: "1", fixed: false, show: true, minW: 3, minHeight: 52 },
				{ width: [1140, 1600], compName: "UserExchangeTable", height: 559, x: 0, y: 676, zIndex: "1", fixed: false, show: true, minW: 7, minHeight: 40 },
			],
			"[1921, 2560]": [
				{ width: [1921, 2560], compName: "Header", height: 60, x: 0, y: 2, zIndex: "2", fixed: true, show: true },
				{ width: [1278, 1706], compName: "ExchangeChart", height: 610, x: 0, y: 64, zIndex: "1", fixed: false, show: true, minW: 6, minHeight: 40 },
				{ width: [319, 425], compName: "ExchangeList", height: 610, x: [1280, 1708], y: 64, zIndex: "1", fixed: false, show: true, minW: 3, minHeight: 307 },
				{ width: [318, 425], compName: "ExchangeInfo", height: 1171, x: [1601, 2135], y: 64, zIndex: "1", fixed: false, show: true, minW: 3, minHeight: 52 },
				{ width: [1600, 2133], compName: "UserExchangeTable", height: 559, x: 0, y: 676, zIndex: "1", fixed: false, show: true, minW: 7, minHeight: 40 },
			],
			"[2561, 3840]": [
				{ width: [2561, 3840], compName: "Header", height: 60, x: 0, y: 2, zIndex: "2", fixed: true, show: true },
				{ width: [1706, 2559], compName: "ExchangeChart", height: 610, x: 0, y: 64, zIndex: "1", fixed: false, show: true, minW: 6, minHeight: 40 },
				{ width: [425, 639], compName: "ExchangeList", height: 610, x: [1708, 2561], y: 64, zIndex: "1", fixed: false, show: true, minW: 2, minHeight: 307 },
				{ width: [425, 638], compName: "ExchangeInfo", height: 1888, x: [2135, 3202], y: 64, zIndex: "1", fixed: false, show: true, minW: 2, minHeight: 52 },
				{ width: [2133, 3200], compName: "UserExchangeTable", height: 1275, x: 0, y: 677, zIndex: "1", fixed: false, show: true, minW: 7, minHeight: 40 },
			],
		},
	},
	{
		layoutStrategy: LayoutStrategy.PRO_LEFT,
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
				{ width: [511, 746], compName: "ExchangeChart", height: 610, x: [513, 534], y: 64, zIndex: "1", fixed: true, show: true },
				{ width: [255, 265], compName: "ExchangeList", height: 610, x: [256, 267], y: 64, zIndex: "1", fixed: true, show: true },
				{ width: [254, 265], compName: "ExchangeInfo", height: 1168, x: 0, y: 64, zIndex: "1", fixed: true, show: true },
				{ width: [768, 1013], compName: "UserExchangeTable", height: 556, x: [256, 267], y: 676, zIndex: "1", fixed: true, show: true },
			],
			"[1281, 1440]": [
				{ width: [1281, 1440], compName: "Header", height: 60, x: 0, y: 2, zIndex: "2", fixed: true, show: true },
				{ width: [746, 839], compName: "ExchangeChart", height: 610, x: [534, 601], y: 64, zIndex: "1", fixed: false, show: true, minW: 8, minHeight: 40 },
				{ width: [265, 299], compName: "ExchangeList", height: 610, x: [267, 300], y: 64, zIndex: "1", fixed: false, show: true, minW: 4, minHeight: 307 },
				{ width: [265, 298], compName: "ExchangeInfo", height: 1171, x: 0, y: 64, zIndex: "1", fixed: false, show: true, minW: 4, minHeight: 52 },
				{ width: [1013, 1140], compName: "UserExchangeTable", height: 559, x: [267, 300], y: 676, zIndex: "1", fixed: false, show: true, minW: 10, minHeight: 40 },
			],
			"[1441, 1920]": [
				{ width: [1441, 1920], compName: "Header", height: 60, x: 0, y: 2, zIndex: "2", fixed: true, show: true },
				{ width: [839, 1278], compName: "ExchangeChart", height: 610, x: [601, 641], y: 64, zIndex: "1", fixed: false, show: true, minW: 7, minHeight: 40 },
				{ width: [299, 319], compName: "ExchangeList", height: 610, x: [300, 320], y: 64, zIndex: "1", fixed: false, show: true, minW: 3, minHeight: 307 },
				{ width: [298, 318], compName: "ExchangeInfo", height: 1171, x: 0, y: 64, zIndex: "1", fixed: false, show: true, minW: 3, minHeight: 52 },
				{ width: [1140, 1600], compName: "UserExchangeTable", height: 559, x: [300, 320], y: 676, zIndex: "1", fixed: false, show: true, minW: 7, minHeight: 40 },
			],
			"[1921, 2560]": [
				{ width: [1921, 2560], compName: "Header", height: 60, x: 0, y: 2, zIndex: "2", fixed: true, show: true },
				{ width: [1278, 1706], compName: "ExchangeChart", height: 610, x: [641, 854], y: 64, zIndex: "1", fixed: false, show: true, minW: 6, minHeight: 40 },
				{ width: [319, 425], compName: "ExchangeList", height: 610, x: [320, 427], y: 64, zIndex: "1", fixed: false, show: true, minW: 2, minHeight: 307 },
				{ width: [318, 425], compName: "ExchangeInfo", height: 1171, x: 0, y: 64, zIndex: "1", fixed: false, show: true, minW: 2, minHeight: 52 },
				{ width: [1600, 2133], compName: "UserExchangeTable", height: 559, x: [320, 427], y: 676, zIndex: "1", fixed: false, show: true, minW: 7, minHeight: 40 },
			],
			"[2561, 3840]": [
				{ width: [2561, 3840], compName: "Header", height: 60, x: 0, y: 2, zIndex: "2", fixed: true, show: true },
				{ width: [1706, 2559], compName: "ExchangeChart", height: 610, x: [854, 1281], y: 64, zIndex: "1", fixed: false, show: true, minW: 6, minHeight: 40 },
				{ width: [425, 639], compName: "ExchangeList", height: 610, x: [427, 640], y: 64, zIndex: "1", fixed: false, show: true, minW: 2, minHeight: 307 },
				{ width: [425, 638], compName: "ExchangeInfo", height: 1888, x: 0, y: 64, zIndex: "1", fixed: false, show: true, minW: 2, minHeight: 52 },
				{ width: [2133, 3200], compName: "UserExchangeTable", height: 1275, x: [427, 640], y: 674, zIndex: "1", fixed: false, show: true, minW: 7, minHeight: 40 },
			],
		},
	},
];
