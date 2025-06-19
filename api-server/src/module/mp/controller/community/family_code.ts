/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import { AUTHENTICTED_BY_FAMILY } from '~/constant/authenticated_type';
import utils from '~/utils';
import config from '~/config';

interface RequestBody {
    building_ids: [];
}

const MpCommunityFamliyCodeAction = <Action>{
    router: {
        path: '/community/family_code',
        method: 'post',
        authRequired: true,
        verifyIntact: true
    },
    validator: {
        body: [
            {
                name: 'building_ids',
                validator: val => {
                    return Array.isArray(val) && val.every(num => /^\d+$/.test(num));
                },
                required: true
            }
        ]
    },
    response: async ctx => {
        const { building_ids } = <RequestBody>ctx.request.body;

        const content = utils.community.encrypt(building_ids, AUTHENTICTED_BY_FAMILY, ctx.mpUserInfo.id);

        ctx.body = {
            code: SUCCESS,
            data: {
                ...content,
                expire: config.community.expire
            }
        };
    }
};

export default MpCommunityFamliyCodeAction;
