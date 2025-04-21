<template>
  <el-aside>
    <!-- 右侧标注信息 -->
    <div class="annotation-info">
      <div class="annotation-controls">
        <el-button
          :type="annotationStore.isAnnotationsHidden ? 'primary' : 'default'"
          @click="toggleAnnotationsVisibility"
          size="default">
          {{ annotationStore.isAnnotationsHidden ? "Show label" : "Hide label" }}
        </el-button>
        <el-button type="primary" @click="openLabelDialog" size="default">
          Add label name
        </el-button>
      </div>
      <div class="annotation-header">
        <span>#</span>
        <span>Label name</span>
      </div>
      <div class="annotation-list">
        <el-scrollbar ref="scrollbar" height="calc(100vh - 190px)" always>
          <div
            v-for="(annotation, index) in annotationStore.annotations"
            :key="index"
            :class="['annotation-item', { active: annotationStore.selectedAnnotationIndex === index }]"
            @click="selectAnnotation(index)">
            <div class="annotation-content">
              <span class="annotation-index">{{ index + 1 }}</span>
              <el-select
                v-model="annotation.label"
                placeholder="Select a label"
                size="small"
                @change="(value) => handleLabelChange(value, annotation)">
                <el-option
                  v-for="label in annotationStore.labelList"
                  :key="label"
                  :label="label"
                  :value="label"/>
              </el-select>
              <el-button
                type="primary"
                link
                class="only-view-btn"
                @click.stop="onlyViewCurrentAnnotation(index)">
                <el-icon
                  v-if="annotationStore.onlyViewAnnotationIdx === index"
                  :size="16"
                  color="#67C23A">
                  <Unlock />
                </el-icon>
                <el-icon v-else :size="16" color="#409EFF">
                  <Lock />
                </el-icon>
              </el-button>
              <el-button
                type="danger"
                link
                class="delete-btn"
                @click.stop="deleteAnnotation(index)">
                <el-icon :size="16" color="#ff4d4f">
                  <Close />
                </el-icon>
              </el-button>
            </div>
          </div>
        </el-scrollbar>
      </div>
      <ManageLabelNameDialog />
    </div>
  </el-aside>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { Unlock, Lock, Close } from "@element-plus/icons-vue";
import ManageLabelNameDialog from "@/components/dialog/ManageLabelNameDialog.vue";
import bus from "@/utils/bus";
import { useAnnotationStore } from "@/stores/annotation";
const annotationStore = useAnnotationStore();

const scrollbar = ref(null);

onMounted(() => {
  // 监听滚动到底部事件
  bus.on("scrollBottom", upDateScrollMenuRes)
})

// 打开标注名称对话框
const openLabelDialog = () => {
  bus.emit("openLabelDialog");
};

// 切换标注框显示与否
const toggleAnnotationsVisibility = () => {
  bus.emit("toggleAnnotationsVisibility");
};

// 选中标注对象框事件
const selectAnnotation = (index) => {
  bus.emit("selectedAnnotation", index);
};

// 删除标注对象框
const deleteAnnotation = (index) => {
  annotationStore.selectedAnnotationIndex = -1
  annotationStore.annotations.splice(index, 1)
  bus.emit("drawImage");
};

// 监听标注称的变化
const handleLabelChange = (value, annotation) => {
  annotationStore.defaultLabel = value // 保存最后选择的标注名称
}

// 切换查看当前标注对象框
const onlyViewCurrentAnnotation = (index) => {
  bus.emit("onlyViewCurrentAnnotation", index);
};

// 设置滚动条在最下方
const upDateScrollMenuRes = async () => {
  // 等待 DOM 更新完成
  await nextTick(() => {
    scrollbar.value.setScrollTop(scrollbar.value.wrapRef.scrollHeight)
  });
}
</script>

<style lang="less" scoped>
.el-aside {
  width: 20%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 0 10px;
  border-left: 1px solid #ccc;
  background-color: #ffffff;
}

.annotation-info {
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
}

.annotation-controls {
  flex: 0 0 auto;
  margin-bottom: 10px;
  display: flex;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid #ddd;
  background-color: #fff;

  :deep(.el-button) {
    flex: 1;
    height: 36px;
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

.annotation-header {
  flex: 0 0 auto;
  display: flex;
  padding: 8px 12px;
  border-bottom: 1px solid #ddd;
  font-weight: 500;
  color: #666;
  background-color: #f8f8f8;

  & span:first-child {
    width: 40px;
  }
}
.annotation-list {
  .annotation-item {
    padding: 8px 12px;
    border-bottom: 1px solid #eee;
    cursor: pointer;
  }

  .annotation-item:hover {
    background-color: #f5f5f5;
  }

  .annotation-item.active {
    background-color: #e6f7ff;
  }

  .annotation-content {
    display: flex;
    align-items: center;
    gap: 8px;

    .annotation-index {
      width: 32px;
      color: #666;
    }

    :deep(.el-select) {
      flex: 1;
    }

    :deep(.el-select .el-input__wrapper) {
      padding: 0 8px;
    }

    :deep(.el-select .el-input__inner) {
      height: 28px;
      line-height: 28px;
    }

    .delete-btn,
    .only-view-btn {
      margin: 0;
      padding: 2px 8px;
    }
  }
}
</style>
