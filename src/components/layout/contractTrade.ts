/*
 * @Author: 田鑫
 * @Date: 2024-06-13 16:09:47
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-07-11 10:09:49
 * @Description:
 */

import { LayoutStrategy, ScreenResolutionMap } from "./layout";

export const contractTradeLayout: ScreenResolutionMap[] = [
	{
		layoutStrategy: LayoutStrategy.PRO_RIGHT,
		resolution: {
			"[768, 1023]": [
				{ width: [768, 1023], compName: "Header", height: 60, x: 0, y: 0, zIndex: "2", fixed: true, show: true },
				{
					width: [500, 755],
					compName: "ExchangeChart",
					height: 550,
					x: 268,
					y: 62,
					zIndex: "3",
					fixed: false,
					show: true,
				},
				{
					width: [500, 755],
					compName: "ExchangeList",
					height: 306,
					x: 268,
					y: 614,
					zIndex: "3",
					fixed: false,
					show: true,
				},
				{
					width: [266, 266],
					compName: "ExchangeInfo",
					height: 858,
					x: 0,
					y: 62,
					zIndex: "3",
					fixed: false,
					show: true,
				},
				{
					width: [768, 1023],
					compName: "UserExchangeTable",
					height: 356,
					x: 0,
					y: 922,
					zIndex: "3",
					fixed: false,
					show: true,
				},
			],
			"[1024, 1280]": [
				{ width: [1024, 1280], compName: "Header", height: 60, x: 0, y: 0, zIndex: "2", fixed: true, show: true },
				{
					width: [484, 742],
					compName: "ExchangeChart",
					height: 461,
					x: 536,
					y: 62,
					zIndex: "3",
					fixed: false,
					show: true,
				},
				{
					width: [266, 266],
					compName: "ExchangeList",
					height: 461,
					x: 268,
					y: 62,
					zIndex: "3",
					fixed: false,
					show: true,
				},
				{
					width: [266, 266],
					compName: "ExchangeInfo",
					height: 968,
					x: 0,
					y: 62,
					zIndex: "3",
					fixed: false,
					show: true,
				},
				{
					width: [760, 1010],
					compName: "UserExchangeTable",
					height: 505,
					x: 268,
					y: 525,
					zIndex: "3",
					fixed: false,
					show: true,
				},
			],
			"[1281, 1440]": [
				{ width: [1281, 1440], compName: "Header", height: 60, x: 0, y: 0, zIndex: "2", fixed: true, show: true },
				{
					width: [746, 839],
					compName: "ExchangeChart",
					height: 610,
					x: 0,
					y: 62,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 8,
					minHeight: 60,
				},
				{
					width: [265, 299],
					compName: "ExchangeList",
					height: 610,
					x: [748, 841],
					y: 62,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 4,
					minHeight: 60,
				},
				{
					width: [265, 298],
					compName: "ExchangeInfo",
					height: 968,
					x: [1015, 1142],
					y: 62,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 4,
					minHeight: 60,
				},
				{
					width: [1013, 1140],
					compName: "UserExchangeTable",
					height: 356,
					x: 0,
					y: 674,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 10,
					minHeight: 60,
				},
			],
			"[1441, 1920]": [
				{ width: [1441, 1920], compName: "Header", height: 60, x: 0, y: 0, zIndex: "2", fixed: true, show: true },
				{
					width: [839, 1278],
					compName: "ExchangeChart",
					height: 610,
					x: 0,
					y: 62,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 7,
					minHeight: 60,
				},
				{
					width: [299, 319],
					compName: "ExchangeList",
					height: 610,
					x: [841, 1280],
					y: 62,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 3,
					minHeight: 60,
				},
				{
					width: [298, 318],
					compName: "ExchangeInfo",
					height: 968,
					x: [1142, 1601],
					y: 62,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 3,
					minHeight: 60,
				},
				{
					width: [1140, 1600],
					compName: "UserExchangeTable",
					height: 356,
					x: 0,
					y: 674,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 7,
					minHeight: 60,
				},
			],
			"[1921, 2560]": [
				{ width: [1921, 2560], compName: "Header", height: 60, x: 0, y: 0, zIndex: "2", fixed: true, show: true },
				{
					width: [1278, 1706],
					compName: "ExchangeChart",
					height: 610,
					x: 0,
					y: 62,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 6,
					minHeight: 60,
				},
				{
					width: [319, 425],
					compName: "ExchangeList",
					height: 610,
					x: [1280, 1708],
					y: 62,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 2,
					minHeight: 60,
				},
				{
					width: [318, 425],
					compName: "ExchangeInfo",
					height: 968,
					x: [1601, 2135],
					y: 62,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 2,
					minHeight: 60,
				},
				{
					width: [1600, 2133],
					compName: "UserExchangeTable",
					height: 356,
					x: 0,
					y: 674,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 7,
					minHeight: 60,
				},
			],
			"[2561, 3840]": [
				{ width: [2561, 3840], compName: "Header", height: 60, x: 0, y: 0, zIndex: "2", fixed: true, show: true },
				{
					width: [1706, 2559],
					compName: "ExchangeChart",
					height: 610,
					x: 0,
					y: 62,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 6,
					minHeight: 60,
				},
				{
					width: [425, 639],
					compName: "ExchangeList",
					height: 610,
					x: [1708, 2561],
					y: 62,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 2,
					minHeight: 60,
				},
				{
					width: [425, 638],
					compName: "ExchangeInfo",
					height: 968,
					x: [2135, 3202],
					y: 62,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 2,
					minHeight: 60,
				},
				{
					width: [2133, 3200],
					compName: "UserExchangeTable",
					height: 700,
					x: 0,
					y: 674,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 7,
					minHeight: 60,
				},
			],
		},
	},
	{
		layoutStrategy: LayoutStrategy.STANDARD,
		resolution: {
			"[768, 1023]": [
				{
					width: [768, 1023],
					compName: "Header",
					height: 60,
					x: 0,
					y: 0,
					zIndex: "2",
					fixed: true,
					show: true,
					minW: 240,
					minHeight: 60,
				},
				{
					width: [498, 753],
					compName: "ExchangeChart",
					height: 550,
					x: 266,
					y: 60,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
				{
					width: [266, 266],
					compName: "ExchangeList",
					height: 460,
					x: 266,
					y: 60,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
				{
					width: [266, 266],
					compName: "ExchangeInfo",
					height: 856,
					x: 0,
					y: 60,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
				{
					width: [768, 1023],
					compName: "UserExchangeTable",
					height: 356,
					x: 0,
					y: 916,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
			],
			"[1024, 1280]": [
				{
					width: [1024, 1280],
					compName: "Header",
					height: 60,
					x: 0,
					y: 0,
					zIndex: "2",
					fixed: true,
					show: true,
					minW: 240,
					minHeight: 60,
				},
				{
					width: [484, 743],
					compName: "ExchangeChart",
					height: 460,
					x: 532,
					y: 60,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
				{
					width: [266, 266],
					compName: "ExchangeList",
					height: 460,
					x: 266,
					y: 60,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
				{
					width: [266, 266],
					compName: "ExchangeInfo",
					height: 968,
					x: 0,
					y: 60,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
				{
					width: [760, 1011],
					compName: "UserExchangeTable",
					height: 505,
					x: 266,
					y: 520,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
			],
			"[1281, 1440]": [
				{
					width: [1281, 1440],
					compName: "Header",
					height: 60,
					x: 0,
					y: 0,
					zIndex: "2",
					fixed: true,
					show: true,
					minW: 240,
					minHeight: 60,
				},
				{
					width: [738, 836],
					compName: "ExchangeChart",
					height: 610,
					x: 0,
					y: 60,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
				{
					width: [266, 300],
					compName: "ExchangeList",
					height: 610,
					x: [738, 836],
					y: 60,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
				{
					width: [266, 300],
					compName: "ExchangeInfo",
					height: 968,
					x: [1004, 1136],
					y: 60,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
				{
					width: [1012, 1138],
					compName: "UserExchangeTable",
					height: 356,
					x: 0,
					y: 670,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
			],
			"[1441, 1920]": [
				{
					width: [1441, 1920],
					compName: "Header",
					height: 60,
					x: 0,
					y: 0,
					zIndex: "2",
					fixed: true,
					show: true,
					minW: 240,
					minHeight: 60,
				},
				{
					width: [836, 1196],
					compName: "ExchangeChart",
					height: 610,
					x: 0,
					y: 60,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
				{
					width: [300, 360],
					compName: "ExchangeList",
					height: 610,
					x: [836, 1196],
					y: 60,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
				{
					width: [300, 360],
					compName: "ExchangeInfo",
					height: 968,
					x: [1136, 1556],
					y: 60,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
				{
					width: [1138, 1558],
					compName: "UserExchangeTable",
					height: 356,
					x: 0,
					y: 670,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
			],
			"[1921, 2560]": [
				{
					width: [1921, 2560],
					compName: "Header",
					height: 60,
					x: 0,
					y: 0,
					zIndex: "2",
					fixed: true,
					show: true,
					minW: 240,
					minHeight: 60,
				},
				{
					width: [1196, 1696],
					compName: "ExchangeChart",
					height: 610,
					x: 0,
					y: 60,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
				{
					width: [360, 430],
					compName: "ExchangeList",
					height: 610,
					x: [1196, 1696],
					y: 60,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
				{
					width: [360, 430],
					compName: "ExchangeInfo",
					height: 968,
					x: [1556, 2126],
					y: 60,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
				{
					width: [1558, 2128],
					compName: "UserExchangeTable",
					height: 356,
					x: 0,
					y: 670,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
			],
		},
	},
	{
		layoutStrategy: LayoutStrategy.PRO_LEFT,
		resolution: {
			"[768, 1023]": [
				{
					width: [768, 1023],
					compName: "Header",
					height: 60,
					x: 0,
					y: 0,
					zIndex: "2",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
				{
					width: [498, 753],
					compName: "ExchangeChart",
					height: 550,
					x: 266,
					y: 60,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
				{
					width: [498, 753],
					compName: "ExchangeList",
					height: 306,
					x: 266,
					y: 610,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
				{
					width: [266, 266],
					compName: "ExchangeInfo",
					height: 856,
					x: 0,
					y: 60,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
				{
					width: [768, 1023],
					compName: "UserExchangeTable",
					height: 356,
					x: 0,
					y: 916,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
			],
			"[1024, 1280]": [
				{
					width: [1024, 1280],
					compName: "Header",
					height: 60,
					x: 0,
					y: 0,
					zIndex: "2",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
				{
					width: [484, 743],
					compName: "ExchangeChart",
					height: 460,
					x: 532,
					y: 60,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
				{
					width: [266, 266],
					compName: "ExchangeList",
					height: 460,
					x: 266,
					y: 60,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
				{
					width: [266, 266],
					compName: "ExchangeInfo",
					height: 968,
					x: 0,
					y: 60,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
				{
					width: [760, 1011],
					compName: "UserExchangeTable",
					height: 505,
					x: 266,
					y: 520,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
			],
			"[1281, 1440]": [
				{
					width: [1281, 1440],
					compName: "Header",
					height: 60,
					x: 0,
					y: 0,
					zIndex: "2",
					fixed: true,
					show: true,
					minW: 240,
					minHeight: 60,
				},
				{
					width: [738, 836],
					compName: "ExchangeChart",
					height: 610,
					x: [532, 600],
					y: 60,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
				{
					width: [266, 300],
					compName: "ExchangeList",
					height: 610,
					x: [266, 300],
					y: 60,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
				{
					width: [266, 300],
					compName: "ExchangeInfo",
					height: 968,
					x: 0,
					y: 60,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
				{
					width: [1012, 1138],
					compName: "UserExchangeTable",
					height: 356,
					x: [266, 300],
					y: 670,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
			],
			"[1441, 1920]": [
				{
					width: [1441, 1920],
					compName: "Header",
					height: 60,
					x: 0,
					y: 0,
					zIndex: "2",
					fixed: true,
					show: true,
					minW: 240,
					minHeight: 60,
				},
				{
					width: [836, 1196],
					compName: "ExchangeChart",
					height: 610,
					x: [600, 720],
					y: 60,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
				{
					width: [300, 360],
					compName: "ExchangeList",
					height: 610,
					x: [300, 360],
					y: 60,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
				{
					width: [300, 360],
					compName: "ExchangeInfo",
					height: 968,
					x: 0,
					y: 60,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
				{
					width: [1138, 1558],
					compName: "UserExchangeTable",
					height: 356,
					x: [300, 360],
					y: 670,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
			],
			"[1921, 2560]": [
				{
					width: [1921, 2560],
					compName: "Header",
					height: 60,
					x: 0,
					y: 0,
					zIndex: "2",
					fixed: true,
					show: true,
					minW: 240,
					minHeight: 60,
				},
				{
					width: [1196, 1696],
					compName: "ExchangeChart",
					height: 610,
					x: [720, 860],
					y: 60,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
				{
					width: [360, 430],
					compName: "ExchangeList",
					height: 610,
					x: [360, 430],
					y: 60,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
				{
					width: [360, 430],
					compName: "ExchangeInfo",
					height: 968,
					x: 0,
					y: 60,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
				{
					width: [1558, 2128],
					compName: "UserExchangeTable",
					height: 356,
					x: [360, 430],
					y: 670,
					zIndex: "3",
					fixed: false,
					show: true,
					minW: 240,
					minHeight: 60,
				},
			],
		},
	},
];
