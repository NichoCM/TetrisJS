import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ScriptExtHtmlWebpackPlugin from 'script-ext-html-webpack-plugin';
export default {
    entry: path.join(__dirname, './index.js'),
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].bundle.js'
    },
    module: {
        rules: [{
            test: /\.js/,
            exclude: /(node_modules|bower_components)/,
            use: [{
                loader: 'babel-loader',
                options: {
                    "presets": [["@babel/preset-env"], ["@babel/preset-typescript"]]
                }
            }]
        },
        {
            test: /\.ts/,
            exclude: /(node_modules|bower_components)/,
            use: [{
                loader: 'babel-loader',
                options: {
                    "presets": [["@babel/preset-env"], ["@babel/preset-typescript"]]
                }
            }]
        }]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Custom template',
            template: path.join(__dirname, './index.html')
        }),
        new ScriptExtHtmlWebpackPlugin({
            defaultAttribute: 'defer'
        })
    ],
    stats: {
        colors: true
    },
    devtool: 'source-map',
    mode:"development",
    devServer: {
        contentBase: './dist',
        inline:true,
        port: 3000
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
    }
};