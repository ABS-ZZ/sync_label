<template>
<el-dialog
      v-model="apiDialogVisible"
      title="Import images"
      width="400px">
      <el-form :model="apiForm" label-width="100px">
        <el-form-item label="Id">
          <el-input v-model="apiForm.equCode" placeholder="Please enter equipment id" />
        </el-form-item>
        <el-form-item label="Page">
          <el-input-number v-model="apiForm.pageNo" :min="1" controls-position="right"/>
        </el-form-item>
        <el-form-item label="Page size">
          <el-input-number v-model="apiForm.pageSize" :min="1" controls-position="right"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="apiDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="fetchImageData" :loading="loading">Confirm</el-button>
      </template>
    </el-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import bus from '@/utils/bus'
import { ElMessage } from 'element-plus'
import { saveHistory } from '@/utils/historyStorage'
import { groupImagesByPosition } from '@/utils/imageGroup'
import { useAnnotationStore } from '@/stores/annotation'

const annotationStore = useAnnotationStore()

const apiDialogVisible = ref(false)
const loading = ref(false)

const apiForm = ref({
  equCode: '23018',
  pageSize: 10,
  pageNo: 1
})

onMounted(() => {
  bus.on('openApiDialog', () => {
    apiDialogVisible.value = true
  })
})

// 发送switchImage函数
const handleSwitchImage = (index) => {
    bus.emit('switchImage', index)
}

const fetchImageData = async () => {
  if (!apiForm.value.equCode) {
    ElMessage.error('请输入设备编号')
    return
  }

  loading.value = true

  // 重置标注信息和当前图片索引，不然switchImage会报错
  annotationStore.annotations = []
  annotationStore.currentImageIndex = -1
  try {
    const url = ''
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.success) {
      // 记录加载历史
      const historyEntry = {
        equCode: apiForm.value.equCode,
        pageNo: apiForm.value.pageNo,
        pageSize: apiForm.value.pageSize,
        loadTime: new Date().toLocaleString() // 记录当前加载时间
      };
      saveHistory(historyEntry) // 保存到 localStorage
      // 发送加载历史记录事件,以便更新历史记录
      bus.emit('loadHistory')


      // 计算总图片数
      annotationStore.totalImageCount = data.result.records.reduce((total, dayGroup) => 
        total + dayGroup.imageList.length, 0
      )

      const groups = groupImagesByPosition(data.result.records)
      
      // 对每个 position 数内的数据进行逆序
      for (const position of Object.values(groups)) {
        position.reverse()
      }
      
      // 清空当前图片列表
      annotationStore.clearImageList()
      
      // 创建加载图片的 Promise
      const loadImage = (img) => {
        return new Promise((resolve) => {
          const image = new Image()
          image.src = `${img.imageUrl}`
          image.onload = () => {
            resolve({
              name: img.fileName,
              image: image,
              annotations: [],
              metadata: img
            })
          }
          image.onerror = () => {
            resolve(null)
          }
        })
      }

      // 按顺序加载所有图片并保持分组信息
      for (const [positionKey, position] of Object.entries(groups)) {
        annotationStore.initGroupedImages(positionKey) // 初始化该位置的数组
        
        for (const img of position) {
          const loadedImage = await loadImage(img)
          if (loadedImage) {
            annotationStore.addImage(loadedImage)
            annotationStore.addGroupedImage(positionKey, loadedImage)
            if (annotationStore.imageList.length === 1) {
              handleSwitchImage(0)
            }
          }
        }
      }
      
      ElMessage.success(`Successful import ${annotationStore.imageList.length} / ${annotationStore.totalImageCount} images`)
      apiDialogVisible.value = false
    } else {
      ElMessage.error(data.message || 'Get data failed')
    }
  } catch (error) {
    ElMessage.error('Request failed：' + error.message + ' please try again')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="less" scoped>

</style>