/**
 * AWS S3 Signature V4 计算工具
 * 用于重新计算MinIO预签名URL的签名
 */

import crypto from 'crypto';
import { URL, URLSearchParams } from 'url';

interface SignatureParams {
    method: string;
    host: string;
    path: string;
    queryParams: URLSearchParams;
    accessKey: string;
    secretKey: string;
    region?: string;
    service?: string;
    timestamp: string;
}

/**
 * 计算AWS S3 Signature V4
 */
export function calculateAWSSignature(params: SignatureParams): string {
    const {
        method,
        host,
        path,
        queryParams,
        accessKey,
        secretKey,
        region = 'us-east-1',
        service = 's3',
        timestamp
    } = params;

    // 1. 创建规范请求 (Canonical Request)
    const canonicalHeaders = `host:${host}\n`;
    const signedHeaders = 'host';
    
    // 排序查询参数（除了X-Amz-Signature）
    const sortedParams = new URLSearchParams();
    Array.from(queryParams.entries())
        .filter(([key]) => key !== 'X-Amz-Signature')
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([key, value]) => sortedParams.append(key, value));
    
    const canonicalQueryString = sortedParams.toString();
    const payloadHash = 'UNSIGNED-PAYLOAD'; // 对于预签名URL使用UNSIGNED-PAYLOAD
    
    const canonicalRequest = [
        method,
        path,
        canonicalQueryString,
        canonicalHeaders,
        signedHeaders,
        payloadHash
    ].join('\n');

    // 2. 创建字符串待签名 (String to Sign)
    const date = timestamp.substring(0, 8); // YYYYMMDD
    const credentialScope = `${date}/${region}/${service}/aws4_request`;
    
    const stringToSign = [
        'AWS4-HMAC-SHA256',
        timestamp,
        credentialScope,
        sha256Hash(canonicalRequest)
    ].join('\n');

    // 3. 计算签名密钥
    const signingKey = getSignatureKey(secretKey, date, region, service);

    // 4. 计算签名
    const signature = hmacSha256(signingKey, stringToSign).toString('hex');

    return signature;
}

/**
 * 重新生成带有新域名的预签名URL
 */
export function regeneratePresignedUrl(originalUrl: string, newHost: string, accessKey: string, secretKey: string): string {
    try {
        const originalUrlObj = new URL(originalUrl);
        const queryParams = new URLSearchParams(originalUrlObj.search);
        
        // 提取时间戳
        const timestamp = queryParams.get('X-Amz-Date');
        if (!timestamp) {
            throw new Error('缺少X-Amz-Date参数');
        }

        // 创建新的URL
        const newUrlObj = new URL(originalUrlObj.pathname + originalUrlObj.search, newHost);
        const newQueryParams = new URLSearchParams(newUrlObj.search);
        
        // 移除旧签名
        newQueryParams.delete('X-Amz-Signature');

        // 计算新签名
        const newSignature = calculateAWSSignature({
            method: 'PUT',
            host: newUrlObj.host,
            path: newUrlObj.pathname,
            queryParams: newQueryParams,
            accessKey,
            secretKey,
            timestamp
        });

        // 添加新签名
        newQueryParams.set('X-Amz-Signature', newSignature);
        
        // 构造最终URL
        newUrlObj.search = newQueryParams.toString();
        
        return newUrlObj.toString();
    } catch (error) {
        console.error('重新生成预签名URL失败:', error);
        throw error;
    }
}

/**
 * SHA256哈希
 */
function sha256Hash(data: string): string {
    return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
}

/**
 * HMAC-SHA256
 */
function hmacSha256(key: Buffer, data: string): Buffer {
    return crypto.createHmac('sha256', key).update(data, 'utf8').digest();
}

/**
 * 获取签名密钥
 */
function getSignatureKey(secretKey: string, date: string, region: string, service: string): Buffer {
    const kDate = hmacSha256(Buffer.from('AWS4' + secretKey, 'utf8'), date);
    const kRegion = hmacSha256(kDate, region);
    const kService = hmacSha256(kRegion, service);
    const kSigning = hmacSha256(kService, 'aws4_request');
    return kSigning;
}
