<template>
    <el-main>
        <!-- 中间画布区域 -->
        <div class="canvas-container">
            <canvas
                ref="canvas"
                @mousedown="startDrawing"
                @mousemove="draw"
                @mouseup="stopDrawing"
            ></canvas>
        </div>
    </el-main>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useAnnotationStore } from "@/stores/annotation";
import { ElMessage } from "element-plus";
import bus from "@/utils/bus";
import { useSettingsStore } from "@/stores/settings";

const annotationStore = useAnnotationStore();
const settingsStore = useSettingsStore();

const canvas = ref(null);
const ctx = ref(null);
const isDrawing = ref(false);
const startPos = ref({ x: 0, y: 0 });

const currentImage = ref(null);

let t_annotations = []


onMounted(() => {
    ctx.value = canvas.value.getContext("2d");

    // 鼠标进入时显示辅助线
    canvas.value.addEventListener("mouseenter", () => {
        annotationStore.showGuidelines = true;
    });
    // 鼠标离开时隐藏辅助线
    canvas.value.addEventListener("mouseleave", () => {
        annotationStore.showGuidelines = false; // 鼠标离开时隐藏辅助线
        drawImage(); // 重新绘制以清除辅助线
    });
    // 添加鼠标移动事件监听
    canvas.value.addEventListener("mousemove", (event) => {
        if (annotationStore.showGuidelines) {
            draw(event); // 继续绘制辅助线
        }
        // 设置鼠标样式,检测鼠标是否移动到调整柄上
        handleMouseStyle(event)
    });
    // 添加右键点击事件监听
    canvas.value.addEventListener('contextmenu', handleRightClick)

    // 监听switchImage事件
    bus.on("switchImage", (idx) => {
        switchImage(idx);
    });

    // 切换标注框显示与否
    bus.on("toggleAnnotationsVisibility", () => {
        toggleAnnotationsVisibility();
    });

    // 只查看当前标注对象框
    bus.on("onlyViewCurrentAnnotation", (index) => {
        onlyViewCurrentAnnotation(index);
    });

    // 选中标注对象框
    bus.on("selectedAnnotation", (index) => {
        selectAnnotation(index);
    });

    // 提供给其他组件调用，绘制图片
    bus.on("drawImage", () => {
        drawImage()
    });
});

// 在组件卸载时清理事件监听
onUnmounted(() => {
    if (canvas.value) {
        canvas.value.removeEventListener('contextmenu', handleRightClick)
    }
})

// 开始绘制标注框
const startDrawing = (event) => {
    const pos = getMousePos(event);

    // 显示辅助线
    annotationStore.showGuidelines = true;

    // 如果当前有选中的标注框
    if (annotationStore.selectedAnnotationIndex !== -1) {
        const handleIndex = getHandleAtPosition(
            pos,
            annotationStore.annotations[annotationStore.selectedAnnotationIndex]
        );
        if (handleIndex !== -1) {
            // 点击到了调整手柄
            annotationStore.isResizing = true;
            annotationStore.selectedHandle = handleIndex;
            return;
        }
    }

    // 检查是否点击到了已有的标注框
    const annotationIndex = getAnnotationAtPosition(pos);
    if (annotationIndex !== -1) {
        // 点击到了已有的标注框，选中它
        annotationStore.selectedAnnotationIndex = annotationIndex;
        drawImage();
        return;
    }

    // 没有点击到已有标注框，开始绘制新框
    startPos.value = pos;
    isDrawing.value = true;
    annotationStore.selectedAnnotationIndex = -1; // 取消当前选中
};

