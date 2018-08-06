# egg-proxy-middleware

A proxy plugin for egg.

## Can I do for you
This is a plugin for egg. Help you to redriect request from browser to other server api wher CORS.

## Install

```bash
$ npm i egg-proxy-middleware --save
```

## Usage

```js
// config/config.${env}.js

// require
exports.middleware = [
    'eggProxy'
];
// config
exports.eggProxy = {
    rules: [
        {
            proxy_location: '/login.aspx', // redirect url
            proxy_pass: 'http://www.example.com', // target origin
        }
    ],
    body_parse: true,
    proxy_timeout: 3000,
    gzip: true // default value is true
};
```

```js
// app/middleware/egg_proxy.js

// wrapper
module.exports = require('egg-proxy-middleware');

```

## Support

framework: koa2

request method: get/post/put/delete

request data format: url/form/multipart


## Questions & Suggestions

Please open an issue [here](https://github.com/longmore/egg-proxy-middleware/issues).

## License

[MIT](LICENSE)
