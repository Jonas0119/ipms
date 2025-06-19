/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

type Dict<T = any> = { [k: string]: T };

export function countReader(result: Dict<number>[]): number {
    return Object.values(result.pop())[0];
}
