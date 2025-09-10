/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { IpmsComponent } from '../common/component';
import { ASSETS_HOST } from '../../config';

IpmsComponent({
    props: {
        info: Object
    },
    data: {
        ASSETS_HOST
    }
});
