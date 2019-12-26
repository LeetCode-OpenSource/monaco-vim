const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

const pkg = require('./package.json')

function getOutput(isProd = false) {
  const data = {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  }

  if (!isProd) {
    return data
  }

  data.libraryTarget = 'umd'
  data.library = 'MonacoVim'
  data.globalObject = 'self'
  return data
}

module.exports = (_env, argv) => {
  const isProd = argv.mode === 'production'

  return {
    target: 'web',
    entry: {
      'monaco-vim': isProd ? './src/index.ts' : './example/demo.js',
    },
    output: getOutput(isProd),
    resolve: {
      extensions: ['.wasm', '.mjs', '.js', '.json', '.ts'],
    },
    module: {
      rules: [
        {
          test: /\.(t|j)sx?$/,
          exclude: /node_modules/,
          loader: 'ts-loader',
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(ttf|eot|woff|woff2)$/i,
          use: 'file-loader',
        },
      ],
    },
    plugins: isProd
      ? [
          new webpack.BannerPlugin({
            banner: [pkg.name, `Version - ${pkg.version}`, `Author - ${pkg.author}`, `License - ${pkg.license}`].join(
              '\n',
            ),
          }),
        ]
      : [
          new HtmlWebpackPlugin({
            template: path.join(__dirname, './example/index.html'),
          }),
          new MonacoWebpackPlugin(),
        ],
    externals: isProd
      ? {
          'monaco-editor': {
            root: 'monaco',
            commonjs: 'monaco-editor',
            commonjs2: 'monaco-editor',
            amd: 'vs/editor/editor.main',
          },
          'monaco-editor/esm/vs/editor/common/controller/cursorTypeOperations': {
            commonjs: 'monaco-editor/esm/vs/editor/common/controller/cursorTypeOperations',
            commonjs2: 'monaco-editor/esm/vs/editor/common/controller/cursorTypeOperations',
            amd: 'vs/editor/common/controller/cursorTypeOperations',
          },
        }
      : {},
  }
}
