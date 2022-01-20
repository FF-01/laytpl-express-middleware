/**

 @Name : laytpl NodeJS模板引擎
 @Author: 贤心
 @Site：http://laytpl.layui.com
 @License：MIT

 */

var path = require('path')
var dirname = path.dirname
var extname = path.extname
var join = path.join
var fs = require('fs')
var read = fs.readFileSync;

var config = {
  open: '{{',
  close: '}}',
  cache: false
};

var tool = {
  exp: function(str){
    return new RegExp(str, 'g');
  },
  //匹配满足规则内容
  query: function(type, _, __){
    var types = [
      '#.+?'   //js语句
      ,'([^{#}])*?' //普通字段
    ][type || 0];
    return exp((_||'') + config.open + types + config.close + (__||''));
  },
  escape: function(html){
    return String(html||'').replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
  },
  error: function(e){
    var error = 'Laytpl Error：';
    typeof console === 'object' && console.error(error + e);
    return error + e;
  },
  /**
   * @param {String|String[]} name
   * @param {Object} options
   */
  reinclude: function(name, options) {
    var file = options.filename;
    if (!file) throw new Error('filename option is required for includes');

    name = typeof name === 'string' ? [name] : name
    var lastItemIndex = name.length - 1
    var fixNames, lastName = name[lastItemIndex]
    // Check name list size more than one
    if (name.length > 1) {
      // Filter off all items expect last one
      fixNames = name.slice(0, lastItemIndex).map(dirname)
      fixNames.push(lastName)
    } else {
      fixNames = [lastName]
    }

    var path = join(dirname(file), ...fixNames);
    var ext = extname(lastName);

    if (!ext) path += '.html';
    return read(path, 'utf8');
  }
};

var exp = tool.exp, cache = {}, splitstr = 'var _________;';

//嵌套模板 - 外部调用
/**
 * @param {String|String[]} names
 * @param {Object} options
 */
exports.include = function(names, options){
  var tpl = tool.reinclude(names, options);
  return exports.getParse(tpl, options);
};

//编译模版
exports.parse = function(tpl, options){
  var that = this, file = options.filename, includeStack = options.includeStack = options.includeStack || [];
  var jss = exp('^'+config.open+'#', ''), jsse = exp(config.close+'$', '');
  tpl = tpl.replace(/[\r\t\n]+/g,  splitstr)
  .replace(exp(config.open+'#'), config.open+'# ')
  .replace(exp(config.close+'}'), '} '+config.close).replace(/\\/g, '\\\\')

  //不匹配指定区域的内容
  .replace(exp(config.open + '!(.+?)!' + config.close), function(str){
    str = str.replace(exp('^'+ config.open + '!'), '')
    .replace(exp('!'+ config.close), '')
    .replace(exp(config.open + '|' + config.close), function(tag){
      return tag.replace(/(.)/g, '\\$1')
    });
    return str
  })

  //匹配JS规则内容
  .replace(/(?="|')/g, '\\').replace(tool.query(), function(str){
    str = str.replace(jss, '').replace(jsse, '');
    str = str.replace(exp(splitstr), '');
    return '";' + str.replace(/\\/g, '') + ';view+="';
  })

  //匹配普通字段
  .replace(tool.query(1), function(str){
    var start = '"+(';
    if(str.replace(/\s/g, '') === config.open+config.close){
      return '';
    }
    str = str.replace(exp(config.open+'|'+config.close), '');
    if(/^=/.test(str)){
      str = str.replace(/^=/, '');
      start = '"+_escape_(';
    }
    if(/^\s*include/.test(str)){
      var match = str.match(/^\s*include\s+([\s\S]+?)\s*$/)||[];
      if(!match[1]) return '';
      includeStack.push(match[1])
      var incTpl = exports.parse(tool.reinclude(includeStack, options), options);
      includeStack.pop()
      return incTpl
    }
    return start + str.replace(/\\/g, '') + ')+"';
  });
  return tpl;
};

//获取编译后的模版
exports.getParse = function(tpl, options){
  var file = options.filename;
  tpl = '"use strict";var view = "' + exports.parse(tpl, options) + '";return view;';
  try {
    cache['tpl_' + file] = tpl = new Function('d, _escape_', tpl);
    return tpl(options, tool.escape);
  } catch(e) {
    delete cache['tpl_' + file];
    return tool.error(e);
  }
};

//渲染
exports.render = function(tpl, options){
  var that = this, file = options.filename;
  if(config.cache && cache['tpl_' + file]){
    tpl = cache['tpl_' + file](options, tool.escape);
  } else {
    tpl = that.getParse(tpl, options);
  }
  return tpl.replace(exp(splitstr), config.min ? '' : '\n');
};

//读取文件
exports.renderFile = function(file, options, fn){
  var tpl;
  if ('function' == typeof options) {
    fn = options, options = {};
  }
  options.filename = file;

  try {
    if(config.cache){
     tpl = options.cache || (function(){
      if(cache[file]){
        return cache[file];
      } else {
        return cache[file] = read(file, 'utf8');
      }
     }());
    } else {
      tpl = read(file, 'utf8');
    }
  } catch(err) {
    fn(err);
    delete cache[file];
    return;
  };
  fn(null, exports.render(tpl, options));
};

exports.config = function(options){
  options = options || {};
  for(var i in options){
    config[i] = options[i];
  }
};

exports.__express = exports.renderFile;
