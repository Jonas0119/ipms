/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

// 导入Redis客户端库
import redis from 'redis';
// 导入WebSocket服务和PC端数据类型
import wss, { PcData } from '~/wss';
// 导入配置文件
import config from '~/config';

// 创建Redis发布客户端，如果是调试模式则为null
const pub = config.debug ? null : redis.createClient(config.redis);
// 创建Redis订阅客户端，如果是调试模式则为null
const sub = config.debug ? null : redis.createClient(config.redis);

// 定义通知物业公司的频道常量
export const WS_NOTICE_TO_PROPERTY_COMPANY = 'WS_NOTICE_TO_PROPERTY_COMPANY';
// 定义通知远程服务器的频道常量
export const WS_NOTICE_TO_REMOTE_SERVER = 'WS_NOTICE_TO_REMOTE_SERVER';

// 远程服务器数据接口定义（待完善）
interface RsData {
    remote_id: number;  // 远程设备ID
    door_id: number;    // 门禁ID
}

/**
 * 发送数据到远程服务器
 * @param data 远程服务器数据
 */
function sendToRs(data: RsData) {
    // 目前只是打印数据，实际应该发送到远程服务器
    console.log(data);
}

/**
 * 根据频道分发消息到不同的处理器
 * @param channel 频道名称
 * @param data 要分发的数据
 */
function dispatch(channel: string, data: Object) {
    switch (channel) {
        case WS_NOTICE_TO_PROPERTY_COMPANY:
            // 发送消息到物业公司PC端
            return wss.sendToPc(data as PcData);

        case WS_NOTICE_TO_REMOTE_SERVER:
            // 发送消息到远程服务器
            return sendToRs(data as RsData);
    }
}

/**
 * 发布消息到Redis频道
 * @param channel 频道名称
 * @param data 要发布的数据
 */
export function pubish(channel: string, data: Object) {
    if (!config.debug) {
        // 生产环境：使用Redis发布消息
        pub.publish(channel, JSON.stringify(data));
    } else {
        // 调试环境：直接调用dispatch方法，跳过Redis
        dispatch(channel, data);
    }
}

/**
 * 订阅Redis频道，监听消息
 */
export async function subscribe() {
    if (!config.debug) {
        // 生产环境：订阅Redis频道
        sub.subscribe(WS_NOTICE_TO_PROPERTY_COMPANY);
        sub.subscribe(WS_NOTICE_TO_REMOTE_SERVER);

        // 监听Redis消息事件
        sub.on('message', (channel: string, message: string) => {
            // 解析JSON消息
            const data = <PcData | RsData>JSON.parse(message);

            // 分发消息到相应的处理器
            dispatch(channel, data);
        });
    }
}
