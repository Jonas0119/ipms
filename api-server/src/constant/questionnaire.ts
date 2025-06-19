/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

export const SIGNLE_CHOICE = 1;
export const MULTIPLE_CHOICE = 2;

export interface Question {
    title: string;
    type: typeof SIGNLE_CHOICE | typeof MULTIPLE_CHOICE;
    options: string[];
}