// 实时绘制标注框
const draw = (event) => {
    const currentPos = getMousePos(event);

    drawImage();

    if (annotationStore.showGuidelines) {
        drawGuidelines(currentPos);
    }

    if (
        annotationStore.isResizing &&
        annotationStore.selectedAnnotationIndex !== -1
    ) {
        const annotation =
            annotationStore.annotations[
                annotationStore.selectedAnnotationIndex
            ];
        // 先反归一化以进行调整
        const displayAnnotation = denormalizeAnnotation(
            annotation,
            canvas.value.width,
            canvas.value.height
        );
        const handle = annotationStore.selectedHandle;

        // 使用原有的调整逻辑，但操作反归一化后的坐标
        switch (handle) {
            case 0: // 左上
                displayAnnotation.width += displayAnnotation.x - currentPos.x;
                displayAnnotation.height += displayAnnotation.y - currentPos.y;
                displayAnnotation.x = currentPos.x;
                displayAnnotation.y = currentPos.y;
                break;
            case 1: // 上中
                displayAnnotation.height += displayAnnotation.y - currentPos.y;
                displayAnnotation.y = currentPos.y;
                break;
            case 2: // 右上
                displayAnnotation.width = currentPos.x - displayAnnotation.x;
                displayAnnotation.height += displayAnnotation.y - currentPos.y;
                displayAnnotation.y = currentPos.y;
                break;
            case 3: // 左中
                displayAnnotation.width += displayAnnotation.x - currentPos.x;
                displayAnnotation.x = currentPos.x;
                break;
            case 4: // 右中
                displayAnnotation.width = currentPos.x - displayAnnotation.x;
                break;
            case 5: // 左下
                displayAnnotation.width += displayAnnotation.x - currentPos.x;
                displayAnnotation.height = currentPos.y - displayAnnotation.y;
                displayAnnotation.x = currentPos.x;
                break;
            case 6: // 下中
                displayAnnotation.height = currentPos.y - displayAnnotation.y;
                break;
            case 7: // 右下
                displayAnnotation.width = currentPos.x - displayAnnotation.x;
                displayAnnotation.height = currentPos.y - displayAnnotation.y;
                break;
        }

        // 确保宽度高度不为负数
        if (displayAnnotation.width < 0) {
            displayAnnotation.x += displayAnnotation.width;
            displayAnnotation.width = Math.abs(displayAnnotation.width);
        }
        if (displayAnnotation.height < 0) {
            displayAnnotation.y += displayAnnotation.height;
            displayAnnotation.height = Math.abs(displayAnnotation.height);
        }

        // 调整完成后重新归一化并更新
        const normalizedAnnotation = normalizeAnnotation(
            displayAnnotation,
            canvas.value.width,
            canvas.value.height
        );
        Object.assign(annotation, normalizedAnnotation);

        drawImage();
        if (annotationStore.selectedAnnotationIndex !== -1) {
            const currentDisplayAnnotation = denormalizeAnnotation(
                annotationStore.annotations[
                    annotationStore.selectedAnnotationIndex
                ],
                canvas.value.width,
                canvas.value.height
            );
            drawResizeHandles(currentDisplayAnnotation);
        }
        return;
    }

    if (!isDrawing.value) return;

    annotationStore.currentAnnotation = {
        x: Math.min(startPos.value.x, currentPos.x),
        y: Math.min(startPos.value.y, currentPos.y),
        width: Math.abs(currentPos.x - startPos.value.x),
        height: Math.abs(currentPos.y - startPos.value.y),
    };

    if (annotationStore.currentAnnotation) {
        drawAnnotation(
            normalizeAnnotation(
                annotationStore.currentAnnotation,
                canvas.value.width,
                canvas.value.height
            )
        );
    }
};

// 加载图片到canvas
const drawImage = () => {
    clearAndLoadImage();

    // draw会一直触发，所有需要用一个阀门来控制
    // 如果只查看当前标注对象框为真，则只绘制当前标注对象框
    if (annotationStore.showOnlyViewFlag) {
        drawAnnotation(annotationStore.onlyViewAnnotation);
    } else {
        // 只在未隐藏时绘制所有的标注框
        if (!annotationStore.isAnnotationsHidden) {
            annotationStore.annotations.forEach((annotation) => {
                drawAnnotation(annotation);
            });
        } else {
            // 如果是隐藏模式，就只绘制新增的标注框
            if ( annotationStore.annotations.length > t_annotations.length ) {
                for ( let i = t_annotations.length; i < annotationStore.annotations.length; i++ ) {
                    drawAnnotation(annotationStore.annotations[i]);
                }
            }
        }
    }
};

