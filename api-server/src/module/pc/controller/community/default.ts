/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, COMMUNITY_ID_NOT_EXIST, DATA_MODEL_UPDATE_FAIL } from '~/constant/code';

interface RequestBody {
    community_id: number;
}

const PcCommunityDefaultAction = <Action>{
    router: {
        path: '/community/default',
        method: 'post',
        authRequired: true
    },
    validator: {
        body: [
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { community_id } = <RequestBody>ctx.request.body;

        const exist = await ctx.model
            .from('ipms_community_info')
            .where('ipms_community_info.id', community_id)
            .first();

        if (!exist) {
            return (ctx.body = {
                code: COMMUNITY_ID_NOT_EXIST,
                message: '社区不存在'
            });
        }

        const affect = await ctx.model
            .from('ipms_property_company_user_default_community')
            .update({ community_id })
            .where({ property_company_user_id: ctx.pcUserInfo.id });

        if (affect !== 1) {
            return (ctx.body = {
                code: DATA_MODEL_UPDATE_FAIL,
                message: '设置默认社区失败'
            });
        }

        ctx.body = {
            code: SUCCESS,
            message: '设置默认社区成功'
        };
    }
};

export default PcCommunityDefaultAction;
