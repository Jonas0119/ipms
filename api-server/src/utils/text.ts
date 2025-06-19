/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

export function omit(str: string, len: number): string {
    if (!str) {
        return '';
    }

    if (str.length <= len) {
        return str;
    }

    return str.substring(0, len - 2) + '…';
}
