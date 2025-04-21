<template>
  <el-header>
    <div class="top-controls">
      <div class="left-controls">
        <div class="upload-controls">
          <input
            type="file"
            accept="image/*"
            @change="handleImageUpload"
            multiple
            ref="fileInput"
          />
          <input
            type="file"
            accept=".json"
            @change="handleJsonImport"
            ref="jsonInput"
            style="display: none"
          />
          <el-button
            type="primary"
            size="default"
            @click="$refs.fileInput.click()"
            >Select Local Images</el-button
          >
          <el-button
            type="primary"
            size="default"
            @click="$refs.jsonInput.click()"
            :disabled="annotationStore.imageList.length === 0"
            >Import annotation</el-button
          >
          <el-button type="primary" size="default" @click="openApiDialog"
            >Load images</el-button
          >
          <el-button type="primary" size="default" @click="syncAnnotations"
            >Sync label</el-button
          >
          <el-button type="primary" size="default" @click="openHistoryDialog"
            >View history</el-button
          >
        </div>
      </div>
      <div class="right-controls">
        <el-button type="primary" size="default" @click="handleExport"
          >export labels</el-button
        >
        <el-button
          type="primary"
          size="default"
          @click="openSettingsDialog"
          title="setting"
        >
          <el-icon :size="24"><Setting /></el-icon>
        </el-button>
      </div>

      <ApiImageLoadDialog />

      <ImageLoadHistory />

      <SettingsDialog />
    </div>
  </el-header>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { Setting } from '@element-plus/icons-vue'
import bus from '@/utils/bus'
import ApiImageLoadDialog from '@/components/dialog/ApiImageLoadDialog.vue'
import ImageLoadHistory from '@/components/dialog/ImageLoadHistoryDialog.vue'
import SettingsDialog from '@/components/dialog/SettingsDialog.vue'

import { useAnnotationStore } from '@/stores/annotation'
const annotationStore = useAnnotationStore()


// 处理多图片上传
const handleImageUpload = (event) => {
  const files = Array.from(event.target.files)
  files.forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        annotationStore.addImage({
          name: file.name,
          image: img,
          annotations: []
        })
        if (annotationStore.currentImageIndex === -1) {
          bus.emit('switchImage', 0)
        }
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)

    annotationStore.totalImageCount += 1
  })
}

// 处理 JSON 导入
const handleJsonImport = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    
    try {
      const jsonData = JSON.parse(e.target.result);
      jsonData.forEach(item => {
        const matchingImage = annotationStore.imageList.find(img => img.name === item.imageName);
        if (matchingImage) {
          matchingImage.annotations = item.originalAnnotations; // 更新对应的标注信息
        }
      });
      // 更新当前图片的标注，不然切换图片时标注信息是空的，导致图片标注信息丢失
      annotationStore.updateAnnotations([...annotationStore.imageList[annotationStore.currentImageIndex].annotations])
      ElMessage.success('Data import was successful.');
    } catch (error) {
      ElMessage.error('Data import failed. Please check the file format');
    }
  };
  reader.readAsText(file);
};

// 同步标注信息
const syncAnnotations = () => {
  if (annotationStore.previousAnnotations.length > 0) {
    annotationStore.annotations = annotationStore.previousAnnotations.map(annotation => ({
      ...annotation // 复制标注信息
    }))
    annotationStore.imageList[annotationStore.currentImageIndex].annotations = [...annotationStore.annotations] // 更新当前图片的标注
    ElMessage.success('The annotation information has been synchronized to the current image')
  } else {
    ElMessage.warning('There is no synchronizable annotation information')
  }
  
  bus.emit('drawImage')
}

// 修改导出标注信息的函数
const handleExport = () => {
  if (annotationStore.imageList.length === 0) {
    ElMessage.warning('请先添加图片')
    return
  }
  // 清空错误信息列表
  annotationStore.warnInfoList.splice(0, annotationStore.warnInfoList.length)
  const exportData = annotationStore.imageList.map(item => {
    const yoloAnnotations = item.annotations.map((annotation, annotationIndex) => {
      // 注意：这里的annotation已经是归一化的YOLO格式了
      const classIndex = annotationStore.labelList.indexOf(annotation.label)
      if (classIndex === -1) {
        annotationStore.warnInfoList.push(`图片 ${item.name} 第 ${annotationIndex + 1} 个标注框标签 "${annotation.label}" 未设置标注对象`)
      }
      if(annotation.width < 0.01 || annotation.height < 0.01) {
        annotationStore.warnInfoList.push(`图片 ${item.name} 第 ${annotationIndex + 1} 个标注框太小，宽度: ${annotation.width}, 高度: ${annotation.height}`)
      }
      return {
        class: classIndex,
        x_center: annotation.x,
        y_center: annotation.y,
        width: annotation.width,
        height: annotation.height
      }
    }).filter(Boolean)

    return {
      imageName: item.name,
      yoloAnnotations,
      originalAnnotations: item.annotations,
      labelMapping: annotationStore.labelList.reduce((acc, label, index) => {
        acc[index] = label
        return acc
      }, {})
    }
  })
  
  const dataStr = JSON.stringify(exportData, null, 2)

  if (annotationStore.warnInfoList.length > 0) {
    console.log(annotationStore.warnInfoList);
    return
  }

  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
  
  const exportLink = document.createElement('a')
  exportLink.setAttribute('href', dataUri)
  exportLink.setAttribute('download', 'annotations_yolo.json')
  document.body.appendChild(exportLink)
  exportLink.click()
  document.body.removeChild(exportLink)
}

// 打开接口加载图片对话框
const openApiDialog = () => {
  bus.emit('openApiDialog')
}

// 打开加载历史对话框
const openHistoryDialog = () => {
  bus.emit('openHistoryDialog'); // 发送事件以打开加载历史对话框
};

// 打开设置对话框
const openSettingsDialog = () => {
  bus.emit('openSettingsDialog'); // 发送事件以打开设置对话框
};
</script>

<style lang="less" scoped>

input[type="file"] {
  display: none;
}

.el-header {
  padding: 0;
}

.top-controls {
  display: flex; /* 使用 Flexbox 布局 */
  justify-content: space-between; /* 左右分布 */
  align-items: center; /* 垂直居中 */
  height: 50px;
  padding: 0 20px;
  border-bottom: 1px solid #ccc;
  background-color: #f5f5f5;

  .left-controls {
    display: flex; /* 左侧按钮区域 */
    gap: 10px; /* 按钮间距 */
  }

  .right-controls {
    display: flex; /* 右侧按钮区域 */
    gap: 10px; /* 按钮间距 */
  }

  :deep(.el-button) {
    font-weight: 500;
    outline: none; /* 去掉聚焦时的黑边 */
    color: #000;
    background-color: #fff;
    border: 1px solid #dcdfe6;
  }

  :deep(.el-button:hover) {
    opacity: 0.9;
    transform: scale(0.98);
    transition: all 0.2s;
  }

  :deep(.el-button--default:hover) {
    background-color: #f5f5f5;
    border-color: #dcdfe6;
    color: #409eff;
  }
}



</style>
