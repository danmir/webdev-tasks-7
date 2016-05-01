var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: [
        'babel-polyfill',
        'webpack-hot-middleware/client',
        './bundles/page/page'
    ],
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js',
        publicPath: '/static/'
    },
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new ExtractTextPlugin('[name].css')
    ],
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel',
                exclude: [/node_modules/, /snap.svg.js/],
                include: __dirname,
                query: {
                    presets: ['es2015', 'stage-0'],
                    plugins: ['transform-runtime']
                }
            },
            {
                test: /\.css?$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
                // include: __dirname
            },
            {
                test: /\.styl$/,
                loader: ExtractTextPlugin.extract('css-loader!stylus-loader'),
                exclude: /node_modules/
            },
            {
                test: /\.png$/,
                loader: 'file-loader'
            },
            // {
            //     test: require.resolve('snapsvg'),
            //     loader: 'imports-loader?this=>window,fix=>module.exports=0'
            // },
        ]
    }
};
