/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

// 导入axios库，用于发送HTTP请求
import axios from 'axios';
// 导入UI库的消息组件，用于显示错误提示
import { Message } from 'view-design';
// 导入路由器，用于页面跳转
import router from '@/router';
// 导入工具函数，主要用于token相关操作
import * as utils from '@/utils';
// 导入配置文件，获取API基础URL等配置信息
import config from '@/config';

/**
 * HTTP请求工具模块
 * 基于axios封装，提供统一的请求/响应处理
 * 包含token认证、错误处理、文件上传等功能
 */

// 创建axios实例，设置3秒的超时时间，防止请求长时间无响应
const service = axios.create({
    timeout: 3 * 1000
});

// 设置请求拦截器，在发送请求前对请求进行统一处理
service.interceptors.request.use(
    options => {
        // 检查是否有请求数据需要处理
        if (options.data) {
            // 判断是否为文件上传请求，需要特殊处理
            if (options.uploadFile) {
                // 创建FormData对象，用于文件上传
                const data = new FormData();

                // 遍历所有数据字段，添加到FormData中
                for (let key in options.data) {
                    data.append(key, options.data[key]);
                }

                // 替换原始数据为FormData格式
                options.data = data;
                // 设置multipart请求头，告诉服务器这是文件上传
                options.headers = {
                    'Content-Type': 'multipart/form-data'
                };

                // 删除uploadFile标记，避免传递给服务器
                delete options.uploadFile;
            } else {
                // 普通请求，将数据转换为JSON字符串
                options.data = JSON.stringify(options.data);
                // 设置JSON请求头，告诉服务器发送的是JSON数据
                options.headers = {
                    'Content-Type': 'application/json'
                };
            }
        }

        // 获取用户认证token，用于身份验证
        const token = utils.auth.getToken();

        // 如果存在token，添加到请求头中进行身份认证
        if (token) {
            options.headers['ipms-pc-token'] = token;
        }

        // 为所有请求URL添加'/pc'前缀，匹配后端API路由规则
        options.url = `/pc${options.url}`;

        // 返回处理后的配置，继续发送请求
        return options;
    },
    error => {
        // 请求配置出错时，直接拒绝Promise
        Promise.reject(error);
    }
);

// 设置响应拦截器，统一处理服务器响应
service.interceptors.response.use(
    response => {
        // 检查响应状态码，200表示成功
        if (response.data.code === 200) {
            // 成功时直接返回响应数据
            return response.data;
        } else {
            // 处理特殊错误码：系统未初始化
            if (response.data.code === -66) {
                // 跳转到系统初始化页面
                router.replace({ path: '/user/init' });
            } else if (response.data.message) {
                // 显示服务器返回的错误消息
                Message.error(response.data.message);
            }

            // 抛出错误，让调用方处理
            return Promise.reject(response.data);
        }
    },
    error => {
        // 处理HTTP状态码错误（网络层面的错误）
        if (error && error.response) {
            // 根据不同的HTTP状态码设置用户友好的错误消息
            switch (error.response.status) {
                case 400:
                    // 客户端请求错误
                    error.message = '错误请求';
                    break;
                case 401:
                    // 未授权，需要重新登录
                    error.message = 401;
                    // 避免在登录页面重复跳转
                    if (router.currentRoute.path !== '/user/login') {
                        // 跳转到登录页，并记录当前页面用于登录后返回
                        router.replace({
                            path: '/user/login',
                            query: { redirect: router.currentRoute.fullPath }
                        });
                    }
                    // 清除本地token
                    utils.auth.logout();
                    break;

                case 403:
                    // 权限不足
                    error.message = '权限不足，拒绝访问';
                    break;
                case 404:
                    // 资源未找到
                    error.message = '请求错误,未找到该资源';
                    break;
                case 405:
                    // 请求方法不被允许
                    error.message = '请求方法未允许';
                    break;
                case 408:
                    // 请求超时
                    error.message = '请求超时';
                    break;
                case 500:
                    // 服务器内部错误
                    error.message = '服务器端出错';
                    break;
                case 501:
                    // 服务器不支持请求的功能
                    error.message = '网络未实现';
                    break;
                case 502:
                    // 网关错误
                    error.message = '网络错误';
                    break;
                case 503:
                    // 服务不可用
                    error.message = '服务不可用';
                    break;
                case 504:
                    // 网关超时
                    error.message = '网络超时';
                    break;
                case 505:
                    // HTTP版本不受支持
                    error.message = 'http版本不支持该请求';
                    break;
                default:
                    // 其他未知错误
                    error.message = `连接错误${error.response.status}`;
            }
        } else {
            // 网络连接失败或其他未知错误
            error.message = '服务器响应超时，请刷新当前页';
        }

        // 401错误不显示消息提示（因为会跳转到登录页）
        if (error.message !== 401) {
            Message.error(error.message);
        }

        // 抛出错误响应供调用方处理
        return Promise.reject(error.response);
    }
);

// 定义通用请求函数，接受配置对象参数
const request = function({ url, method, data, params, uploadFile }) {
    // 构建axios请求配置对象
    const options = {
        url,     // 请求URL
        method   // 请求方法（GET、POST等）
    };

    // 如果有请求体数据，添加到配置中
    if (data) {
        options.data = data;
    }

    // 如果有查询参数，添加到配置中
    if (params) {
        options.params = params;
    }

    // 设置文件上传标记，用于请求拦截器中的特殊处理
    options.uploadFile = uploadFile ? true : false;

    // 发送请求并返回Promise
    return service(options);
};

// 封装GET请求方法，简化调用
request.get = function(url, params) {
    return request({
        url,         // 请求URL
        params,      // 查询参数
        method: 'get' // 指定GET方法
    });
};

// 封装POST请求方法，用于创建资源
request.post = function(url, data) {
    return request({
        url,          // 请求URL
        data,         // 请求体数据
        method: 'post' // 指定POST方法
    });
};

// 封装PUT请求方法，用于更新资源
request.put = function(url, data) {
    return request({
        url,         // 请求URL
        data,        // 请求体数据
        method: 'put' // 指定PUT方法
    });
};

// 封装PATCH请求方法，用于部分更新资源
request.patch = function(url, data) {
    return request({
        url,           // 请求URL
        data,          // 请求体数据
        method: 'patch' // 指定PATCH方法
    });
};

// 封装DELETE请求方法，用于删除资源
request.delete = function(url, data) {
    return request({
        url,            // 请求URL
        data,           // 请求体数据（某些DELETE请求需要）
        method: 'delete' // 指定DELETE方法
    });
};

// 导出request对象，供其他模块使用
export default request;
