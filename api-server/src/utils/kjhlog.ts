/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import * as fs from 'fs';
import * as path from 'path';

enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}

interface LogOptions {
    level?: LogLevel;
    logDir?: string;
    enableConsole?: boolean;
    enableFile?: boolean;
    serviceName?: string;
}

// ANSI 颜色代码 - 适合白色背景
const Colors = {
    // 基础颜色
    RESET: '\x1b[0m',
    BRIGHT: '\x1b[1m',
    DIM: '\x1b[2m',
    
    // 前景色 - 适合白色背景
    BLACK: '\x1b[30m',
    RED: '\x1b[31m',
    GREEN: '\x1b[32m',
    YELLOW: '\x1b[33m',
    BLUE: '\x1b[34m',
    MAGENTA: '\x1b[35m',
    CYAN: '\x1b[36m',
    GRAY: '\x1b[90m',
    
    // 亮色版本
    BRIGHT_RED: '\x1b[91m',
    BRIGHT_GREEN: '\x1b[92m',
    BRIGHT_YELLOW: '\x1b[93m',
    BRIGHT_BLUE: '\x1b[94m',
    BRIGHT_MAGENTA: '\x1b[95m',
    BRIGHT_CYAN: '\x1b[96m',
};

class KjhLog {
    private level: LogLevel;
    private logDir: string;
    private enableConsole: boolean;
    private enableFile: boolean;
    private serviceName: string;

