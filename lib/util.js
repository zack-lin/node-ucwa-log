/**
    Utilities
 */
/*jshint noempty: false, forin: false */
'use strict';

var path = require('path'),
    mkdirp = require('mkdirp'),
    util = {};

util.type = function (obj) {
    var type,
        toString = Object.prototype.toString;
    if (obj == null) {
        type = String(obj);
    } else {
        type = toString.call(obj).toLowerCase();
        type = type.substring(8, type.length - 1);
    }
    return type;
};

util.isPlainObject = function (obj) {
    var key,
        hasOwn = Object.prototype.hasOwnProperty;

    if (!obj || util.type(obj) !== 'object') {
        return false;
    }

    if (obj.constructor &&
        !hasOwn.call(obj, 'constructor') &&
        !hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
        return false;
    }

    for (key in obj) {}
    return key === undefined || hasOwn.call(obj, key);
};

// 扩展方法
// 来自 jQuery
// extend([deep,] target, obj1 [, objN])
util.extend = function () {
    var options, name, src, copy, copyIsArray, clone,
        target = arguments[0] || {},
        i = 1,
        length = arguments.length,
        deep = false;

    // Handle a deep copy situation
    if (typeof target === 'boolean') {
        deep = target;
        target = arguments[1] || {};
        // skip the boolean and the target
        i = 2;
    }

    // Handle case when target is a string or something (possible in deep copy)
    if (typeof target !== 'object' && util.type(target) !== 'function') {
        target = {};
    }

    // extend caller itself if only one argument is passed
    if (length === i) {
        target = this;
        --i;
    }

    for (; i<length; i++) {
        // Only deal with non-null/undefined values
        if ((options = arguments[i]) != null) {
            // Extend the base object
            for (name in options) {
                src = target[name];
                copy = options[name];

                // Prevent never-ending loop
                if (target === copy) {
                    continue;
                }

                // Recurse if we're merging plain objects or arrays
                if (deep && copy && (util.isPlainObject(copy) || (copyIsArray = util.type(copy) === 'array'))) {
                    if (copyIsArray) {
                        copyIsArray = false;
                        clone = src && util.type(src) === 'array' ? src : [];
                    } else {
                        clone = src && util.isPlainObject(src) ? src : {};
                    }

                    // Never move original objects, clone them
                    target[name] = util.extend(deep, clone, copy);

                // Don't bring in undefined values
                } else if (copy !== undefined) {
                    target[name] = copy;
                }
            }
        }
    }

    // Return the modified object
    return target;
};

util.dir = function () {
    var dirPath = path.join.apply(path, arguments);
    mkdirp.sync(dirPath);
    return dirPath;
};

module.exports = util;