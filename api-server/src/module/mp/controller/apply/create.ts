/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, PARAMS_ERROR, SUBMIT_EXCEED_LIMIT } from '~/constant/code';
import { TRUE, FALSE } from '~/constant/status';
import moment from 'moment';

interface RequestBody {
    community_name: string;
    house?: string;
    carport?: string;
    warehouse?: string;
    subscribed: typeof TRUE | typeof FALSE;
}

const MpApplyCreateAction = <Action>{
    router: {
        path: '/apply/create',
        method: 'post',
        authRequired: true,
        verifyIntact: true
    },
    validator: {
        body: [
            {
                name: 'community_name',
                required: true,
                max: 56
            },
            {
                name: 'house',
                max: 56
            },
            {
                name: 'carport',
                max: 56
            },
            {
                name: 'warehouse',
                max: 56
            },
            {
                name: 'subscribed',
                required: true,
                regex: /^0|1$/
            }
        ]
    },
    response: async ctx => {
        const { community_name, house, carport, warehouse, subscribed } = <RequestBody>ctx.request.body;

        if (!house && !carport && !warehouse) {
            return (ctx.body = {
                code: PARAMS_ERROR
            });
        }

        const lastInfo = await ctx.model
            .from('ipms_owner_apply')
            .where('wechat_mp_user_id', ctx.mpUserInfo.id)
            .orderBy('id', 'desc')
            .first();

        if (lastInfo && moment().isSame(moment(lastInfo.created_at), 'day')) {
            return (ctx.body = {
                code: SUBMIT_EXCEED_LIMIT,
                message: '今日已提交过业主认证'
            });
        }

        const communityInfo = await ctx.model
            .from('ipms_community_info')
            .where('name', community_name)
            .first();

        const [id] = await ctx.model.from('ipms_owner_apply').insert({
            wechat_mp_user_id: ctx.mpUserInfo.id,
            community_name,
            house: house ? house : null,
            carport: carport ? carport : null,
            warehouse: warehouse ? warehouse : null,
            community_id: communityInfo ? communityInfo.id : null,
            subscribed,
            created_at: Date.now()
        });

        ctx.body = {
            code: SUCCESS,
            data: {
                id,
                community_id: communityInfo ? communityInfo.id : null
            }
        };
    }
};

export default MpApplyCreateAction;
