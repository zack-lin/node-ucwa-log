'use strict';

var path = require('path'),
    log4js = require('log4js'),
    ucparam = require('./ucparam'),
    util = require('./util'),
    proto = Log.prototype;

function Log(options) {
    if (!(this instanceof Log)) {
        return new Log(options);
    }

    options = options || {};
    options.filename = options.filename || 'app';
    options.logLevel = options.logLevel || 'warn';
    options.appID = options.appID || '0';
    options.logDir = options.logDir || path.join(process.cwd(), 'private/log');
    util.dir(options.logDir);

    this.config = util.extend(true, {}, options);
    this.logger = {};
    log4js.clearAppenders();

    // 只构造一次，重复调用返回已构造的实例
    var that = this;
    module.exports = function () {
        return that;
    };
}
module.exports = Log;

proto.getLogger = function (category, type) {
    if (typeof category !== 'string' || category.length === 0) {
        category = 'global';
    }

    if (!this.logger[category]) {
        switch (category) {
        case 'stat':
            category = type;
            this.logger[category] = getStatLogger(this, category);
            break;
        case 'email':
            this.logger[category] = getEmailLogger(this);
            break;
        default:
            this.logger[category] = getCategoryLogger(this, category);
        }
    }
    return this.logger[category];
};

function getStatLogger(self, category) {
    var options = self.config,
        logger;

    log4js.loadAppender('dateFile');
    log4js.addAppender(log4js.appenderMakers.dateFile({
        filename: options.filename + '_' + options.appID + '_' + category,
        pattern:  '_yyyyMMddhh.log',
        alwaysIncludePattern: true,
        layout: {
            type: 'pattern',
            pattern: '%x{data}',
            tokens: {data: options.statFormater || function (e) {
                var data = {},
                    line;
                e.data.forEach(function (d) {
                    util.extend(data, d);
                });
                line = ucparam.stringify(data, {sep: '`', sort: false});
                line = 'tm=' + formatDateTime(e.startTime) + (line.length ? '`' + line : '');
                return line;
            }}
        }
    }, {
        cwd: options.logDir
    }), category);

    logger = log4js.getLogger(category);
    logger.setLevel('info');
    return logger;
}

function getEmailLogger(self) {
    var options = self.config,
        category = 'email',
        logger;

    log4js.loadAppender('dateFile');
    log4js.addAppender(log4js.appenderMakers.dateFile({
        filename: options.filename,
        pattern: '.yyyyMMddhh.log',
        alwaysIncludePattern: true
    }, {
        cwd: options.logDir
    }), category);
    log4js.addAppender(log4js.appenders.console(), category);

    // 只在生产环境发送邮件
    if (process.env.NODE_ENV === 'production') {
        log4js.loadAppender('smtp');
        log4js.addAppender(log4js.appenders.smtp({
            sender: options.email.from,
            recipients: options.email.to,
            subject: options.email.subject,
            transport: 'direct'
        }), category);
    }

    logger = log4js.getLogger(category);
    logger.setLevel(options.logLevel);
    return logger;
}

function getCategoryLogger(self, category) {
    var options = self.config,
        logger;

    log4js.loadAppender('dateFile');
    log4js.addAppender(log4js.appenderMakers.dateFile({
        filename: options.filename + '_' + options.appID,
        pattern: '_default_yyyyMMddhh.log',
        alwaysIncludePattern: true
    }, {
        cwd: options.logDir
    }), category);
    log4js.addAppender(log4js.appenders.console(), category);

    logger = log4js.getLogger(category);
    logger.setLevel(options.logLevel);
    return logger;
}

function formatDateTime(date) {
    function addZero(str) {
        str = '0000' + str;
        return str.substr(str.length - 2);
    }

    var dateObj = [
            date.getFullYear(),
            addZero(date.getMonth() + 1),
            addZero(date.getDate())
        ],
        timeObj = [
            addZero(date.getHours()),
            addZero(date.getMinutes()),
            addZero(date.getSeconds())
        ];
    return dateObj.join('-') + ' ' + timeObj.join(':');
}