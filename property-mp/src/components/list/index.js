/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 */

import { CwComponent } from '../common/component';

CwComponent({
    props: {
        fetching: Boolean,
        page_num: Number,
        page_amount: Number,
        list: Array,
        empty: String,
        icon: {
            type: String,
            value: 'empty'
        },
        fixed: {
            type: Boolean,
            value: true
        },
        inTabPage: {
            type: Boolean,
            value: false
        },
        useEmptySlot: Boolean,
        withFilter: Boolean
    },
    data: {
        page_size: 5
    }
});
