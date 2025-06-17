/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2024 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经授权禁止移除「e家宜业」和「卓佤科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';

// 这个接口已废弃，存储配置应该在后端配置文件中设置
// 前端只需要从 /storage/config 接口获取存储配置信息
const PcInitStorageAction = <Action>{
    router: {
        path: '/init/storage',
        method: 'post',
        authRequired: false
    },
    response: async ctx => {
        ctx.body = {
            code: SUCCESS,
            message: '此接口已废弃，请在后端配置文件中设置存储配置'
        };
    }
};

export default PcInitStorageAction;
