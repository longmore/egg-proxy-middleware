/*
 * @Author: zhangrongmou
 * @Date: 2018-08-02 22:04:19
 * @Last Modified by: zhangrongmou
 * @Last Modified time: 2018-08-03 15:06:07
 */

const util = require('util');
const request = require('request');
const _ = require('lodash');
const utils = require('./utils/utils.js');

module.exports = (options) => {
    options = _.defaults(options || {}, {
        body_parse: true,
        proxy_timeout: 3000,
        proxy_methods: ['GET', 'POST', 'PUT', 'DELETE'],
        rules: [],
        gzip: true
    });

    return async (ctx, next) => {

        if (utils.shouldSkipNext(ctx, options)) {
            return await next();
        };

        let opts = {};

        if (utils.shouldParseBody(ctx, options)) {
            ctx.request.body = await utils.execParseBody(ctx, false);
        }

        if (util.isError(ctx.request.body)) {
            ctx.status = 500;
            return;
        }

        opts = utils.configRequestOptions(ctx, options);

        const res = await requestWrap(opts);

        let result = res.body;
        // 如果是json数据, 则解析为对象
        if (/json/i.test(res.headers['content-type'])) {
            ctx.body = JSON.parse(result);
        }

        ['content-type', 'set-cookie'].forEach(header => {
            res.headers[header] && ctx.set(header, res.headers[header]);
        });

    };
};

function requestWrap(opt) {
    return new Promise((resolve, reject) => {
        request(opt, (error, response) => {
            let status = response && response.statusCode;
            // success
            if (!error && +status === 200) {
                resolve(response);
            } else {
                reject();
            }

        })
    });
}