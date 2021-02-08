var Advanced = require('advanced'),
    Utils = Advanced.Utils,
    path = require('path');

var app = Advanced((app) => {
    app.use(require('kpc/src/lib/stylus')({
        src: __dirname,
        dest: __dirname + '/.cache'
    }));

    var webpackDev = require('kpc/src/lib/webpackDev'),
        webpackConfig = require('./webpack.config');
    app.use(webpackDev(webpackConfig, app));

    app.use('/docs', Advanced.Express.static(path.resolve(__dirname, '../docs')));
    app.use(Advanced.Express.static(__dirname));
});

app.listen(Utils.c('port'), () => {
    Advanced.Logger.log(`App is listening on port ${Utils.c('port')}`);
});
