/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Role } from '~/constant/role_access';

declare namespace UserInfo {
    interface MpUserInfo {
        id: number;
        nick_name: string;
        real_name: string;
        idcard: string;
        phone: string;
        avatar_url: string;
        gender: number;
        signature: string;
        intact: 0 | 1;
        status: 0 | 1;
        created_at: number;
    }

    interface OaUserInfo {
        id: number;
        union_id: string;
        subscribed: boolean;
        created_at: number;
    }

    interface PcUserInfo {
        id: number;
        account: string;
        real_name: string;
        phone: string;
        department: number;
        job: number;
        access_role: number;
        join_company_at: number;
        birth_date: number;
        access: Role[];
        admin: 0 | 1;
        department_id: number;
        job_id: number;
        created_by: number;
        created_at: number;
    }
}

export = UserInfo;
