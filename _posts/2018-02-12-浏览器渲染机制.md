---
title: 浏览器渲染机制	 
tags: [Brower]
layout: post
---
### 一、加载到HTML文件后渲染引擎渲染流程？
1、浏览器下载HTML文件并开始解析DOM，构建dom树。

2、遇到link[rel=stylesheet]的时候，将其加入资源下载队列，构建Style Rules。继续解析dom（css没有阻塞dom解析）。此时DOM树依旧在构建中，也就是CSS规则树和DOM树的构建是同时进行的。

3、DOM树和CSS规则树关联，构建render tree。此时如果css规则树未构建完毕而DOM树已经构建完毕，则需要等待其完成再执行关联构建render tree。

4、Layout 根据Render Tree计算每个节点的信息。

5、Painting 根据计算好的信息绘制页面。

### 二、javascript在什么时候执行？

在解析构建DOM树的过程中，遇见script标签有三种情况

1、css文件没有下载解析完成，阻塞DOM，并行下载js，等待解析。css文件解析完成后，执行js代码。（此时css阻塞了js，进而阻塞了dom。）

2、css 解析完成。下载js文件并执行。（js 阻塞dom解析）

3、script加上defer,async两个属性，资源下载则不会阻塞dom的解析。这两个属性的不同点在于：
- 资源下载完成后，async会立即执行代码，此时会阻塞dom的解析；
- 而defer会在dom解析完后执行代码，该过程也属于dom解析过程，也就是js代码执行完成后dom树才算是真正的构建完成，触发DOMContentLoaded事件。
![image](https://user-images.githubusercontent.com/10647005/36082337-7ad8d040-0fe3-11e8-9893-4df645a56a3a.png)

### 三、图片资源在什么时候加载？

1、img标签图片：解析html的过程中，遇到img标签则加载图片。被设置了不可见的元素也会加载，只是不会渲染。图片异步加载， 不阻塞dom的解析。

2、background-img 背景图片

（1）dom树和css规则树匹配时，加载dom元素所对应css规则中的背景图片。

（2）如果dom元素设置了不可见，背景图片也会加载。（遍历元素，会加载背景图片，但不会产出到render树）

（3）如果dom元素的父元素设置了不可见，背景图片不会加载。（遍历父元素为不可见，则不会遍历子元素，不会加载背景图片）。

（4）伪类样式上的背景图片在触发伪类的时候才进行加载。

（5）css规则树中存在而dom不存在的元素的背景图片不加载。

### 四、所有资源加载完毕会触发window.onload事件。

参考：https://developers.google.com/web/fundamentals/performance/critical-rendering-path/?hl=zh-cn