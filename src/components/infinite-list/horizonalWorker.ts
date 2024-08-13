/*
 * @Author: 田鑫
 * @Date: 2024-08-12 10:01:45
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-08-13 13:44:03
 * @Description:
 */
let offset = 0;
let scrollSpeed = 2;
let rowWidth = 0;
let isScrolling = true;
let animationFrameId: number | null = null; // 用于存储当前的动画帧 ID

self.onmessage = (e) => {
  const { command, scrollSpeed: newSpeed, rowWidth: newRowWidth } = e.data;

  if (command === 'start') {
    scrollSpeed = newSpeed;
    rowWidth = newRowWidth;
    isScrolling = true;
    startScroll(); 
  } else if (command === 'stop') {
    isScrolling = false;
    stopScroll(); 
  }
};

/**
 * 开始滚动
 */
function startScroll() {
  if (animationFrameId === null) { 
    scroll();
  }
}

/**
 * 结束滚动
 */
function stopScroll() {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId); 
    animationFrameId = null;
  }
}

function scroll() {
  if (!isScrolling) return;

  offset = (offset + scrollSpeed) % rowWidth;
  self.postMessage({ offset });


  animationFrameId = requestAnimationFrame(scroll); 
}
