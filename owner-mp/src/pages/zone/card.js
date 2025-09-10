/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { IpmsPage } from '../common/page';
import utils from '../../utils/index';
import { ASSETS_HOST } from '../../config';
import QRCode from '../../libs/qrcode';
import $toast from '../../components/toast/toast';

IpmsPage({
    data: {
        ASSETS_HOST
    },
    onLoad() {
        $toast.loading({
            duration: 0,
            forbidClick: true,
            message: '生成中…'
        });

        utils
            .request({
                url: '/user/card',
                method: 'get'
            })
            .then(
                res => {
                    $toast.clear();

                    new QRCode('canvas', {
                        text: res.data.uid,
                        width: 260,
                        height: 260,
                        colorDark: '#000000',
                        colorLight: '#ffffff',
                        correctLevel: QRCode.CorrectLevel.H
                    });
                },
                () => {
                    $toast.clear();
                }
            );
    }
});
