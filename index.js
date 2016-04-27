var webpack = require('webpack');
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');
var config = require('./webpack.config');

var serveStatic = require('serve-static');

const morgan = require('morgan');
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var app = new (require('express'))();
var port = 3000;

var compiler = webpack(config);
app.use(webpackDevMiddleware(compiler, {noInfo: false, publicPath: config.output.publicPath}));
app.use(webpackHotMiddleware(compiler));

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(cookieParser());

app.use(function (req, res, next) {
    // res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', "GET,PUT,POST,DELETE");
    next();
});

app.use((req, res, next) => {
    req.commonData = {
        meta: {
            description: 'BigPig',
            charset: 'utf-8'
        },
        page: {
            title: 'Хрюндель'
        },
        isDev: process.env.NODE_ENV === 'development'
    };

    next();
});

app.get("/", function (req, res) {
    res.sendFile(__dirname + '/dist/page.html')
});

app.listen(port, function (error) {
    if (error) {
        console.error(error)
    } else {
        console.info("==> Listening on port %s. Open up http://localhost:%s/ in your browser.", port, port)
    }
});
module.exports = app;
