<template>
    <el-container direction="vertical">
        <TheHeader />
        <el-container>
            <ImageList />
            <TheMain />
            <AnnotationList />
        </el-container>
    </el-container>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import TheHeader from './TheHeader.vue'
import ImageList from './ImageList.vue'
import TheMain from './TheMain.vue'
import AnnotationList from './AnnotationList.vue'

import bus from '@/utils/bus';
import { useAnnotationStore } from '@/stores/annotation';
const annotationStore = useAnnotationStore();

onMounted(() => {
  // 添加键盘事件监听，在这里注册可以实现该页面全局监听
  window.addEventListener('keydown', handleKeyDown);
})

// 移除事件监听
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

// 处理键盘事件,实现上下键切换图片
const handleKeyDown = (event) => {
  if (event.key === 'ArrowUp') {
    // 上一张图片
    if (annotationStore.currentImageIndex > 0) {
      bus.emit("switchImage", annotationStore.currentImageIndex - 1);
    }
  } else if (event.key === 'ArrowDown') {
    // 下一张图片
    if (annotationStore.currentImageIndex < annotationStore.imageList.length - 1) {
      bus.emit("switchImage", annotationStore.currentImageIndex + 1);
    }
  }
};
</script>

<style lang="less" scoped>

</style>