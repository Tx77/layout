<!--
 * @Author: 田鑫
 * @Date: 2024-08-07 10:17:21
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-08-07 14:27:34
 * @Description: 
-->
<template>
  <div>
    <h1>view transition</h1>
    <button id="btn" @mousedown="toggleTheme($event)">切换</button>
    <div class="list">
      <div class="item"></div>
      <div class="item"></div>
      <div class="item"></div>
      <div class="item"></div>
      <div class="item"></div>
      <div class="item"></div>
      <div class="item"></div>
      <div class="item"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
function toggleTheme(ev: MouseEvent) {
  document.documentElement.style.setProperty("--x", ev.clientX + "px");
  document.documentElement.style.setProperty("--y", ev.clientY + "px");
  if ((document as any).startViewTransition) {
    (document as any).startViewTransition(() => {
      document.documentElement.classList.toggle("dark");
    });
  } else {
    document.documentElement.classList.toggle("dark");
  }
}
</script>

<style lang="less">
html,
body {
  margin: 0;
  height: 100%;
  display: flex;
  /* justify-content: center; */
  flex-direction: column;
  align-items: center;
}
html {
  background-color: #fff;
}
button {
  padding: 5px 16px;
  background-color: transparent;
  border-radius: 8px;
  line-height: 1.4;
  box-shadow: 0 2px #00000004;
  cursor: pointer;
  transition: 0.3s;
  transform: scale(1);
  border-color: transparent;
  background-color: royalblue;
  color: #fff;
  text-shadow: 0 -1px 0 rgb(0 0 0 / 12%);
  box-shadow: 0 2px #0000000b;
}
.dark {
  background-color: #000;
  color-scheme: dark;
}
button:hover {
  filter: brightness(1.1);
}
.list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-top: 20px;
  width: 600px;
}
.item {
  width: 200px;
  height: 150px;
  background-color: royalblue;
  border-radius: 10px;
}
::view-transition-old(*) {
  animation: none;
  mix-blend-mode: normal;
}
::view-transition-new(*) {
  mix-blend-mode: normal;
  animation: clip 0.5s ease-in;
}
@keyframes clip {
  from {
    clip-path: circle(0% at var(--x) var(--y));
  }
  to {
    clip-path: circle(100% at var(--x) var(--y));
  }
}
</style>
