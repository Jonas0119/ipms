/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { CwComponent } from '../common/component';

CwComponent({
    props: {
        url: String,
        title: String,
        status: String,
        useFooterSlot: Boolean
    },
    methods: {
        goToDetail() {
            if (this.data.url) {
                wx.navigateTo({ url: this.data.url });
            }
        }
    }
});