// 停止绘制标注框，保存时归一化坐标
const stopDrawing = () => {
    if (
        annotationStore.isResizing &&
        annotationStore.selectedAnnotationIndex !== -1
    ) {
        annotationStore.isResizing = false;
        annotationStore.selectedHandle = null;
        return;
    }

    if (!isDrawing.value) return;

    // 如果标注框两边都小于10，则取消绘制
    // if (currentAnnotation.value.width < 10 && currentAnnotation.value.height < 10) {
    //   ElMessage.warning('标注框太小，请重新绘制')
    //   isDrawing.value = false;
    //   currentAnnotation.value = null;
    //   return
    // }

    if (annotationStore.currentAnnotation) {
        if (
            annotationStore.currentAnnotation.width < 10 &&
            annotationStore.currentAnnotation.height < 10
        ) {
            ElMessage.warning("标注框太小，请重新绘制");
        } else {
            // 归一化后再保存
            const normalizedAnnotation = normalizeAnnotation(
                annotationStore.currentAnnotation,
                canvas.value.width,
                canvas.value.height
            );
            annotationStore.addAnnotation({
                ...normalizedAnnotation,
                label: annotationStore.defaultLabel,
            });
        }
    }

    isDrawing.value = false;
    annotationStore.currentAnnotation = null;

    // 标注列表滚动到底部
    bus.emit("scrollBottom")
};

// 绘制标注框，绘制时反归一化坐标
const drawAnnotation = (annotation) => {
    if (!currentImage.value) {
        return;
    }
    // 反归一化坐标用于绘制
    const displayAnnotation = denormalizeAnnotation(
        annotation,
        canvas.value.width,
        canvas.value.height
    );

    const isSelected = annotationStore.selectedAnnotationIndex !== -1 &&
        annotationStore.annotations[annotationStore.selectedAnnotationIndex] === annotation;

    // 使用反归一化后的坐标绘制
    // 如果显示标注框遮罩，则绘制半透明的灰色矩形
    if (settingsStore.showMask) {
        ctx.value.fillStyle = isSelected
            ? "rgba(255, 165, 0, 0.1)"
            : "rgba(255, 165, 0, 0.1)";
        ctx.value.fillRect(
            displayAnnotation.x,
            displayAnnotation.y,
            displayAnnotation.width,
            displayAnnotation.height
        );
    }

    // 绘制标注框边框
    // ctx.value.strokeStyle = isSelected ? '#ffa500' : '#ffa500';
    ctx.value.strokeStyle = settingsStore.annotationBorderColor;
    ctx.value.lineWidth = isSelected ? 3 : 1;
    ctx.value.strokeRect(
        displayAnnotation.x,
        displayAnnotation.y,
        displayAnnotation.width,
        displayAnnotation.height
    );

    // 如果选中，则绘制调整手柄
    if (isSelected) {
        drawResizeHandles(displayAnnotation);
    }

    // 如果显示标注名称，则绘制标注名称
    if (settingsStore.showLabels && annotation.label) {
        ctx.value.font = "13px Arial";
        // ctx.value.fillStyle = isSelected ? '#ff0000' : '#ffa500'
        ctx.value.fillStyle = settingsStore.annotationNameColor;
        ctx.value.fillText(
            annotation.label,
            displayAnnotation.x,
            displayAnnotation.y - 5
        );
    }
};

// 切换图片
const switchImage = (index) => {
    if (annotationStore.currentImageIndex !== -1) {
        // 保存当前图片的标注
        annotationStore.imageList[
            annotationStore.currentImageIndex
        ].annotations = [...annotationStore.annotations];
        annotationStore.previousAnnotations = [...annotationStore.annotations]; // 保存当前标注为上一张图片的标注
    }

    annotationStore.currentImageIndex = index;
    currentImage.value = annotationStore.imageList[index].image;
    annotationStore.annotations =
        annotationStore.imageList[index].annotations || [];

    // 获取容器尺寸
    const container = canvas.value.parentElement;
    const containerWidth = container.clientWidth - 40; // 减去padding
    const containerHeight = container.clientHeight - 40;

    // 计算适合容器的图片尺寸
    const imageAspectRatio =
        currentImage.value.width / currentImage.value.height;
    const containerAspectRatio = containerWidth / containerHeight;

    let canvasWidth, canvasHeight;

    if (imageAspectRatio > containerAspectRatio) {
        // 图片更宽，以容器宽度为准
        canvasWidth = containerWidth;
        canvasHeight = containerWidth / imageAspectRatio;
    } else {
        // 图片更高，以容器高度为准
        canvasHeight = containerHeight;
        canvasWidth = containerHeight * imageAspectRatio;
    }

    // 设置 canvas 尺寸
    canvas.value.width = canvasWidth;
    canvas.value.height = canvasHeight;

    drawImage();
};

