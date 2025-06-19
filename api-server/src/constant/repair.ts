/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

export const WATER_AND_HEATING = 1;
export const ELECTRICITY = 2;
export const DOOR_AND_WINDOW = 3;
export const PUBLIC_FACILITY = 4;

// 业主提交 客服调拨 维修上门 维修完成 评价
// 1 已提交，待客服响应
// 2 分配xxx进行维修
// 3 维修人员正在赶往处置
// 4 维修完成

export const SUBMIT_REPAIR_STEP = 1;
export const ALLOT_REPAIR_STEP = 2;
export const CONFIRM_REPAIR_STEP = 3;
export const FINISH_REPAIR_STEP = 4;
