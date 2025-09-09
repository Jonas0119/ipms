/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

export function version(a, b) {
    const c1 = a.split('.');
    const c2 = b.split('.');
    const len = Math.max(c1.length, c2.length);

    while (c1.length < len) {
        c1.push('0');
    }

    while (c2.length < len) {
        c2.push('0');
    }

    for (let i = 0; i < len; i++) {
        const num1 = parseInt(c1[i]);
        const num2 = parseInt(c2[i]);

        if (num1 > num2) {
            return true;
        } else if (num1 < num2) {
            return false;
        }
    }

    return false;
}
