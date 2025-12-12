/* 次のPositionを算出 */
export const calcPosition = (current: string, people: number) => {
  if (people > 6) {
    if (current === "btn") return "co";
    if (current === "co") return "hj";
    if (current === "hj") return "lj";
    if (current === "lj") return "utg-0";
    if (current === "utg-0") {
      if (people === 8) return "utg-1";
      if (people === 9) return "utg-2";
      if (people === 10) return "utg-3";
      return "bb";
    }
    if (current === "bb") return "sb";
    if (current === "sb") return "btn";
  }

  if (people === 6) {
    if (current === "btn") return "co";
    if (current === "co") return "hj";
    if (current === "hj") return "utg-0";
    if (current === "utg-0") return "bb";
    if (current === "bb") return "sb";
    if (current === "sb") return "btn";
  }

  if (people === 5) {
    if (current === "btn") return "co";
    if (current === "co") return "utg-0";
    if (current === "utg-0") return "bb";
    if (current === "bb") return "sb";
    if (current === "sb") return "btn";
  }

  if (people === 4) {
    if (current === "btn") return "co";
    if (current === "co") return "bb";
    if (current === "bb") return "sb";
    if (current === "sb") return "btn";
  }

  if (people === 3) {
    if (current === "btn") return "bb";
    if (current === "bb") return "sb";
    if (current === "sb") return "btn";
  }

  if (people === 2) {
    if (current === "btn") return "bb";
    if (current === "bb") return "btn";
  }

  return current;
};
