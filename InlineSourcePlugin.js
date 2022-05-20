/*
 * @Date: 2022-05-20 15:33:38
 * @LastEditors: 水光 wanli.zhang@perfma.com
 * @LastEditTime: 2022-05-20 15:33:41
 * @FilePath: /cssLoader/Users/zhangwanli/code/InlineSourcePlugin/InlineSourcePlugin.js
 */
const HtmlWebpackPlugin = require('html-webpack-plugin')

// 把外链的标签编程内联的标签
class InlineSourcePlugins {
  constructor({ match }) {
    this.reg = match  // 正则
  }

  // 处理某一个标签
  processTag (tag, compilation) {
    let newTag = {}
    let url = ''
    // link为css，script为js
    if (tag.tagName === 'link' && this.reg.test(tag.attributes.href)) {
      newTag = {
        tagName: 'style',
        attributes: { type: 'text/css' }
      }
      url = tag.attributes.href
    } else if (tag.tagName === 'script' && this.reg.test(tag.attributes.src)) {
      newTag = {
        tagName: 'script',
        attributes: { type: 'application/javascript' }
      }
      url = tag.attributes.src
    }
    if (url) {
      // 文件内容放到newTag标签中
      newTag.innerHTML = compilation.assets[url].source(); // 文件内容放到innerHTML属性中

      // delete compilation.assets[url]   // 删除原有的资源
      // 有url
      return newTag
    }
    // 没有url原路返回
    return tag
  }

  // 处理引入标签的数据
  processTags (data, compilation) {
    let headTags = []
    let bodyTags = []
    // 头部的
    data.headTags.forEach(headTag => {
      headTags.push(this.processTag(headTag, compilation))
    })
    // body的
    data.bodyTags.forEach(bodyTag => {
      bodyTags.push(this.processTag(bodyTag, compilation))
    })
    // console.log({ ...data, headTags, bodyTags })
    return { ...data, headTags, bodyTags }
  }



  apply (compiler) {
    // 通过webpackPlugin来实现  基于html-webpack-plugin
    compiler.hooks.compilation.tap('InlineSourcePlugins', (compilation) => {
      //   alterAssetTagGroups hook
      // AsyncSeriesWaterfallHook<{
      //   headTags: Array<HtmlTagObject | HtmlTagObject>,
      //   bodyTags: Array<HtmlTagObject | HtmlTagObject>,
      //   publicPath: string,
      //   outputName: string,
      //   plugin: HtmlWebpackPlugin
      // }>
      HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tapAsync(
        'alertPlugin',
        (data, callback) => {// data: 要插入html的数据
          // compilation.assets 资源的链接
          callback(null, this.processTags(data, compilation))
        })
    })
  }
}

module.exports = InlineSourcePlugins