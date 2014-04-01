'use strict';

/**
    Object filter

    @example
    ucparams.filter({
        'uc_param_str': 'frvess',
        fr: 'android',
        ve: '9.0.0.0',
        ss: '480*800'
    }, 'fr ve');
    // {fr: 'android', ve: '9.0.0.0'}

    @param {Object} params - the object to filter
    @param {String|Array} filter - a space-separated string or an array with keys
    @returns {Object} filteredParams - return object filtered with specified keys
 */
exports.filter = function (params, filter) {
    if (typeof params !== 'object') {
        throw new TypeError('First argument to ucparams.filter must be object');
    }

    if (typeof filter === 'string') {
        filter = filter.split(' ');
    } else if (!Array.isArray(filter)) {
        throw new TypeError('Second argument to ucparams.filter must be array or string');
    }

    var ucParams = {};
    filter.forEach(function (key) {
        var value = params[key];
        if (value) {
            ucParams[key] = value;
        }
    });
    return ucParams;
};

/**
    Stringify an object ordered by keys

    @example
    ucparams.stringify({
        dd: 'ddValue',
        bb: 'bbValue',
        aa: 'aaValue',
        cc: 'ccValue'
    });
    // 'aaValue_bbValue_ccValue_ddValue'

    @param {Object} params - the object to stringify
    @param {Object} [options]
    @returns {String} paramString - ordered param string
 */
exports.stringify = function (params, options) {
    if (typeof params === 'string') {
        return params;
    } else if (typeof params !== 'object') {
        throw new TypeError('Arguments to ucparams.stringify must be an object');
    }

    options = options || {};
    options.key = options.key !== false;
    options.sep = options.sep || '&';
    options.eq = options.eq || '=';
    options.sort = options.sort !== false;

    var paramList = [],
        keys = Object.keys(params);

    if (options.sort) {
        keys.sort();
    }

    keys.forEach(function (key) {
        if(key==='cp') {
            paramList = paramList.concat(params.cp.replace(/:/g, options.eq).split(';'));
        }else {
            var pair = options.key ? key + options.eq + params[key] : params[key];
            paramList.push(pair);
        }
    });
    return paramList.join(options.sep);
};