var webpack = require("webpack");
var path = require('path');
var DEV = process.env.NODE_ENV !== 'production';
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var autoprefixer = require('autoprefixer');
var WebpackNotifierPlugin = require('webpack-notifier');


module.exports = {
    entry: './src/js/main.tsx',
    output: {
        filename: DEV ?  'app.js' : 'app.[hash].js',
        path:  path.resolve(__dirname, 'public'),
        publicPath: '/'

    },
    devtool: DEV ? "source-map" : false,
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'awesome-typescript-loader'
            },
            {
                test: /\.js$/,
                enforce: "pre",
                loader: "source-map-loader"
            },
            {
                test: /\.json$/,
                loader: "json-loader"
            },
            {
                test: /\.(scss|css)$/,
                use: ExtractTextPlugin.extract({use: [
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: true,
                            sourceMap: true
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: [
                                autoprefixer
                            ],
                            sourceMap: true
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true
                        }
                    }
                ]})
            },
            {
                test: /\.(png|jpg|gif)$/,
                loader: 'url-loader',
                query: {
                    limit: 28192
                }
            },
            {
                test: /\.(svg|woff|woff2|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
                loader: "file-loader",
                query: {
                    name: 'fonts/[name].[ext]',
                    publicPath: '../'
                }
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json']
    },
    plugins: [
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en-nz/),
        new WebpackNotifierPlugin({ title: 'CataLex Sign' }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(DEV ? 'development' : 'production')
            },
            DEV: DEV
        }),
        new CopyWebpackPlugin([
            {
                from: 'src/static',
                to: './'
            }
        ]),
        new ExtractTextPlugin(DEV ? '[name].css' : '[name].[hash].css'),
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en-nz/),
        function() {
            if (!DEV) {
                this.plugin("done", function(stats) {
                  require("fs").writeFileSync(
                    path.join(__dirname, "stats.json"),
                    JSON.stringify(stats.toJson().assetsByChunkName));
                });
            }
        },
       /* !DEV ? new CleanWebpackPlugin(['public'], {
          verbose: true,
          dry: false
        }) : function(){}, */

        !DEV ? new webpack.optimize.UglifyJsPlugin() : function(){},
        new CopyWebpackPlugin([
                { from: 'node_modules/pdfjs-dist/build/pdf.worker.min.js', to: './app.worker.js'}
        ]),
        new HtmlWebpackPlugin({
            template: 'src/static/index.ejs',
            inject: 'body'
        })
    ]
};