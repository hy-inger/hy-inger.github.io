---
title: 接入iframe通信的一些问题
tags: [html]
layout: post
---

#### 1. 加载顺序问题

访问iframe，获取数据需要使用父页面的token。父页面通过异步请求获取权限token，由于加载顺序无法保证，可能导致iframe中获取的token为undefined。

解决办法：

a. 当父页面成功获取token后，再对iframe的src进行赋值，加载iframe页面。

- 优点：
    - 保证加载顺序，确保iframe能够获取token，兼容性高。
    - 不会阻塞父页面的加载。
- 缺点：
    - 无法与父页面并行加载。（利弊共存）
    - 加载iframe时，页面处于忙碌状态。

b. 仍设置iframe的src。父页面获取token成功后，通过postMessage/onMessage进行通信。

- 除了获取token，优缺点与上面a相反。

其他：message为HTML5的新api，在IE下支持度不高，而在其他浏览器支持度还是良好的。

- 可能存在的加载顺利问题
	- getToken与iframe加载
	- 获取contentWindow与iframe加载
	- 动态加载iframe页面和iframe.onload的绑定

#### 2.使用message api实现iframe与父页面之间的跨域通信。

a. 为了避免安全问题，postMessage应该始终设置第二个参数，指定接受消息的窗口。

b. onMessage 应该始终使用origin和source属性验证发送方身份。

c. 调用postMessage的元素为iframe的窗口元素，iframe.contentWindow；而iframe的Dom元素未加载完成之前，contentWindow为null。

因此需要先为iframe绑定onload事件，在该事件中执行postMessage。iframe文档加载完成即调用onload。 


#### 3. 缓存问题

浏览器可能会对iframe的内容进行缓存，虽然设置了etag协商缓存但并没有生效，index.html加载为旧文件。由于服务器内容已更新，无法加载旧的静态资源（文件名使用md5戳防止缓存，因此文件已被替换更新）

解决办法：对入口文件index.html设置绝对不缓存`cache-control: no-store`，其他静态资源设置协商缓存`Etag`

#### 后端问题

某一次django升级后，`set-cookie`一直失效。排查到最后发现是`SameSite`属性被设置了默认值`strict`导致cookie无法跨站点设置。


*参考阅读*

SameSite
限制第三方站点发送cookie

当一个请求本身的 URL 和它的发起页面的 URL 不属于同一个站点时，这个请求就算第三方请求。那么怎样算是同一个站点？是我们经常说的同源（same-origin）吗，cross-origin 的两个请求就不属于同一个站点？显然不是的，foo.a.com 和 bar.a.com 是不同源的，但很有可能是同一个站点的，a.com 和 a.com:8000 是不同源的，但它俩绝对是属于同一个站点的，浏览器在判断第三方请求时用的判断逻辑并不是同源策略，而是用了 Public Suffix List 来判断。

有些同学可能会这么想：一个域名可以用逗号分成多个字段，如果两个域名的最后两个字段都是相同的，那它们就是同一个站点的，比如 foo.a.com 和 bar.a.com 就是。但是 sina.com.cn 和 sohu.com.cn 也满足这个条件啊，它们绝对不是同一个网站吧，那是不是说浏览器需要维护一份列表来记录所有国家颁布的二级域名啊，但是不仅国家可以开放三级域名给不同的网站使用，普通的网站也可能会，比如新浪就开放 *.sinaapp.com 三级域名注册，foo.sinaapp.com 和 bar.sinaapp.com 是两个不同的网站，那 sinaapp.com 也应该加入那个列表中，以及 github.io 等等。

Mozilla 很久之前就将自己维护的这个域名后缀列表放到了 github 上，起名为 Public Suffix List，里面不仅有 IANA 颁布的顶级域名，众多二级域名，还有三级域名比如 compute.amazonaws.com，甚至四级域名比如 compute.amazonaws.com.cn，判断两个 URL 是不是同一个网站的，只要判断两个 URL 的域名的 public suffix（按能匹配到的最长的算）以及它前面的那个字段（后面用 public suffix+1 指代）是否都相同，是的话就是同一个站点的，否则不是。比如 www.sina.com.cn 的 public suffix+1 是 sina.com.cn，www.sohu.com.cn 的 public suffix+1 是 sohu.com.cn， 两者不一样，所以不属于同一个站点；再比如 nanzhuang.taobao.com 的 public suffix+1 是 taobao.com，nvzhuang.taobao.com 的 public suffix+1 也是 taobao.com，那么它俩就是同一个站点的。

Public Suffix List 最初被 Firefox 用在限制 Set-Cookie 响应头的 Domain 属性上的， Domain 不能设置成一个比自己网站的 public suffix+1 还高层级的域名，比如 foo.w3c.github.io 就不能设置 Set-Cookie: foo=1; Domain=github.io，最高只能设置成 Set-Cookie: bar=1; Domain=w3c.github.io，现在其它浏览器也都在用同样的列表做同样的限制。DOM API 里的 document.domain 后来也加上了这个限制。有些浏览器还用这个列表来高亮地址栏上的 URL 中的 public suffix+1 部分（Firefox 和 IE 有用，Chrome 是高亮了整个域名），此外浏览器们还用该列表干一些其它琐事，比如将历史网址按不同站点排列等等。

浏览器们会定期同步这份列表，比如 Chrome 是在每个正式版本发布之前同步一次。