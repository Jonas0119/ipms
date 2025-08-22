/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import {
    EjyyMoveCar,
    EjyyCommunityInfo,
    EjyyPropertyCompanyUser,
    EjyyPropertyCompanyDepartment,
    EjyyPropertyCompanyJob
} from '~/types/model';

interface RequestParams {
    id: number;
}

const MpMoveCarDetailAction = <Action>{
    router: {
        path: '/move_car/detail/:id',
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
        let resInfo = <EjyyPropertyCompanyUser & EjyyPropertyCompanyDepartment & EjyyPropertyCompanyJob>null;

        const info = <EjyyMoveCar & EjyyCommunityInfo>await ctx.model
            .from('ipms_move_car')
            .leftJoin('ipms_community_info', 'ipms_community_info.id', 'ipms_move_car.community_id')
            .select(
                'ipms_move_car.id',
                'ipms_move_car.car_number',
                'ipms_move_car.move_reason',
                'ipms_move_car.live_img',
                'ipms_move_car.have_concat_info',
                'ipms_move_car.response_user_id',
                'ipms_move_car.response_content',
                'ipms_move_car.responsed_at',
                'ipms_move_car.created_at',
                'ipms_community_info.name as community_name'
            )
            .where('ipms_move_car.id', id)
            .where('ipms_move_car.wechat_mp_user_id', ctx.mpUserInfo.id)
            .first();

        if (info.response_user_id) {
            resInfo = await ctx.model
                .from('ipms_property_company_user')
                .leftJoin(
                    'ipms_property_company_department',
                    'ipms_property_company_department.id',
                    'ipms_property_company_user.department_id'
                )
                .leftJoin(
                    'ipms_property_company_job',
                    'ipms_property_company_job.id',
                    'ipms_property_company_user.job_id'
                )
                .where('ipms_property_company_user.id', info.response_user_id)
                .select(
                    'ipms_property_company_user.avatar_url',
                    'ipms_property_company_department.name as department',
                    'ipms_property_company_job.name as job',
                    'ipms_property_company_user.real_name'
                )
                .first();
        }

        delete info.response_user_id;

        ctx.body = {
            code: SUCCESS,
            data: {
                ...info,
                resInfo
            }
        };
    }
};

export default MpMoveCarDetailAction;
