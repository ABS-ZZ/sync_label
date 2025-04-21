<template>
    <el-aside>
        <!-- 左侧图片列表 -->
        <div class="image-list">
            <!-- 修改总计信息显示 -->
            <div class="total-count">
              Loaded {{ annotationStore.imageList.length }} images, total {{ annotationStore.totalImageCount }} images
            </div>
            <div class="has-group" v-if="Object.keys(annotationStore.groupedImages).length > 0">
              <el-scrollbar height="calc(100vh - 130px)" always>
                <template v-for="(position, positionKey) in annotationStore.groupedImages" :key="positionKey">
                    <!-- 添加分组标和数量 -->
                    <div class="position-title">
                        {{ positionKey }} ({{ position.length }} Images)
                    </div>
                    <div v-for="(img, index) in position" :key="index"
                        :class="['image-item', { active: annotationStore.currentImageIndex === getGlobalIndex(positionKey, index) }]"
                        @click="handleSwitchImage(getGlobalIndex(positionKey, index))">
                        <!-- 添加序号和标注数量 -->
                        <template v-if="img.annotations.length > 0">
                            <el-tooltip
                                :content="(index + 1) + '. ' + img.name + ' (' + img.annotations.length + '个标注)'"
                                placement="top" :show-after="500">
                                <el-badge :value="img.annotations.length" :offset="[-20, 10]" type="primary"
                                    class="image-badge-container">
                                    <span class="image-index">{{ index + 1 }}.</span>
                                    <span class="image-name">{{ img.name }}</span>
                                </el-badge>
                            </el-tooltip>
                        </template>
                        <template v-else>
                            <el-tooltip
                                :content="(index + 1) + '. ' + img.name + ' (' + img.annotations.length + '个标注)'"
                                placement="top" :show-after="500">
                                <el-badge :value="img.annotations.length" :offset="[-20, 10]"
                                    class="image-badge-container">
                                    <span class="image-index">{{ index + 1 }}.</span>
                                    <span class="image-name">{{ img.name }}</span>
                                </el-badge>
                            </el-tooltip>
                        </template>
                    </div>
                </template>
              </el-scrollbar>
            </div>
            <div class="no-group" v-else>
              <el-scrollbar height="calc(100vh - 130px)" always>
                <div v-for="(img, index) in annotationStore.imageList" :key="index"
                    :class="['image-item', { active: annotationStore.currentImageIndex === index }]" @click="handleSwitchImage(index)">
                    <!-- 添加序号和标注数量 -->
                    <template v-if="img.annotations.length > 0">
                        <el-tooltip :content="(index + 1) + '. ' + img.name + ' (' + img.annotations.length + '个标注)'"
                            placement="top" :show-after="500">
                            <el-badge :value="img.annotations.length" :offset="[-20, 10]" type="primary"
                                class="image-badge-container">
                                <span class="image-index">{{ index + 1 }}.</span>
                                <span class="image-name">{{ img.name }}</span>
                            </el-badge>
                        </el-tooltip>
                    </template>
                    <template v-else>
                        <el-tooltip :content="(index + 1) + '. ' + img.name + ' (' + img.annotations.length + '个标注)'"
                            placement="top" :show-after="500">
                            <el-badge :value="img.annotations.length" :offset="[-20, 10]" class="image-badge-container">
                                <span class="image-index">{{ index + 1 }}.</span>
                                <span class="image-name">{{ img.name }}</span>
                            </el-badge>
                        </el-tooltip>
                    </template>
                </div>
              </el-scrollbar>
            </div>

        </div>
    </el-aside>
</template>

<script setup>
import bus from '@/utils/bus'
import { useAnnotationStore } from '@/stores/annotation'
const annotationStore = useAnnotationStore()

// 发送switchImage函数
const handleSwitchImage = (index) => {
    bus.emit('switchImage', index)
}

// 添加辅助函数来计算全局索引
const getGlobalIndex = (positionKey, localIndex) => {
  let globalIndex = 0
  for (const [key, position] of Object.entries(annotationStore.groupedImages)) {
    if (key === positionKey) {
      return globalIndex + localIndex
    }
    globalIndex += position.length
  }
  return globalIndex
}
</script>

<style lang="less" scoped>

.el-aside {
  width: 20%;
  // max-height: 100vh;
  padding: 0 10px;
  border-right: 1px solid #ccc;
  background-color: #ffffff;
}

.total-count {
  padding: 12px;
  background-color: #f6f8fa;
  border-bottom: 1px solid #e1e4e8;
  font-weight: bold;
  color: #24292e;
  text-align: center;
}

.position-title {
  padding: 10px;
  font-weight: bold;
  background-color: #f0f0f0;
  border-left: 4px solid #409eff;
  margin: 10px 0 5px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.image-item {
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  color: #333;
  display: flex;
  align-items: center;
}

.image-index {
  color: #666;
  margin-right: 8px;
  min-width: 24px;
  display: inline-block;
}

.image-item:hover {
  background-color: #f5f5f5;
}

.image-item.active {
  background-color: #e6f7ff;
}

.image-badge-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  text-align: left;
}

.image-badge-container .image-index {
  width: 20px;
}
.image-badge-container .image-name {
  flex: 1;
}

.image-name {
  display: inline-block; /* 使其成为块级元素 */
  white-space: nowrap; /* 不换行 */
  overflow: hidden; /* 超出部分隐藏 */
  text-overflow: ellipsis; /* 使用省略号表示超出部分 */
}

</style>