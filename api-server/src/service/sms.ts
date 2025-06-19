/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import * as openApi from '@alicloud/openapi-client';
import dysmsapi, { SendSmsRequest } from '@alicloud/dysmsapi20170525';
import config from '~/config';

function createClient() {
    const apiConfig = new openApi.Config({
        accessKeyId: config.storage.oss?.accessKeyId || '',
        accessKeySecret: config.storage.oss?.accessKeySecret || ''
    });

    apiConfig.endpoint = 'dysmsapi.aliyuncs.com';

    return new dysmsapi(apiConfig);
}

interface SendParams {
    phone: string;
    template_id: string;
    data: {
        [key: string]: any;
    };
}

interface SendResult {
    success: boolean;
    message: string;
}

export async function send(params: SendParams): Promise<SendResult> {
    const client = createClient();
    const { phone, template_id, data } = params;

    const res = await client.sendSms(
        new SendSmsRequest({
            phoneNumbers: phone,
            signName: config.server.name,
            templateCode: template_id,
            templateParam: JSON.stringify(data)
        })
    );

    return {
        success: res.body.code === 'OK',
        message: res.body.message
    };
}
