/*
 * @Author: 田鑫
 * @Date: 2024-08-24 16:00:58
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-08-24 16:00:58
 * @Description: 
 */
/**
 * 自动引入组件
 * */
import Components from 'unplugin-vue-components/vite';

import { ArcoResolver } from 'unplugin-vue-components/resolvers';
import IconsResolver from 'unplugin-icons/resolver';


export function configComponents() {
  return Components({
    dirs: ['src/components'],
    extensions: ['vue'],
    resolvers: [
      ArcoResolver({
        resolveIcons: {
          enable: true,
        },
        sideEffect: true,
      }),
      IconsResolver({
        prefix: false,
        customCollections: ['i'],
        enabledCollections: [],
      }),
    ],
    directoryAsNamespace: true,
    dts: './config/unplugin/components.d.ts',
  });
}
