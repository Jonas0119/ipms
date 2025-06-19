/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import moment from 'moment';

export function num(tp: string, stamp: number, id: number): string {
    return `${tp}${moment(stamp).format('YYYYMMDD')}${id}`;
}
