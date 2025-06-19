/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import WebSocket from 'ws';
import { Role } from '~/constant/role_access';

export interface CwWebSocket extends WebSocket {
    access?: Role[];
    user_id?: number;
    // 远程门禁服务的
    remote_id: number;
}
