/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { IpmsComponent } from '../common/component';
import { useChildren } from '../common/relation';
IpmsComponent({
    relation: useChildren('col', function(target) {
        const { gutter } = this.data;
        if (gutter) {
            target.setData({ gutter });
        }
    }),
    props: {
        gutter: {
            type: Number,
            observer: 'setGutter'
        }
    },
    methods: {
        setGutter() {
            this.children.forEach(col => {
                col.setData(this.data);
            });
        }
    }
});
