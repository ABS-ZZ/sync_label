<template>
  <el-dialog v-model="visible" title="Loaded istory" width="60%">
    <div class="dialog-content">
        <el-scrollbar max-height="400px">
            <el-table 
                :data="historyRecords" 
                style="width: 100%" 
                stripe 
                :default-sort="{ prop: 'loadTime', order: 'descending' }">
                    <el-table-column prop="equCode" label="Equipment id" />
                    <el-table-column prop="pageNo" label="Page" sortable />
                    <el-table-column prop="pageSize" label="Page size" sortable />
                    <el-table-column prop="loadTime" label="Loaded time" sortable />
            </el-table>
        </el-scrollbar>
    </div>
    <template #footer>
      <el-button @click="visible = false">Close</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import bus from '@/utils/bus';
import { getHistory } from '@/utils/historyStorage';

const historyRecords = ref([])

const visible = ref(false)

// 监听打开历史记录对话框事件
onMounted(() => {
  bus.on('openHistoryDialog', () => {
    visible.value = true;
  });
  bus.on('loadHistory', () => {
    historyRecords.value = getHistory()
  })
  
  // 初始化加载历史记录
  historyRecords.value = getHistory()
});
</script>

<style scoped>
</style>