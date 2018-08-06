/*
 * @Author: zhangrongmou
 * @Date: 2018-08-02 22:05:16
 * @Last Modified by: zhangrongmou
 * @Last Modified time: 2018-08-03 14:45:01
 */

const assert = require('assert');
const util = require('util');
const _ = require('lodash');
const parse = require('co-body');
const multipart = require('./multipart');

exports.mergeSafeUrl = function (origin, addition) {
    switch (true) {
        case origin.endsWith('/') && addition.startsWith('/'):
            return origin + addition.slice(1);
            break;
        case !origin.endsWith('/') && !addition.startsWith('/'):
            return origin + '/' + addition;
            break;
        default:
            return origin + addition;
    }
};

exports.resolvePath = function (path, rules) {
    assert.ok(util.isArray(rules), 'Array Rules Required');

    let result = _.find(rules, function (rule) {
        return util.isRegExp(rule.proxy_location)
            ? rule.proxy_location.test(path)
            : rule.proxy_location === path;
    });

    const microServiceReg = /^\/(\w+)(\/?.*)$/;
    let location = '';

    if (!result) {
        return false;
    }

    location = result.proxy_pass.replace(/^https?:\/\//, '');
    if (location.indexOf('/') !== -1 && !result.proxy_merge_mode) {
        return result.proxy_pass;
    }
    if (result.proxy_micro_service && microServiceReg.test(path)) {
        path = microServiceReg.exec(path)[2];
    }

    return this.mergeSafeUrl(result.proxy_pass, path);
};

exports.shouldSkipNext = function (ctx, options) {
    return !this.resolvePath(ctx.path, options.rules) || options.proxy_methods.indexOf(ctx.method) === -1;
};

exports.shouldParseBody = function (ctx, options) {
    return !ctx.request.body && options.body_parse;
};

exports.resolveBody = function (req) {
    return parse(req);
};

exports.execParseBody = function (ctx, debug) {
    if (_.isString(ctx.is('json', 'text', 'urlencoded'))) {
        return !debug ? parse(ctx) : 'co-body';
    }
    if (_.isString(ctx.is('multipart'))) {
        return !debug ? multipart(ctx.req) : 'multipart';
    }
    return {};
};

exports.configRequestOptions = function (ctx, options) {

    const opts = {
        method: ctx.method,
        url: this.resolvePath(ctx.path, options.rules),
        headers: ctx.header,
        qs: ctx.query,
        gzip: options.gzip
    };

    switch (true) {
        case _.isEmpty(ctx.request.body):
            break;
        case ctx.is('urlencoded') === 'urlencoded':
            opts.form = ctx.request.body;
            break;
        case ctx.is('multipart') === 'multipart':
            opts.formData = ctx.request.body;
            break;
        default:
            opts.body = ctx.request.body;
            opts.json = ctx.is('json') === 'json';
    }
    return opts;
};
