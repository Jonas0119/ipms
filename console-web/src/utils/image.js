/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import * as utils from './';

export function parse(file) {
    return new Promise((resolve, reject) => {
        utils.file.parse(file).then(params => {
            const fr = new FileReader();

            fr.onload = () => {
                const src = fr.result;
                const img = new Image();

                img.onload = () => {
                    resolve({
                        width: img.width,
                        height: img.height,
                        base64: src,
                        instance: img,
                        ...params
                    });
                };

                img.src = src;
            };

            fr.onerror = () => {
                reject();
            };

            fr.readAsDataURL(file);
        });
    });
}
