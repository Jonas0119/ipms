/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { IpmsComponent } from '../common/component';
import { useParent } from '../common/relation';
IpmsComponent({
    classes: ['active-class', 'disabled-class'],
    relation: useParent('sidebar'),
    props: {
        dot: Boolean,
        badge: null,
        info: null,
        title: String,
        disabled: Boolean
    },
    methods: {
        onClick() {
            const { parent } = this;
            if (!parent || this.data.disabled) {
                return;
            }
            const index = parent.children.indexOf(this);
            parent.setActive(index).then(() => {
                this.$emit('click', index);
                parent.$emit('change', index);
            });
        },
        setActive(selected) {
            return this.setData({ selected });
        }
    }
});
