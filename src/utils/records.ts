"use server";

import { getCookie, setCookie } from "./cookie";
import { getDateString } from "./date";

const INITIAL_RECORD_VALUE = {
  people: 0,
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

/* 人数を更新 */
export const updatePeople = async (people: number) => {
  const dateString = getDateString();
  const recordsJson = await getCookie("records");
  const records: Records = recordsJson ? JSON.parse(recordsJson) : {};
  const record = records[dateString] || INITIAL_RECORD_VALUE;
  record.people = people;
  records[dateString] = record;

  await setCookie("records", JSON.stringify(records));
};
