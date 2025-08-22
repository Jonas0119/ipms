/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import Knex from 'knex';
import { TRUE, FALSE } from '~/constant/status';
import config from '~/config';

interface Community {
    community_id: number;
    name: string;
    access_nfc: typeof TRUE | typeof FALSE;
    access_qrcode: typeof TRUE | typeof FALSE;
    access_remote: typeof TRUE | typeof FALSE;
    fitment_pledge: typeof TRUE | typeof FALSE;
}

interface PostInfo {
    department: string;
    job: string;
    community_list: Community[];
    default_community_id: number;
    wechat_payment: 0 | 1;
}

export async function postInfo(model: Knex, userId: number): Promise<PostInfo> {
    const info = await model
        .from('ipms_property_company_user')
        .leftJoin(
            'ipms_property_company_department',
            'ipms_property_company_department.id',
            'ipms_property_company_user.department_id'
        )
        .leftJoin('ipms_property_company_job', 'ipms_property_company_job.id', 'ipms_property_company_user.job_id')
        .where('ipms_property_company_user.id', userId)
        .select('ipms_property_company_department.name as department', 'ipms_property_company_job.name as job')
        .first();

    const communityList = info
        ? await model
              .from('ipms_community_info')
              .leftJoin('ipms_community_setting', 'ipms_community_setting.community_id', 'ipms_community_info.id')
              .orWhereIn('ipms_community_info.id', function() {
                  this.from('ipms_property_company_user_access_community')
                      .where('property_company_user_id', userId)
                      .select('community_id');
              })
              .select(
                  'ipms_community_setting.community_id',
                  'ipms_community_setting.access_nfc',
                  'ipms_community_setting.access_qrcode',
                  'ipms_community_setting.access_remote',
                  'ipms_community_setting.fitment_pledge',
                  'ipms_community_info.name'
              )
        : [];

    const defaultInfo = await model
        .from('ipms_property_company_user_default_community')
        .where('property_company_user_id', userId)
        .select('community_id')
        .first();

    let default_community_id = defaultInfo ? defaultInfo.community_id : null;

    if (!default_community_id) {
        if (communityList.length > 0) {
            default_community_id = communityList[0].community_id;

            await model.from('ipms_property_company_user_default_community').insert({
                property_company_user_id: userId,
                community_id: default_community_id
            });
        }
    } else {
        if (communityList.length > 0) {
            if (!communityList.some(({ community_id }) => community_id === defaultInfo.community_id)) {
                default_community_id = communityList[0].community_id;

                await model
                    .from('ipms_property_company_user_default_community')
                    .update({
                        community_id: default_community_id
                    })
                    .where('property_company_user_id', userId);
            }
        }
    }

    return {
        department: info ? info.department : null,
        job: info ? info.job : null,
        community_list: communityList,
        default_community_id,
        wechat_payment: config.wechat.pay.mch_id ? 1 : 0
    };
}

export async function verifyCommunity(model: Knex, user_id: number, community_id: number): Promise<boolean> {
    if (!community_id) {
        return false;
    }

    const haveAccess = await model
        .from('ipms_property_company_user_access_community')
        .where('community_id', community_id)
        .andWhere('property_company_user_id', user_id)
        .first();

    return haveAccess ? true : false;
}
