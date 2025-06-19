/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { MpUserInfo, PcUserInfo, OaUserInfo } from './user-info';

interface InterfaceBody {
    code: number;
    message?: string;
    data?: Object;
}

declare module 'koa' {
    interface BaseContext {
        mpUserInfo: MpUserInfo;
        pcUserInfo: PcUserInfo;
        OaUserInfo: OaUserInfo;
    }

    interface ContextDelegatedResponse {
        body: InterfaceBody | string;
    }
}
