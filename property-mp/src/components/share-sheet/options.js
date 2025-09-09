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
        options: Array,
        showBorder: Boolean
    },
    methods: {
        onSelect(event) {
            const { index } = event.currentTarget.dataset;
            const option = this.data.options[index];
            this.$emit('select', Object.assign(Object.assign({}, option), { index }));
        }
    }
});
