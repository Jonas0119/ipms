/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import * as config from '@/config';

export default class auth {
    static getToken() {
        const token = localStorage.getItem(config.TOKEN_ID);
        console.log('🔑 [AUTH-DEBUG] Getting token from localStorage with key:', config.TOKEN_ID);
        console.log('🔑 [AUTH-DEBUG] Token value:', token ? token.substring(0, 10) + '...' : 'null/undefined');
        return token ? token : undefined;
    }

    static getUserId() {
        const userId = localStorage.getItem(config.USER_ID);
        return /^\d+$/.test(userId) ? userId : undefined;
    }

    static isLogin() {
        return !!this.getToken();
    }

    static login(userId, token) {
        console.log('🔑 [AUTH-DEBUG] Saving login data...');
        console.log('🔑 [AUTH-DEBUG] User ID:', userId);
        console.log('🔑 [AUTH-DEBUG] Token to save:', token ? token.substring(0, 10) + '...' : 'null/undefined');
        console.log('🔑 [AUTH-DEBUG] Saving token with key:', config.TOKEN_ID);
        console.log('🔑 [AUTH-DEBUG] Saving user ID with key:', config.USER_ID);
        
        localStorage.setItem(config.TOKEN_ID, token);
        localStorage.setItem(config.USER_ID, userId);
        
        console.log('🔑 [AUTH-DEBUG] Login data saved. Verifying...');
        console.log('🔑 [AUTH-DEBUG] Retrieved token:', localStorage.getItem(config.TOKEN_ID) ? localStorage.getItem(config.TOKEN_ID).substring(0, 10) + '...' : 'null');
        console.log('🔑 [AUTH-DEBUG] Retrieved user ID:', localStorage.getItem(config.USER_ID));
    }

    static logout() {
        localStorage.removeItem(config.TOKEN_ID);
        localStorage.removeItem(config.USER_ID);
    }
}
