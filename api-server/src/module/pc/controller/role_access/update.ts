/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, DATA_MODEL_UPDATE_FAIL, MODEL_FIELD_VALUE_EXIST } from '~/constant/code';
import { Role } from '~/constant/role_access';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    content: typeof Role[];
    name: string;
    id: number;
}

const PcRoleAccessUpdateAction = <Action>{
    router: {
        path: '/role_access/update',
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
                name: 'content',
                required: true,
                validator: val => Array.isArray(val) && val.every(id => Object.values(ROLE).includes(id))
            }
        ]
    },
    response: async ctx => {
        const { content, name, id } = <RequestBody>ctx.request.body;

        const exist = await ctx.model
            .from('ipms_property_company_access')
            .where('name', name)
            .andWhere('id', '<>', id)
            .first();

        if (exist) {
            return (ctx.body = {
                code: MODEL_FIELD_VALUE_EXIST,
                message: '权限名称已存在'
            });
        }

        const affect = await ctx.model
            .from('ipms_property_company_access')
            .update({
                name,
                content: JSON.stringify(content)
            })
            .where('id', id);

        if (affect !== 1) {
            return (ctx.body = {
                code: DATA_MODEL_UPDATE_FAIL,
                message: '更新权限失败'
            });
        }

        ctx.body = {
            code: SUCCESS,
            message: '更新权限成功'
        };
    }
};

export default PcRoleAccessUpdateAction;
