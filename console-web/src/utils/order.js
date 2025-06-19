/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import moment from 'moment';

export function num(tp, stamp, id) {
    if (!stamp || !id) {
        return '';
    }

    return `${tp}${moment(stamp).format('YYYYMMDD')}${id}`;
}
