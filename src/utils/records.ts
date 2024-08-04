"use server";

import { getCookie, setCookie } from "./cookie";
import { getDateString } from "./date";

const INITIAL_RECORD_VALUE = {
  people: 2,
  startStack: null,
  endStack: null,
  hands: [],
};

/* ハンドを記録 */
export const addHand = async (hand: Hand) => {
  try {
    const dateString = getDateString();
    const recordsJson = await getCookie("records");
    const records: Records = recordsJson ? JSON.parse(recordsJson) : {};
    const record = records[dateString] || INITIAL_RECORD_VALUE;
    record.hands.push(hand);
    records[dateString] = record;

    await setCookie("records", JSON.stringify(records));

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

/* 指定した日付の記録を削除 */
export const deleteRecord = async (date: string) => {
  try {
    const recordsJson = await getCookie("records");
    const records: Records = recordsJson ? JSON.parse(recordsJson) : {};
    delete records[date];

    await setCookie("records", JSON.stringify(records));

    return true;
  } catch (error) {
    console.error(error);

    return false;
  }
};
