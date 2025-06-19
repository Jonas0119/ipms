/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

export interface Message {
    ToUserName: string;
    FromUserName: string;
    CreateTime: string;
    MsgType: 'event' | 'text' | 'video';
    Event?: string;
    Content?: string;
    MediaId?: string;
    Format?: string;
    MsgId?: string;
    EventKey: string;
}

export function text(content: string, message: Message): string {
    return `<xml>
    <ToUserName><![CDATA[${message.FromUserName}]]></ToUserName>
    <FromUserName><![CDATA[${message.ToUserName}]]></FromUserName>
    <CreateTime>${Date.now()}</CreateTime>
    <MsgType><![CDATA[text]]></MsgType>
    <Content><![CDATA[${content}]]></Content>
</xml>`;
}

export function event(content: string, message: Message): string {
    return `<xml>
    <ToUserName><![CDATA[${message.FromUserName}]]></ToUserName>
    <FromUserName><![CDATA[${message.ToUserName}]]></FromUserName>
    <CreateTime>${Date.now()}</CreateTime>
    <MsgType><![CDATA[text]]></MsgType>
    <Content><![CDATA[${content}]]></Content>
    <Event><![CDATA[${message.Event}]]></Event>
    <EventKey><![CDATA[${message.EventKey}]]></EventKey>
</xml>`;
}
