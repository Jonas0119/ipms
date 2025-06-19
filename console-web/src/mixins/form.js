/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { FORM_ADAPT_WIDTH } from '@/config';

export default {
    data() {
        return {
            labelWidth: 160,
            winWidth: window.innerWidth
        };
    },
    created() {
        window.addEventListener('resize', this.onResize, false);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.onResize);
    },
    methods: {
        onResize() {
            this.winWidth = window.innerWidth;
        }
    },
    computed: {
        mlabelPostion() {
            return this.winWidth > FORM_ADAPT_WIDTH ? 'right' : 'top';
        },
        mlabelWidth() {
            return this.winWidth > FORM_ADAPT_WIDTH ? this.labelWidth : null;
        }
    }
};
