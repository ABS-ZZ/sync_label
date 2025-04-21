const HISTORY_KEY = 'imageLoadHistory';

export const saveHistory = (history) => {
  const existingHistory = getHistory();
  existingHistory.push(history);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(existingHistory));
};

export const getHistory = () => {
  const history = localStorage.getItem(HISTORY_KEY);
  return history ? JSON.parse(history) : [];
};

export const clearHistory = () => {
  localStorage.removeItem(HISTORY_KEY);
}; 