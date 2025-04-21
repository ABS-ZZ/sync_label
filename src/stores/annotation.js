import { defineStore } from 'pinia'

export const useAnnotationStore = defineStore('annotation', {
  state: () => {
    return {
      imageList: [],  // 图片列表
      groupedImages: {}, // 分组图片列表
      annotations: [], // 标注信息列表
      previousAnnotations: [], // 用存储上一张图片的标注信息
      labelList: [], // 标注名称列表
      currentImageIndex: -1, // 当前图片索引
      totalImageCount: 0, // 总图片数量
      currentAnnotation: null, // 当前标注
      currentAnnotationIndex: 0, // 当前标注索引
      selectedAnnotationIndex: -1, // 选中的标注索引

      warnInfoList: [], // 警告信息列表

      showGuidelines: false, // 是否显示辅助线
      isResizing: false, // 是否正在调整标注框大小
      selectedHandle: -1, // 选中的标注框

      showOnlyViewFlag: false, // 是否只查看当前标注
      onlyViewAnnotation: null, // 只查看当前标注
      onlyViewAnnotationIdx: -1, // 只查看当前标注的索引

      isAnnotationsHidden: false, // 是否隐藏标注

      defaultLabel: '' // 默认标注名称
    }
  },
  actions: {
    // annotations 相关操作
    addAnnotation(annotation) {
      this.annotations.push(annotation)
    },
    updateAnnotations(annotations) {
      this.annotations = annotations || []
    },
    // imageList 相关操作
    addImage(image) {
      this.imageList.push(image)
    },
    clearImageList() {
      this.imageList = []
    },
    // groupedImages 相关操作
    initGroupedImages(groupKey) {
      this.groupedImages[groupKey] = []
    },
    addGroupedImage(groupKey, groupImage) {
      this.groupedImages[groupKey].push(groupImage)
    },
    clearGroupedImages() {
      this.groupedImages = {}
    }
  },
  // persist: {
  //   enabled: true,
  //   strategies: [
  //     {
  //       storage: localStorage,
  //       paths: ['labelList'],
  //     },
  //   ],
  // },
})