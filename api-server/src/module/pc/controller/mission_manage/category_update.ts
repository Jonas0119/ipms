/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, MISSION_CATEGORY_EXIST, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    id: number;
    name: string;
    description: string;
}

const PcMissionManageCategoryUpdateAction = <Action>{
    router: {
        path: '/mission_manage/category_update',
        method: 'post',
        authRequired: true,
        roles: [ROLE.XJRW]
    },
    validator: {
        body: [
            {
                name: 'id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'name',
                max: 56,
                required: true
            },
            {
                name: 'description',
                max: 128,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { id, name, description } = <RequestBody>ctx.request.body;

        const exist = await ctx.model
            .from('ipms_mission_category')
            .andWhere('id', id)
            .first();

        if (!exist) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法的任务分类'
            });
        }

        const repeat = await ctx.model
            .from('ipms_mission_category')
            .andWhere('name', name)
            .andWhereNot('id', id)
            .first();

        if (repeat) {
            return (ctx.body = {
                code: MISSION_CATEGORY_EXIST,
                message: '任务分类已存在'
            });
        }

        await ctx.model
            .from('ipms_mission_category')
            .update({
                name,
                description
            })
            .where('id', id);

        ctx.body = {
            code: SUCCESS
        };
    }
};

export default PcMissionManageCategoryUpdateAction;
