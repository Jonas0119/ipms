/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 */

import { CwComponent } from '../common/component';
import { BLUE, GRAY_DARK } from '../common/color';
CwComponent({
    classes: ['desc-class'],
    props: {
        icon: String,
        steps: Array,
        active: Number,
        direction: {
            type: String,
            value: 'horizontal'
        },
        activeColor: {
            type: String,
            value: BLUE
        },
        inactiveColor: {
            type: String,
            value: GRAY_DARK
        },
        activeIcon: {
            type: String,
            value: 'success'
        },
        inactiveIcon: String
    },
    methods: {
        onClick(event) {
            const { index } = event.currentTarget.dataset;
            this.$emit('click-step', index);
        }
    }
});
