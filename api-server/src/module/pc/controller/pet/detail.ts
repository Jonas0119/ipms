/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    id: number;
    community_id: number;
}

const MpPcDetailAction = <Action>{
    router: {
        path: '/pet/detail',
        method: 'post',
        authRequired: true,
        roles: [ROLE.CWDA],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { id, community_id } = <RequestBody>ctx.request.body;

        const info = await ctx.model
            .from('ipms_pet')
            .leftJoin('ipms_community_info', 'ipms_community_info.id', 'ipms_pet.community_id')
            .leftJoin('ipms_wechat_mp_user', 'ipms_wechat_mp_user.id', 'ipms_pet.wechat_mp_user_id')
            .select(
                'ipms_pet.id',
                'ipms_pet.wechat_mp_user_id',
                'ipms_pet.name',
                'ipms_pet.sex',
                'ipms_pet.pet_type',
                'ipms_pet.coat_color',
                'ipms_pet.breed',
                'ipms_pet.photo',
                'ipms_pet.pet_license',
                'ipms_pet.pet_license_award_at',
                'ipms_community_info.name as community_name',
                'ipms_pet.remove',
                'ipms_pet.remove_reason',
                'ipms_pet.removed_at',
                'ipms_wechat_mp_user.real_name'
            )
            .where('ipms_pet.id', id)
            .where('community_id', community_id)
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取宠物信息'
            });
        }

        const vaccinates = await ctx.model
            .from('ipms_pet_vaccinate')
            .select('vaccinated_at', 'vaccine_type')
            .where('pet_id', id)
            .orderBy('id', 'desc');

        ctx.body = {
            code: SUCCESS,
            data: {
                info,
                vaccinates
            }
        };
    }
};

export default MpPcDetailAction;
