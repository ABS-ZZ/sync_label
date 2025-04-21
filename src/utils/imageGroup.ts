interface ImageItem {
  collectTime: string;
  fileName: string;
  imgId: string;
  imageUrl: string;
  date?: string;
  // ... 其他属性
}

interface DayGroup {
  collectDate: string;
  imageList: ImageItem[];
}

interface PositionGroups {
  Position1: ImageItem[];
  Position2: ImageItem[];
  Position3: ImageItem[];
  Position4: ImageItem[];
  Other: ImageItem[];
}

function groupImagesByPosition(records: DayGroup[]): PositionGroups {
  const positionGroups: PositionGroups = {
      Position1: [],
      Position2: [],
      Position3: [],
      Position4: [],
      Other: []
  };

  records.forEach(dayRecord => {
    dayRecord.imageList.forEach((img, index) => {
      const imageWithDate = {
        date: dayRecord.collectDate,
        ...img
      };
      
      if (index <= 3) {
        positionGroups[`Position${index + 1}`].push(imageWithDate);
      } else {
        positionGroups.Other.push(imageWithDate);
      }
    });
  });

  return positionGroups;
}

export { groupImagesByPosition, type ImageItem, type DayGroup, type PositionGroups }; 