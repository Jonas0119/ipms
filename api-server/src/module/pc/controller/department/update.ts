/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, DATA_MODEL_UPDATE_FAIL, MODEL_FIELD_VALUE_EXIST } from '~/constant/code';

interface RequestBody {
    name: string;
    id: number;
}

const PcDepartmentUpdateAction = <Action>{
    router: {
        path: '/department/update',
        method: 'post',
        authRequired: true,
        roles: []
    },
    validator: {
        body: [
            {
                name: 'name',
                required: true,
                max: 12
            },
            {
                name: 'id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { name, id } = <RequestBody>ctx.request.body;

        const exist = await ctx.model
            .from('ejyy_property_company_department')
            .where('name', name)
            .andWhere('id', '<>', id)
            .first();

        if (exist) {
            return (ctx.body = {
                code: MODEL_FIELD_VALUE_EXIST,
                message: '部门名称已存在'
            });
        }

        const affect = await ctx.model
            .from('ejyy_property_company_department')
            .update({ name })
            .where('id', id);

        if (affect !== 1) {
            return (ctx.body = {
                code: DATA_MODEL_UPDATE_FAIL,
                message: '更新部门信息失败'
            });
        }

        ctx.body = {
            code: SUCCESS,
            message: '更新部门信息成功'
        };
    }
};

export default PcDepartmentUpdateAction;
