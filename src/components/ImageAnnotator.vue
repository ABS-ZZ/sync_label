<template>
  <div class="image-annotator">
    
    <!-- 主要内容区域 -->
    <div class="main-content">

    </div>

    <!-- 加载历史记录对话框 -->
    <ImageLoadHistory 
      :historyRecords="loadHistory" 
    />

    <!-- 设置对话框 -->
    <SettingsDialog />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { groupImagesByPosition } from '../utils/imageGroup'
import ImageLoadHistory from './dialog/ImageLoadHistoryDialog.vue'
import bus from '../utils/bus'
import { saveHistory, getHistory } from '../utils/historyStorage'; // 引入工具类
import { Close, Lock, Unlock } from '@element-plus/icons-vue'
import SettingsDialog from './dialog/SettingsDialog.vue'



const imageList = ref([])
const currentImageIndex = ref(-1)

const dialogVisible = ref(false)
const labelList = ref([]) // 存储所有标注名称
const defaultLabel = ref('')
const apiDialogVisible = ref(false)


const groupedImages = ref({})
const totalImageCount = ref(0)
const loadHistory = ref([])


const warnInfoList = ref([])






</script>

<style scoped>
.image-annotator {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  background-color: #ffffff;
  position: fixed;
  top: 0;
  left: 0;
}

button {
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  color: #333;
}

.upload-controls {
  display: flex;
  gap: 10px;
}



.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}



:deep(.el-input-group__append) {
  padding: 0;
}

:deep(.el-input-group__append button) {
  border: none;
  margin: 0;
  height: 100%;
}









.settings-content {
  padding: 20px;
}
</style> 