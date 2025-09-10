/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { IpmsComponent } from '../common/component';
IpmsComponent({
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
