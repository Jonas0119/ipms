/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { useParent } from '../common/relation';
import { CwComponent } from '../common/component';
CwComponent({
    relation: useParent('row'),
    props: {
        span: Number,
        offset: Number
    }
});
