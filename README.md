
## 介绍(Introduce)
laytpl是一款精妙绝伦的JavaScript模板引擎，能完美运行在浏览器客户端以及Node.js平台下，并且对Express框架无缝兼容，模版语法遵循Native JavaScript。laytpl试图打造极致的模版渲染。


## 安装(Installation)
```
$ npm install laytpl
``` 
## 模版语法(Grammar)

输出一个普通字段，不转义html：
```
{{ d.field }}
```
输出一个普通字段，并转义html：
```
{{= d.field }}
```
逻辑处理： 
```
{{# JavaScript statement }}
```  
不匹配指定区域
```
{{!  内容区域  !}}
如：
{{! 
{{ d.key }} 则不会解析这中间的内容，原模原样输出
!}} 
```
    
## 使用(Usage)
此处只演示Express下的使用方式

### 第一步
在项目入口文件(如app.js)指定view engine，并且定义模版文件扩展名为.html
```
var express = require('express');
var app = express();

var laytpl = require('laytpl');
app.engine('.html', laytpl.__express);
app.set('view engine', 'html');
```
### 第二步
建立视图(view)，还支持include(扩展名可省略)

```html
{{# if (d.user) { }}
  <h2>{{ d.user.name }}</h2>
{{# } >>
<p>{{ d.intro }}</p>

{{ include footer }}
```
    
### 第三步
渲染(render)
```
app.get('/', function(req, res){
  res.render('index', {
    user: {name: '贤心'},
    intro: '来自中国的前端开发工程师'
  });
});
```    
## 自定义分隔符(Custom delimiters)

Custom delimiters can also be applied globally:
```
laytpl.config({
  open: '{{',
  close: '}}'
});
``` 
## 缓存(cache)
laytpl默认不开启缓存，这在你开发时非常有利。但是当你的模版足够稳定，你如果需要开启该项，只需要按以下设置即可：
```
laytpl.config({
  cache: true
});
```  
开启缓存后的渲染速度将会得到极大的提升。

## 压缩（min）
```
laytpl.config({
  min: true
});
``` 

## 协议(License) 
The MIT License

## 备注（remark）
[官网](http://www.layui.com/demo/laytpl.html)

