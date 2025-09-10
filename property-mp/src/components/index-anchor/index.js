/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 * +----------------------------------------------------------------------
 */

import { getRect } from '../common/utils';
import { IpmsComponent } from '../common/component';
import { useParent } from '../common/relation';
IpmsComponent({
    relation: useParent('index-bar'),
    props: {
        useSlot: Boolean,
        index: null
    },
    data: {
        active: false,
        wrapperStyle: '',
        anchorStyle: ''
    },
    methods: {
        scrollIntoView(scrollTop) {
            getRect(this, '.ipms-index-anchor-wrapper').then(rect => {
                wx.pageScrollTo({
                    duration: 0,
                    scrollTop: scrollTop + rect.top - this.parent.data.stickyOffsetTop
                });
            });
        }
    }
});
