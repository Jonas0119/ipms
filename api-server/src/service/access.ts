/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

interface RemoteOenResponse {
    success: boolean;
    message: string;
}

export async function remoteOpen(id: number, community_id: number): Promise<RemoteOenResponse> {
    return {
        success: true,
        message: '开门成功'
    };
}
