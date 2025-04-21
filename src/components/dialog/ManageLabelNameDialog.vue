<template>
    <el-dialog v-model="dialogVisible" title="添加标注名称" width="30%">
        <div class="label-dialog-content">
            <!-- 上方输入区域 -->
            <div class="label-input-area">
                <el-input v-model="newLabelName" placeholder="请输入标注名称" @keyup.enter="addNewLabel">
                    <template #append>
                        <el-button @click="addNewLabel">添加</el-button>
                    </template>
                </el-input>
            </div>

            <!-- 下方标注名称列表 -->
            <div class="label-list">
                <div v-for="(label, index) in annotationStore.labelList" :key="index" class="label-item">
                    <span>{{ label }}</span>
                    <el-button type="danger" size="small" link @click="deleteLabel(index)">
                        删除
                    </el-button>
                </div>
            </div>
        </div>
    </el-dialog>
</template>

<script setup>
import { ref, onMounted } from "vue";
import bus from "@/utils/bus";
import { useAnnotationStore } from "@/stores/annotation";
const newLabelName = ref("");

const annotationStore = useAnnotationStore();

const dialogVisible = ref(false);

onMounted(() => {
    bus.on("openLabelDialog", () => {
        dialogVisible.value = true;
    });

    // 从localStorage中获取标注名称列表
    const savedLabelList = localStorage.getItem('labelList')
    if (savedLabelList !== null) {
        annotationStore.labelList = JSON.parse(savedLabelList)
    }
});

// 添加新的标注名称
const addNewLabel = () => {
    const trimName = newLabelName.value.trim();
    if (!trimName) {
        ElMessage.warning("请输入标注名称");
        return;
    }

    if (annotationStore.labelList.includes(trimName)) {
        ElMessage.warning("该标注名称已存在");
        return;
    }

    annotationStore.labelList.push(trimName);
    newLabelName.value = "";

    // 将标注名称保存到本地存储
    localStorage.setItem("labelList", JSON.stringify(annotationStore.labelList));
};

// 删除标注名称
const deleteLabel = (index) => {
    annotationStore.labelList.splice(index, 1);
};
</script>

<style lang="less" scoped>
.label-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.label-input-area {
  display: flex;
  gap: 10px;
}

.label-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 4px;
}

.label-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
}

.label-item:last-child {
  border-bottom: none;
}
</style>