// 添加右键点击处理函数
const handleRightClick = (event) => {  
    // 检查是否启用了右键切换功能
    if (settingsStore.enableRightClickNext) {
        // 阻止默认的右键菜单
        event.preventDefault()
        // 调用切换下一张图片的方法
        if (annotationStore.currentImageIndex < annotationStore.imageList.length - 1) {
            switchImage(annotationStore.currentImageIndex + 1);
        }
    }
}

// 绘制辅助线的函数
const drawGuidelines = (pos) => {
    ctx.value.save(); // 保存当前状态
    ctx.value.setLineDash([5, 5]); // 设置虚线样式
    ctx.value.strokeStyle = settingsStore.gridLineColor; // 设置颜色
    ctx.value.lineWidth = 1; // 设置线宽

    // 绘制横线
    ctx.value.beginPath();
    ctx.value.moveTo(0, pos.y);
    ctx.value.lineTo(canvas.value.width, pos.y);
    ctx.value.stroke();

    // 绘制竖线
    ctx.value.beginPath();
    ctx.value.moveTo(pos.x, 0);
    ctx.value.lineTo(pos.x, canvas.value.height);
    ctx.value.stroke();

    ctx.value.restore(); // 恢复状态
};

// 清除并加载图片
const clearAndLoadImage = () => {
    if (!checkHasImage()) {
        return;
    }

    // 清除整个画布
    ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);

    // 绘制图片
    ctx.value.drawImage(
        currentImage.value,
        0,
        0,
        canvas.value.width,
        canvas.value.height
    );
};

// 检查是否有图片
const checkHasImage = () => {
    if (!currentImage.value || !ctx.value) {
        // 清除整个画布
        ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);

        // 显示提示文字
        ctx.value.fillStyle = "rgba(0, 0, 0, 0.7)"; // 设置文字颜色
        ctx.value.font = "20px Arial"; // 设置字体大小
        ctx.value.textAlign = "center"; // 设置文本对齐方式
        ctx.value.fillText(
            "Please upload image",
            canvas.value.width / 2,
            canvas.value.height / 2
        ); // 绘制提示文字
        return false;
    }
    return true;
};

// 获取鼠标在 Canvas 上的实际位置
const getMousePos = (event) => {
    const rect = canvas.value.getBoundingClientRect();
    // 计算缩放比例
    const scaleX = canvas.value.width / rect.width;
    const scaleY = canvas.value.height / rect.height;

    return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
    };
};

// 选择标注
const selectAnnotation = (index) => {
    annotationStore.selectedAnnotationIndex = index;
    drawImage();
    drawResizeHandles(annotationStore.annotations[index]);
};

// 修改归一化函数，严格按照YOLO格式计算（使用中心点坐标）
const normalizeAnnotation = (annotation, canvasWidth, canvasHeight) => {
    if (!currentImage.value) {
        return;
    }
    const imageWidth = currentImage.value.width;
    const imageHeight = currentImage.value.height;

    // 计算缩放比例
    const scaleX = imageWidth / canvasWidth;
    const scaleY = imageHeight / canvasHeight;

    // 计算在原始图片上的实际坐标
    const actualX = annotation.x * scaleX;
    const actualY = annotation.y * scaleY;
    const actualWidth = annotation.width * scaleX;
    const actualHeight = annotation.height * scaleY;

    // 转换为YOLO格式（中心点坐标和宽高的比例）
    return {
        // 中心点的x��标
        x: (actualX + actualWidth / 2) / imageWidth,
        // 中心点的y坐标
        y: (actualY + actualHeight / 2) / imageHeight,
        // 宽度比例
        width: actualWidth / imageWidth,
        // 高度比例
        height: actualHeight / imageHeight,
        label: annotation.label,
    };
};

