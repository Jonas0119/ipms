/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { getCurrentPage } from '../common/utils';
function onPageScroll(event) {
    const { cwPageScroller = [] } = getCurrentPage();
    cwPageScroller.forEach(scroller => {
        if (typeof scroller === 'function') {
            // @ts-ignore
            scroller(event);
        }
    });
}
export const pageScrollMixin = scroller =>
    Behavior({
        attached() {
            const page = getCurrentPage();
            if (Array.isArray(page.cwPageScroller)) {
                page.cwPageScroller.push(scroller.bind(this));
            } else {
                page.cwPageScroller =
                    typeof page.onPageScroll === 'function'
                        ? [page.onPageScroll.bind(page), scroller.bind(this)]
                        : [scroller.bind(this)];
            }
            page.onPageScroll = onPageScroll;
        },
        detached() {
            var _a;
            const page = getCurrentPage();
            page.cwPageScroller =
                ((_a = page.cwPageScroller) === null || _a === void 0
                    ? void 0
                    : _a.filter(item => item !== scroller)) || [];
        }
    });
