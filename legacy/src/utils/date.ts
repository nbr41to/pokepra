/* 今日の日付の文字列を取得 */
export const getDateString = () => {
  const date = new Date();

  return date.toISOString().split("T")[0];
};