// 绘制调整标注框大小的手柄函数
const drawResizeHandles = (annotation) => {
    const handleSize = 10; // 手柄的大小
    const handles = [
        // 这里取消各个边的中点，只保留四个角，但是各个中点还是可以操作的只是看不到而已
        { x: annotation.x, y: annotation.y }, // 左上
        // { x: annotation.x + annotation.width / 2, y: annotation.y }, // 上中
        { x: annotation.x + annotation.width, y: annotation.y }, // 右上
        // { x: annotation.x, y: annotation.y + annotation.height / 2 }, // 左中
        // { x: annotation.x + annotation.width, y: annotation.y + annotation.height / 2 }, // 右中
        { x: annotation.x, y: annotation.y + annotation.height }, // 左下
        // { x: annotation.x + annotation.width / 2, y: annotation.y + annotation.height }, // 下中
        {
            x: annotation.x + annotation.width,
            y: annotation.y + annotation.height,
        }, // 右下
    ];

    ctx.value.fillStyle = "rgba(255, 255, 255, 0)"; // 半透明白色填充
    ctx.value.strokeStyle = "#0000ff"; // 蓝色边框
    ctx.value.lineWidth = 1; // 设置边框的粗细

    handles.forEach((handle) => {
        // 绘制透明的白色矩形
        ctx.value.fillRect(
            handle.x - handleSize / 2,
            handle.y - handleSize / 2,
            handleSize,
            handleSize
        );
        // 绘制蓝色边框
        ctx.value.strokeRect(
            handle.x - handleSize / 2,
            handle.y - handleSize / 2,
            handleSize,
            handleSize
        );
    });
};

// 处理鼠标样式
const handleMouseStyle = (event) => {
    const pos = getMousePos(event);
    
    // 如果有选中的标注框
    if (annotationStore.selectedAnnotationIndex !== -1) {
        const annotation = annotationStore.annotations[annotationStore.selectedAnnotationIndex];
        
        // 检查鼠标是否在手柄上
        const handleIndex = getHandleAtPosition(pos, annotation);
        
        if (handleIndex !== -1) {
            // 根据手柄位置设置不同的鼠标样式
            // 左上/右下角：nw-resize/se-resize
            // 右上/左下角：ne-resize/sw-resize
            // 上/下边中点：n-resize/s-resize
            // 左/右边中点：w-resize/e-resize
            switch (handleIndex) {
                case 0: // 左上
                    canvas.value.style.cursor = 'nw-resize';
                    break;
                case 1: // 上中
                    canvas.value.style.cursor = 'n-resize';
                    break;
                case 2: // 右上
                    canvas.value.style.cursor = 'ne-resize';
                    break;
                case 3: // 左中
                    canvas.value.style.cursor = 'w-resize';
                    break;
                case 4: // 右中
                    canvas.value.style.cursor = 'e-resize';
                    break;
                case 5: // 左下
                    canvas.value.style.cursor = 'sw-resize';
                    break;
                case 6: // 下中
                    canvas.value.style.cursor = 's-resize';
                    break;
                case 7: // 右下
                    canvas.value.style.cursor = 'se-resize';
                    break;
            }
            return;
        }
    }
    
    // 如果鼠标不在手柄上，恢复默认鼠标样式
    canvas.value.style.cursor = 'default';
};

// 修改反归一化函数，从YOLO格式转换回显示坐标
const denormalizeAnnotation = (annotation, canvasWidth, canvasHeight) => {
    if (!currentImage.value) {
        return;
    }
    const imageWidth = currentImage.value.width;
    const imageHeight = currentImage.value.height;

    // 计算缩放比例
    const scaleX = canvasWidth / imageWidth;
    const scaleY = canvasHeight / imageHeight;

    // 从YOLO格式（中心点）转换回左上角坐标
    const centerX = annotation.x * imageWidth;
    const centerY = annotation.y * imageHeight;
    const width = annotation.width * imageWidth;
    const height = annotation.height * imageHeight;

    return {
        // 转换回左上角坐标并应用缩放
        x: (centerX - width / 2) * scaleX,
        y: (centerY - height / 2) * scaleY,
        width: width * scaleX,
        height: height * scaleY,
        label: annotation.label,
    };
};

