import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    showLabels: true, // 是否显示标注名称
    showMask: true, // 是否显示标注框遮罩
    annotationNameColor: '#ffa500', // 标注名称颜色
    annotationBorderColor: '#ffa500', // 标注框颜色
    gridLineColor: 'rgba(0, 0, 0, 0.5)', // 辅助线颜色
    enableRightClickNext: true, // 右键切换图片
  }),
  
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'settings',
        storage: localStorage,
      },
    ],
  },
}) 