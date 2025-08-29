/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import Mysql from 'mysql';
import Knex from 'knex';
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import kjhlog from './utils/kjhlog';

interface Config {
    name: string;
    debug: boolean;
    server: {
        port: number;
        name: string;
    };
    mysqlConfig: Mysql.ConnectionConfig & Knex.ConnectionConfig;
    redis: {
        host: string;
        port: number;
        password: string;
    };
    // 统一存储配置
    storage: {
        mode: 'local' | 'oss' | 'minio'; // 存储模式
        template?: {
            path: string; // 模板文件存储路径
            files: {
                [key: string]: string; // 模板文件映射
            };
        };
        local?: {
            savePath: string; // 本地存储路径
            urlPrefix: string; // URL前缀
            baseUrl: string; // 访问基础URL
        };
        oss?: {
            accessKeyId: string;
            accessKeySecret: string;
            bucket: string;
            region: string;
            baseUrl: string; // OSS访问基础URL
            customDomain?: string; // 可选：自定义域名
        };
        minio?: {
            endpoint: string; // MinIO服务地址
            accessKey: string; // MinIO访问密钥
            secretKey: string; // MinIO密钥
            bucket: string; // 存储桶名称
            region?: string; // 区域
            useSSL: boolean; // 是否使用SSL
            baseUrl: string; // 访问基础URL
            customDomain?: string; // 可选：自定义域名
        };
    };
    wechat: {
        ump: {
            appid: string;
            secret: string;
        };
        oa: {
            appid: string;
            secret: string;
            token: string;
            key: string;
        };
        pay: {
            mch_id: string;
            prodHost: string;
            devHost: string;
            payExpire: number;
            refoundExpire: number;
            key: string;
            certPath: string;
        };
        pmp: {
            appid: string;
            secret: string;
        };
    };
    map: {
        key: string;
    };
    session: {
        key: string;
        maxAge: number;
        signed: boolean;
    };
    community: {
        expire: number;
    };
    crypto: {
        key: string;
        iv: string;
    };
    smtp: {
        host: string;
        port: number;
        secure: boolean;
        user?: string;
        password?: string;
        to?: string;
    };
    inited: boolean;
}

interface CustomConfig {
    [key: string]: any;
}

function generateConfig(): Config {
    let customConfig = <CustomConfig>{};

    try {
        // 只加载 .ipmsrc
        let configPath = path.join(process.cwd(), '.ipmsrc');

        // 如果当前目录不存在,则尝试上级目录
        if (!fs.existsSync(configPath)) {
            configPath = path.join(process.cwd(), '..', '.ipmsrc');
        }

        if (!fs.existsSync(configPath)) {
            throw new Error('未找到配置文件');
        }

        customConfig = yaml.load(fs.readFileSync(configPath, 'utf-8'));
    } catch (e) {
        kjhlog.error('未检测到配置文件，程序退出');
        process.exit();
    }

    const mysqlConfig: Mysql.ConnectionConfig & Knex.ConnectionConfig = {
        host: '',
        port: 3306,
        user: 'root',
        password: '',
        database: '',
        ...customConfig.mysql,
        supportBigNumbers: true,
        typeCast: (field, next) => {
            // 数据库内所有字段只要是content的都是json内容
            if (field.type === 'BLOB' && field.name === 'content') {
                return JSON.parse(field.string());
            }

            return next();
        }
    };

    return {
        name: 'ipms',
        debug: process.env.NODE_ENV !== 'production',
        server: {
            port: 6688,
            ...customConfig.server
        },
        mysqlConfig,
        redis: {
            host: '',
            port: 6379,
            password: '',
            ...customConfig.redis
        },
        // 处理存储配置的兼容性
        storage: (() => {
            const storageConfig = customConfig.storage || {};

            // 如果使用新的storage配置，优先使用storage配置
            // 否则从原有的upload和aliyun配置中迁移
            if (storageConfig.mode) {
                return {
                    mode: storageConfig.mode, // 使用配置文件中的实际模式
                    template: {
                        path: 'template',
                        files: {
                            building_import: '固定资产导入模板.xlsx'
                        }
                    },
                    local: {
                        savePath: './uploads',
                        urlPrefix: '/static',
                        baseUrl: 'http://172.17.0.5:6688'
                        //baseUrl: 'http://127.0.0.1:6688'
                    },
                    ...storageConfig
                };
            } else {
                // 兼容旧配置，自动迁移
                const finalStorageConfig = {
                    mode: 'local',
                    local: {
                        savePath: './uploads',
                        urlPrefix: '/static',
                        baseUrl: 'http://172.17.0.5:6688'
                        //baseUrl: 'http://127.0.0.1:6688'
                    },
                    oss: {
                        accessKeyId: '',
                        accessKeySecret: '',
                        bucket: '',
                        region: '',
                        baseUrl: ''
                    }
                };
                return finalStorageConfig;
            }
        })(),
        wechat: {
            // 小程序
            ump: {
                appid: '',
                secret: '',
                ...(customConfig.wechat ? customConfig.wechat.ump : {})
            },
            // 公众号
            oa: {
                appid: '',
                secret: '',
                token: '',
                key: '',
                ...(customConfig.wechat ? customConfig.wechat.oa : {})
            },
            // 支付
            pay: {
                mch_id: '',
                prodHost: '',
                devHost: '',
                // 支付时效
                payExpire: 30 * 60 * 1000,
                // 退款时效
                refoundExpire: 15 * 1000 * 24 * 60 * 60,
                key: '',
                certPath: '',
                ...(customConfig.wechat ? customConfig.wechat.pay : {})
            },
            // 物业端小程序
            pmp: {
                appid: '',
                secret: '',
                ...(customConfig.wechat ? customConfig.wechat.pmp : {})
            }
        },
        // 地图
        map: {
            key: '',
            ...customConfig.map
        },
        session: {
            key: 'ipms:session',
            maxAge: 1000 * 60 * 30,
            signed: false,
            ...customConfig.session
        },
        // 二维码
        community: {
            expire: 5 * 60 * 1000,
            ...customConfig.community
        },
        // 各类可以解密加密
        crypto: {
            key: '',
            iv: '',
            ...customConfig.crypto
        },
        smtp: {
            host: '',
            port: 465,
            secure: true,
            user: '',
            password: '',
            to: '',
            ...customConfig.smtp
        },
        inited: false
    };
}

export default generateConfig();
