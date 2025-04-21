<template>
  <el-dialog v-model="isVisible" title="Setting" width="500px">
    <el-form label-width="250px">
      <el-form-item label="Show label name:">
        <el-switch
            v-model="settingsStore.showLabels"
            active-text="Activate"
            inactive-text="Inactivate"
            @change="handleLabelsChange"
        />
      </el-form-item>
      <el-form-item label="Show label box mask:">
        <el-switch
            v-model="settingsStore.showMask"
            active-text="Activate"
            inactive-text="Inactivate"
            @change="handleMaskChange"
        />
      </el-form-item>
      <el-form-item label="Label name color:">
        <el-color-picker v-model="settingsStore.annotationNameColor" show-alpha @change="handleAnnotationNameColorChange" :predefine="predefineColors" />
      </el-form-item>
      <el-form-item label="Label box color:">
        <el-color-picker v-model="settingsStore.annotationBorderColor" show-alpha @change="handleAnnotationBorderColorChange" :predefine="predefineColors" />
      </el-form-item>
      <el-form-item label="Auxiliary line color:">
        <el-color-picker v-model="settingsStore.gridLineColor" show-alpha @change="handleGridLineColorChange" :predefine="predefineColors" />
      </el-form-item>
      <el-form-item label="Right-click to switch the picture:">
        <el-switch
            v-model="settingsStore.enableRightClickNext"
            active-text="Activate"
            inactive-text="Inactivate"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="closeDialog">Close</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import bus from '@/utils/bus';
import { useSettingsStore } from '@/stores/settings';

const settingsStore = useSettingsStore();

const isVisible = ref(false);

const predefineColors = ref([
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#90ee90',
  '#00ced1',
  '#1e90ff',
  '#c71585',
  'rgba(255, 69, 0, 0.68)',
  'rgb(255, 120, 0)',
  'hsv(51, 100, 98)',
  'hsva(120, 40, 94, 0.5)',
  'hsl(181, 100%, 37%)',
  'hsla(209, 100%, 56%, 0.73)',
  '#c7158577',
])

// 监听打开设置对话框事件
bus.on('openSettingsDialog', () => {
  isVisible.value = true;
});

// 关闭对话框
const closeDialog = () => {
  isVisible.value = false;
};

// 处理标注名称颜色变化
const handleAnnotationNameColorChange = (value) => {
  value? settingsStore.annotationNameColor = value : settingsStore.annotationNameColor = '#ffa500'
};

// 处理标注框颜色变化
const handleAnnotationBorderColorChange = (value) => {
  value? settingsStore.annotationBorderColor = value : settingsStore.annotationBorderColor = '#ffa500'
};

// 处理辅助线颜色变化
const handleGridLineColorChange = (value) => {
  value? settingsStore.gridLineColor = value : settingsStore.gridLineColor = 'rgba(0, 0, 0, 0.5)'
};

</script>

<style scoped>
.el-form-item {
  text-align: right; /* 文字右对齐 */
}

.el-form-item label {
  width: 150px; /* 设置一致的宽度 */
}

.el-switch {
  margin-left: 10px; /* 添加左边距 */
}
</style> 