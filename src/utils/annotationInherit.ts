function generateNewId(): string {
  return Math.random().toString(36).substr(2, 9);
}

interface Annotation {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  // ... 其他标注属性
}

function inheritAnnotations(
  sourceAnnotations: Annotation[],
  targetImageId: string,
  sourceDate: string,
  targetDate: string
) {
  return sourceAnnotations.map(annotation => ({
    ...annotation,
    id: generateNewId(),
    imageId: targetImageId,
    inheritedFrom: {
      date: sourceDate,
      annotationId: annotation.id
    }
  }));
}

export { inheritAnnotations, type Annotation }; 