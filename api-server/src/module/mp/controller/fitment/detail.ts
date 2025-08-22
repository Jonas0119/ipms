/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import {
    EjyyFitment,
    EjyyCommunityInfo,
    EjyyBuildingInfo,
    EjyyCommunitySetting,
    EjyyPropertyCompanyUser,
    EjyyPropertyCompanyDepartment,
    EjyyPropertyCompanyJob
} from '~/types/model';
import { PROPERTY_COMPANY_ALLOW_STEP, PROPERTY_COMPANY_CONFIRM_STEP } from '~/constant/fitment';

interface RequestParams {
    id: number;
}

const MpFitmentDetailAction = <Action>{
    router: {
        path: '/fitment/detail/:id',
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
        let agreeInfo = <EjyyPropertyCompanyUser & EjyyPropertyCompanyDepartment & EjyyPropertyCompanyJob>null;
        let confirmInfo = <EjyyPropertyCompanyUser & EjyyPropertyCompanyDepartment & EjyyPropertyCompanyJob>null;
        let returnInfo = <EjyyPropertyCompanyUser & EjyyPropertyCompanyDepartment & EjyyPropertyCompanyJob>null;

        const detail = <EjyyFitment & EjyyCommunityInfo & EjyyBuildingInfo & EjyyCommunitySetting>await ctx.model
            .from('ipms_fitment')
            .leftJoin('ipms_community_setting', 'ipms_community_setting.community_id', 'ipms_fitment.community_id')
            .leftJoin('ipms_community_info', 'ipms_community_info.id', 'ipms_fitment.community_id')
            .leftJoin('ipms_building_info', 'ipms_building_info.id', 'ipms_fitment.building_id')
            .where('ipms_fitment.id', id)
            .where('ipms_fitment.wechat_mp_user_id', ctx.mpUserInfo.id)
            .select(
                'ipms_community_setting.fitment_pledge',
                'ipms_community_info.name as community_name',
                'ipms_building_info.type',
                'ipms_building_info.area',
                'ipms_building_info.building',
                'ipms_building_info.unit',
                'ipms_building_info.number',
                'ipms_fitment.id',
                'ipms_fitment.step',
                'ipms_fitment.agree_user_id',
                'ipms_fitment.agreed_at',
                'ipms_fitment.cash_deposit',
                'ipms_fitment.finished_at',
                'ipms_fitment.confirm_user_id',
                'ipms_fitment.confirmed_at',
                'ipms_fitment.return_name',
                'ipms_fitment.return_bank',
                'ipms_fitment.return_bank_id',
                'ipms_fitment.return_operate_user_id',
                'ipms_fitment.is_return_cash_deposit',
                'ipms_fitment.returned_at',
                'ipms_fitment.created_at'
            )
            .first();

        if (detail.step >= PROPERTY_COMPANY_ALLOW_STEP) {
            agreeInfo = await ctx.model
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
                .where('ipms_property_company_user.id', detail.agree_user_id)
                .select(
                    'ipms_property_company_user.avatar_url',
                    'ipms_property_company_department.name as department',
                    'ipms_property_company_job.name as job',
                    'ipms_property_company_user.real_name'
                )
                .first();
        }

        if (detail.step >= PROPERTY_COMPANY_CONFIRM_STEP) {
            confirmInfo = await ctx.model
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
                .where('ipms_property_company_user.id', detail.confirm_user_id)
                .select(
                    'ipms_property_company_user.avatar_url',
                    'ipms_property_company_department.name as department',
                    'ipms_property_company_job.name as job',
                    'ipms_property_company_user.real_name'
                )
                .first();

            if (detail.is_return_cash_deposit) {
                returnInfo = await ctx.model
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
                    .where('ipms_property_company_user.id', detail.return_operate_user_id)
                    .select(
                        'ipms_property_company_user.avatar_url',
                        'ipms_property_company_department.name as department',
                        'ipms_property_company_job.name as job',
                        'ipms_property_company_user.real_name'
                    )
                    .first();
            }
        }

        delete detail.agree_user_id;
        delete detail.confirm_user_id;
        delete detail.return_operate_user_id;

        ctx.body = {
            code: SUCCESS,
            data: {
                ...detail,
                agreeInfo,
                confirmInfo,
                returnInfo
            }
        };
    }
};

export default MpFitmentDetailAction;
