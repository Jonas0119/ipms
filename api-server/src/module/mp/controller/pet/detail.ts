/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';

interface RequestParams {
    id: number;
}

const MpPetDetailAction = <Action>{
    router: {
        path: '/pet/detail/:id',
        method: 'get',
        authRequired: true,
        verifyIntact: true
    },
    validator: {
        params: [
            {
                name: 'id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { id } = <RequestParams>ctx.params;

        const info = await ctx.model
            .from('ipms_pet')
            .leftJoin('ipms_community_info', 'ipms_community_info.id', 'ipms_pet.community_id')
            .select(
                'ipms_pet.id',
                'ipms_pet.name',
                'ipms_pet.sex',
                'ipms_pet.pet_type',
                'ipms_pet.coat_color',
                'ipms_pet.breed',
                'ipms_pet.photo',
                'ipms_pet.pet_license',
                'ipms_pet.pet_license_award_at',
                'ipms_community_info.name as community_name'
            )
            .where('ipms_pet.id', id)
            .where('wechat_mp_user_id', ctx.mpUserInfo.id)
            .first();

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

export default MpPetDetailAction;
