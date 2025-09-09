/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */
module.exports = {
    presets: ['@vue/cli-plugin-babel/preset'],
    plugins: [
        [
            'import',
            {
                libraryName: 'view-design',
                libraryDirectory: 'src/components'
            }
        ]
    ]
};
