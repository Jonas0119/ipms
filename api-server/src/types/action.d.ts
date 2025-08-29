/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Context, Next } from 'koa';
import { Role } from '~/constant/role_access';

declare namespace Action {
    interface RouterDeclare {
        path: string;
        method: 'get' | 'post' | 'delete' | 'put' | 'patch';
        authRequired: boolean;
        // 此处针对mp模块
        verifyIntact?: boolean;
        // 此处针对pc模块
        roles?: number[];
        verifyCommunity?: boolean;
    }

    interface FieldVerifyDeclare {
        name: string;
        required?: boolean;
        length?: number;
        min?: number;
        max?: number;
        regex?: RegExp;
        message?: string;
        validator?: (value: any) => boolean;
    }

    interface ValidatorDeclare {
        body?: FieldVerifyDeclare[];
        params?: FieldVerifyDeclare[];
        query?: FieldVerifyDeclare[];
        files?: FieldVerifyDeclare[];
    }

    interface Action {
        router: RouterDeclare;
        validator?: ValidatorDeclare;
        response: (ctx?: Context, next?: Next) => Promise<any>;
    }

    interface NotifyAction {
        router: RouterDeclare;
        response: (ctx?: Context, next?: Next) => Promise<any>;
    }

    interface OaAction {
        router: RouterDeclare;
        response: (ctx?: Context, next?: Next) => Promise<any>;
    }
}

export = Action;
