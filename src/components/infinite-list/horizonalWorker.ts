/*
 * @Author: 田鑫
 * @Date: 2024-08-12 10:01:45
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-08-14 17:07:05
 * @Description:
 */
interface RowState {
	offset: number;
	scrollSpeed: number;
	rowWidth: number;
	isScrolling: boolean;
	animationFrameId: number | null;
}

let rows: RowState[] = []; // 用于存储每个 row 的状态

self.onmessage = (e) => {
	const { command, scrollSpeed, rowWidth, rowIndex } = e.data;

	if (command === "start") {
		// 初始化或更新指定 row 的状态
		if (!rows[rowIndex]) {
			rows[rowIndex] = {
				offset: 0,
				scrollSpeed,
				rowWidth,
				isScrolling: true,
				animationFrameId: null,
			};
		} else {
			rows[rowIndex].scrollSpeed = scrollSpeed;
			rows[rowIndex].rowWidth = rowWidth;
			rows[rowIndex].isScrolling = true;
		}

		startScroll(rowIndex);
	} else if (command === "stop") {
		if (rows[rowIndex]) {
			rows[rowIndex].isScrolling = false;
			stopScroll(rowIndex);
		}
	}
};

/**
 * 开始滚动
 */
function startScroll(rowIndex: number) {
	if (rows[rowIndex].animationFrameId === null) {
		scroll(rowIndex);
	}
}

/**
 * 结束滚动
 */
function stopScroll(rowIndex: number) {
	if (rows[rowIndex].animationFrameId !== null) {
		cancelAnimationFrame(rows[rowIndex].animationFrameId);
		rows[rowIndex].animationFrameId = null;
	}
}

function scroll(rowIndex: number) {
	if (!rows[rowIndex].isScrolling) return;
	const row = rows[rowIndex];

	row.offset = (row.offset + row.scrollSpeed) % row.rowWidth;
	self.postMessage({ rowIndex, offset: row.offset });

	row.animationFrameId = requestAnimationFrame(() => scroll(rowIndex));
}
