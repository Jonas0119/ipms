/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import { BINDING_BUILDING } from '~/constant/status';

const MpFamilyListAction = <Action>{
    router: {
        path: '/family/list',
        method: 'get',
        authRequired: true,
        verifyIntact: true
    },
    response: async ctx => {
        const list = await ctx.model
            .from('ipms_wechat_mp_user')
            .whereIn('id', function() {
                this.from('ipms_user_building')
                    .whereIn('building_id', function() {
                        this.from('ipms_user_building')
                            .where('wechat_mp_user_id', ctx.mpUserInfo.id)
                            .where('status', BINDING_BUILDING)
                            .select('building_id');
                    })
                    .where('status', BINDING_BUILDING)
                    .andWhereNot('wechat_mp_user_id', ctx.mpUserInfo.id)
                    .select('wechat_mp_user_id');
            })
            .select('id', 'nick_name', 'avatar_url', 'signature');

        ctx.body = {
            code: SUCCESS,
            data: {
                list
            }
        };
    }
};

export default MpFamilyListAction;
