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
interface RequestBody {
    vaccinated_at: number;
    vaccine_type: string;
}

const MpPetVaccinateAction = <Action>{
    router: {
        path: '/pet/vaccinate/:id',
        method: 'post',
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
        ],
        body: [
            {
                name: 'vaccinated_at',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'vaccine_type',
                required: true,
                max: 32
            }
        ]
    },
    response: async ctx => {
        const { id } = <RequestParams>ctx.params;
        const { vaccinated_at, vaccine_type } = <RequestBody>ctx.request.body;

        const [aid] = await ctx.model.from('ipms_pet_vaccinate').insert({
            vaccinated_at,
            vaccine_type,
            pet_id: id,
            created_at: Date.now()
        });

        ctx.body = {
            code: SUCCESS,
            data: {
                id: aid
            }
        };
    }
};

export default MpPetVaccinateAction;
