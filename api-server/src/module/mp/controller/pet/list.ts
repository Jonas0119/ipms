/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import { FALSE } from '~/constant/status';

interface RequestBody {
    page_num: number;
    page_size: number;
}

const MpPetListAction = <Action>{
    router: {
        path: '/pet/list',
        method: 'post',
        authRequired: true,
        verifyIntact: true
    },
    validator: {
        body: [
            {
                name: 'page_num',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'page_size',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size } = <RequestBody>ctx.request.body;

        const list = await ctx.model
            .from('ipms_pet')
            .leftJoin('ipms_community_info', 'ipms_community_info.id', 'ipms_pet.community_id')
            .where('wechat_mp_user_id', ctx.mpUserInfo.id)
            .andWhere('ipms_pet.remove', FALSE)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ipms_pet.id'))
            .select(
                'ipms_pet.id',
                'ipms_pet.name',
                'ipms_pet.sex',
                'ipms_pet.pet_type',
                'ipms_pet.coat_color',
                'ipms_pet.breed',
                'ipms_pet.photo',
                'ipms_pet.pet_license',
                'ipms_pet.created_at',
                'ipms_community_info.name as community_name'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ipms_pet.id', 'desc');

        const [res] = await ctx.model.select(ctx.model.raw('found_rows() AS total'));

        ctx.body = {
            code: SUCCESS,
            data: {
                list,
                total: res.total,
                page_amount: Math.ceil(res.total / page_size),
                page_num,
                page_size
            }
        };
    }
};

export default MpPetListAction;