// 获取当前点击的是哪一个调整柄
const getHandleAtPosition = (pos, annotation) => {
    const handleSize = 8;
    // 将归一化的坐标转换为实际坐标
    const displayAnnotation = denormalizeAnnotation(
        annotation,
        canvas.value.width,
        canvas.value.height
    );

    const handles = [
        { x: displayAnnotation.x, y: displayAnnotation.y }, // 左上
        {
            x: displayAnnotation.x + displayAnnotation.width / 2,
            y: displayAnnotation.y,
        }, // 上中
        {
            x: displayAnnotation.x + displayAnnotation.width,
            y: displayAnnotation.y,
        }, // 右上
        {
            x: displayAnnotation.x,
            y: displayAnnotation.y + displayAnnotation.height / 2,
        }, // 左中
        {
            x: displayAnnotation.x + displayAnnotation.width,
            y: displayAnnotation.y + displayAnnotation.height / 2,
        }, // 右中
        {
            x: displayAnnotation.x,
            y: displayAnnotation.y + displayAnnotation.height,
        }, // 左下
        {
            x: displayAnnotation.x + displayAnnotation.width / 2,
            y: displayAnnotation.y + displayAnnotation.height,
        }, // 下中
        {
            x: displayAnnotation.x + displayAnnotation.width,
            y: displayAnnotation.y + displayAnnotation.height,
        }, // 右下
    ];

    for (let i = 0; i < handles.length; i++) {
        const handle = handles[i];
        if (
            pos.x >= handle.x - handleSize / 2 &&
            pos.x <= handle.x + handleSize / 2 &&
            pos.y >= handle.y - handleSize / 2 &&
            pos.y <= handle.y + handleSize / 2
        ) {
            return i;
        }
    }
    return -1;
};

// 修改检测点是否在标注框内的函数
const getAnnotationAtPosition = (pos) => {
    // 从后向前检查，这样可以选中最上层的框
    for (let i = annotationStore.annotations.length - 1; i >= 0; i--) {
        const annotation = annotationStore.annotations[i];
        // 将归一化的坐标转换为实际坐标再进行检查
        const displayAnnotation = denormalizeAnnotation(
            annotation,
            canvas.value.width,
            canvas.value.height
        );

        if (
            pos.x >= displayAnnotation.x &&
            pos.x <= displayAnnotation.x + displayAnnotation.width &&
            pos.y >= displayAnnotation.y &&
            pos.y <= displayAnnotation.y + displayAnnotation.height
        ) {
            return i;
        }
    }
    return -1;
};

// 添加切换标注显示/隐藏的方法
const toggleAnnotationsVisibility = () => {
  // 取消所有标注的只查看状态
  annotationStore.showOnlyView = false
  annotationStore.onlyViewAnnotationIdx = -1
  annotationStore.onlyViewAnnotation = null
  // 切换标注的隐藏状态
  annotationStore.isAnnotationsHidden = !annotationStore.isAnnotationsHidden
  // 清空标注历史
  t_annotations.splice(0, t_annotations.length)
  // 更新标注历史
  t_annotations = [...annotationStore.annotations]
  // 重新绘制图片
  drawImage()
}

// 只查看当前标注对象框
const onlyViewCurrentAnnotation = (index) => {
  // 如果index和当前只查看的标注框索引相同，则取消只查看状态
  if (annotationStore.onlyViewAnnotationIdx === index) {
    annotationStore.showOnlyView = false
    annotationStore.onlyViewAnnotationIdx = -1
    annotationStore.onlyViewAnnotation = null
    drawImage()
  } else {
    // 否则设置只查看状态
    annotationStore.showOnlyView = true
    annotationStore.onlyViewAnnotationIdx = index
    clearAndLoadImage()
    // 只绘制当前标注框
    annotationStore.onlyViewAnnotation = annotationStore.annotations[index]
    drawAnnotation(annotationStore.onlyViewAnnotation)
  }
}
</script>

<style lang="less" scoped>
.el-main {
    width: 100%;
    height: calc(100vh - 80px);
    padding: 0;
    overflow: hidden;
    background-color: #ffffff;
}

.canvas-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: #fafafa;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    min-height: 0;
}

canvas {
    border: 1px solid #ccc;
    background-color: #ffffff;
    max-width: 100%;
    max-height: 100%;
}
</style>
