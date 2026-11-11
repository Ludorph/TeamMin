export const ELEMENTS = ["목", "화", "토", "금", "수"];

const ELEMENT_CLASS = { 목: "el-wood", 화: "el-fire", 토: "el-earth", 금: "el-metal", 수: "el-water" };
export const elementClass = (el) => ELEMENT_CLASS[el] ?? "";

export const MIN_YEAR = 1900;
export const MAX_YEAR = 2050;