    constructor(options: LogOptions = {}) {
        this.level = options.level || LogLevel.INFO;
        this.logDir = options.logDir || path.join(process.cwd(), 'logs');
        this.enableConsole = options.enableConsole !== false;
        this.enableFile = options.enableFile !== false;
        this.serviceName = options.serviceName || 'ipms-api';

        // 确保日志目录存在
        if (this.enableFile && !fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    private formatMessage(level: string, message: string, ...args: any[]): { colored: string; plain: string } {
        // 获取北京时间
        const now = new Date();
        const beijingTime = new Date(now.getTime() + (8 * 60 * 60 * 1000)); // UTC+8
        const timestamp = beijingTime.toISOString().replace('T', ' ').replace('Z', '').slice(0, 19); // 格式: 2025-06-19 13:56:08
        
        const pid = process.pid;
        const formattedArgs =
            args.length > 0
                ? ' ' + args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(' ')
                : '';

        // 纯文本版本（用于文件输出）
        const plainMessage = `[${this.serviceName}-${pid}] [${timestamp}] [${level}] ${message}${formattedArgs}`;

        // 彩色版本（用于控制台输出）
        const coloredServicePid = `${Colors.BRIGHT}${Colors.BLUE}[${this.serviceName}-${pid}]${Colors.RESET}`;
        const coloredTimestamp = `${Colors.GRAY}[${timestamp}]${Colors.RESET}`;
        
        let coloredLevel: string;
        switch (level) {
            case 'DEBUG':
                coloredLevel = `${Colors.BRIGHT}${Colors.CYAN}[${level}]${Colors.RESET}`;
                break;
            case 'INFO':
                coloredLevel = `${Colors.BRIGHT}${Colors.GREEN}[${level}]${Colors.RESET}`;
                break;
            case 'WARN':
                coloredLevel = `${Colors.BRIGHT}${Colors.YELLOW}[${level}]${Colors.RESET}`;
                break;
            case 'ERROR':
                coloredLevel = `${Colors.BRIGHT}${Colors.RED}[${level}]${Colors.RESET}`;
                break;
            default:
                coloredLevel = `${Colors.BRIGHT}[${level}]${Colors.RESET}`;
        }

        // 消息内容颜色
        let coloredMessage: string;
        let coloredArgs: string;
        
        switch (level) {
            case 'DEBUG':
                coloredMessage = `${Colors.CYAN}${message}${Colors.RESET}`;
                coloredArgs = formattedArgs ? `${Colors.DIM}${Colors.CYAN}${formattedArgs}${Colors.RESET}` : '';
                break;
            case 'INFO':
                coloredMessage = `${Colors.BLACK}${message}${Colors.RESET}`;
                coloredArgs = formattedArgs ? `${Colors.GRAY}${formattedArgs}${Colors.RESET}` : '';
                break;
            case 'WARN':
                coloredMessage = `${Colors.YELLOW}${message}${Colors.RESET}`;
                coloredArgs = formattedArgs ? `${Colors.DIM}${Colors.YELLOW}${formattedArgs}${Colors.RESET}` : '';
                break;
            case 'ERROR':
                coloredMessage = `${Colors.RED}${message}${Colors.RESET}`;
                coloredArgs = formattedArgs ? `${Colors.BRIGHT_RED}${formattedArgs}${Colors.RESET}` : '';
                break;
            default:
                coloredMessage = `${Colors.BLACK}${message}${Colors.RESET}`;
                coloredArgs = formattedArgs ? `${Colors.GRAY}${formattedArgs}${Colors.RESET}` : '';
        }

        const coloredFullMessage = `${coloredServicePid} ${coloredTimestamp} ${coloredLevel} ${coloredMessage}${coloredArgs}`;

        return {
            colored: coloredFullMessage,
            plain: plainMessage
        };
    }

    private writeToFile(formattedMessage: string): void {
        if (!this.enableFile) return;

        try {
            const today = new Date().toISOString().split('T')[0];
            const logFile = path.join(this.logDir, `${today}.log`);
            fs.appendFileSync(logFile, formattedMessage + '\n');
        } catch (error) {
            // 如果写入文件失败，至少在控制台输出
            console.error('Failed to write to log file:', error);
        }
    }

    private logInternal(level: LogLevel, levelName: string, message: string, ...args: any[]): void {
        if (level < this.level) return;

        const { colored, plain } = this.formatMessage(levelName, message, ...args);

        // 控制台输出（彩色）
        if (this.enableConsole) {
            switch (level) {
                case LogLevel.DEBUG:
                    console.debug(colored);
                    break;
                case LogLevel.INFO:
                    console.info(colored);
                    break;
                case LogLevel.WARN:
                    console.warn(colored);
                    break;
                case LogLevel.ERROR:
                    console.error(colored);
                    break;
            }
        }

        // 文件输出（纯文本）
        this.writeToFile(plain);
    }

    debug(message: string, ...args: any[]): void {
        this.logInternal(LogLevel.DEBUG, 'DEBUG', message, ...args);
    }

    info(message: string, ...args: any[]): void {
        this.logInternal(LogLevel.INFO, 'INFO', message, ...args);
    }

    warn(message: string, ...args: any[]): void {
        this.logInternal(LogLevel.WARN, 'WARN', message, ...args);
    }

    error(message: string, ...args: any[]): void {
        this.logInternal(LogLevel.ERROR, 'ERROR', message, ...args);
    }

    // 兼容 cwlog 的方法
    success(message: string, ...args: any[]): void {
        // 使用特殊的成功标记和绿色
        const successMessage = `${Colors.BRIGHT_GREEN}✓${Colors.RESET} ${message}`;
        this.logInternal(LogLevel.INFO, 'INFO', successMessage, ...args);
    }

    warning(message: string, ...args: any[]): void {
        this.warn(message, ...args);
    }

    log(message: string, ...args: any[]): void {
        this.info(message, ...args);
    }

    // 设置日志级别
    setLevel(level: LogLevel): void {
        this.level = level;
    }

    // 设置服务名称
    setServiceName(serviceName: string): void {
        this.serviceName = serviceName;
    }
}

// 创建默认实例
const kjhlog = new KjhLog({
    level: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
    enableConsole: true,
    enableFile: process.env.NODE_ENV === 'production',
    serviceName: 'ipms-api'
});

// 导出实例和类
export default kjhlog;
export { KjhLog, LogLevel, Colors };
