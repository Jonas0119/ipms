/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import WebSocket from 'ws';
import http from 'http';
import quertString from 'query-string';
import model from '~/model';
import { Role } from '~/constant/role_access';

/**
 * 扩展的 WebSocket 接口，包含用户相关信息
 */
export interface CwWebSocket extends WebSocket {
    access?: Role[];    // 用户权限角色列表
    user_id?: number;   // 用户ID
}

/**
 * 发送给 PC 端的数据结构
 */
export interface PcData {
    id: number;           // 数据ID
    community_id: number; // 社区ID
    type: Role;          // 角色类型
    urge: boolean;       // 是否为催办消息
}

/**
 * WebSocket 服务管理类
 * 
 * 主要功能：
 * 1. 管理 WebSocket 服务器的创建和连接处理
 * 2. 处理客户端连接的身份验证
 * 3. 提供向特定权限用户推送消息的功能
 */
class ws {
    // WebSocket 服务器实例
    static ws: WebSocket.Server;

    /**
     * 初始化 WebSocket 服务器
     * 
     * @param server HTTP 服务器实例
     */
    static init(server: http.Server) {
        // 创建 WebSocket 服务器，监听 /cws 路径
        this.ws = new WebSocket.Server({ server, path: '/cws' });

        // 监听客户端连接事件
        this.ws.on('connection', async (ws: CwWebSocket, request: http.IncomingMessage) => {
            // 解析连接 URL 中的查询参数，获取认证 token
            const {
                query: { token }
            } = quertString.parseUrl(request.url);

            // 如果没有提供 token，关闭连接
            if (!token) {
                return ws.close();
            }

            // 根据 token 查询用户信息和权限
            const userInfo = await model
                .table('ipms_property_company_auth')
                .leftJoin(
                    'ipms_property_company_user',
                    'ipms_property_company_user.id',
                    'ipms_property_company_auth.property_company_user_id'
                )
                .leftJoin(
                    'ipms_property_company_access',
                    'ipms_property_company_access.id',
                    'ipms_property_company_user.access_id'
                )
                .where('ipms_property_company_auth.token', token)
                .select('ipms_property_company_user.id', 'ipms_property_company_access.content')
                .first();

            // 如果用户信息不存在，关闭连接
            if (!userInfo) {
                return ws.close();
            }

            // 将用户信息绑定到 WebSocket 连接上
            ws.user_id = userInfo.id;        // 设置用户ID
            ws.access = userInfo.content;    // 设置用户权限列表
        });
    }

    /**
     * 向 PC 端用户发送消息
     * 
     * 根据消息类型和用户权限，将消息推送给有相应权限的在线用户
     * 
     * @param data 要发送的数据
     */
    static sendToPc(data: PcData) {
        // 检查 WebSocket 服务器是否已初始化
        if (!(this.ws instanceof WebSocket.Server)) {
            return;
        }

        // 遍历所有连接的客户端
        this.ws.clients.forEach((client: CwWebSocket) => {
            // 检查客户端连接状态是否正常，且用户具有相应权限
            if (client.readyState === WebSocket.OPEN && client.access.includes(data.type)) {
                // 发送 JSON 格式的消息给客户端
                client.send(JSON.stringify(data));
            }
        });
    }
}

export default ws;
