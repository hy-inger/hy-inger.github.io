---
title: Chrome Network Resource Timing详解
tags: [debug]
layout: post
---

在网页加载过慢的情况下，可以使用Chrome浏览器的调试工具，Network timeline查看资源加载时间，了解是否为资源加载过程问题。
下面详细的对timeline各指标进行解析，包括可能出现问题及应该注意方向。
![image2017-3-27 14 17 50](https://cloud.githubusercontent.com/assets/10647005/26441821/a540e032-4164-11e7-81ed-02fed9245dc2.png)

## 1、Queueing
  排队时间。在http1下浏览器对每次TCP连接的数量有所限制。比如Chrome浏览器是限制同一域名下支持同时6个TCP连接。如果请求的资源超过6个并资源优先级比较低，便会进入队列进行排队等待其他连接释放。

  Queueing就是这个等待时间。

  合理使用多域名，增加并发连接数量。

  http2支持多路复用，即没有TCP连接数量限制。


## 2、Stalled
  请求允许被发出到请求真正发出的时间间隔。
  也就是浏览器收到一个指令，指令说你可以准备发出请求了，于是浏览器就准备代理协商，如果有已经建好的链接，还会等待可建立的TCP连接被重新复用的时间（不包括DNS查询、TCP建立连接等时间）。等这些做完了，请求也就可以发出了。

  Stalled就是收到这个指令到请求可以发出的时间间隔。
  已建立的TCP连接确认是否可被继续使用需要一个检测过程，这个检测过程的时间会包含在stalled中。
  如果这个检测返回错误，客户端会连续发送可复用tcp连接继续进行检测，如果持续检测超过最大次数仍然没有连接检测成功、查找到可复用的tcp连接。客户端便认为没有可复用的连接，检测结束。记录时间。（在这之后会发送一个新的TCP请求连接，已不属于stalled时间间隔）

  如果出现stalled阶段过长，可能是丢包所致，说明网络不太好或服务端有问题。
  参考：[http://fex.baidu.com/blog/2015/01/chrome-stalled-problem-resolving-process/](http://fex.baidu.com/blog/2015/01/chrome-stalled-problem-resolving-process/)

## 3、Proxy Negotiation
   #与代理服务器连接协商所用的时间。（需要使用代理服务器进行访问的url才会有这个时间）

## 4、DNS Lookup
  DNS查询所用时间。当访问一个新域时需要进行DNS解析，这个时间可能会有点长。
  如果在hosts设置了DNS、或者浏览器已经缓存了DNS，这个时间就为0，忽略不计了。

## 5、Initial Connection / Connecting
  建立连接所用时间。包括TCP握手和多次尝试握手、处理SSL的时间。
  TCP建立连接，可能由于网络原因或服务器原因导致丢包，一次握手不成功，于是会出现多次尝试握手情况。
  如果在stalled阶段成功检测到可复用TCP连接，这个时间同样也会为0，忽略不计。

## 6、SSL
  完成SSL握手所用时间。

## 7、Request Sent / Sending
  请求发出时间。将http请求报文第一个字节发出开始到最后一个字节发出结束的时间。通常非常小。
  如果请求报文比较大，这个时间可能会长一点，不过影响不大。

## 8、Waiting (TTFB)
  等待服务端初始响应的时间。也就是从请求发出开始，服务端接收到请求，返回数据，客户端接收到第一个字节的这一段时间。
  这个时间段代表服务器处理和返回数据网络延时时间。如果时间过长，说明可能客户端与服务端之间网络较差或服务器响应较慢。
  服务器优化的目的就是要让这个时间段尽可能短。

## 9、Content Download / Downloading
  接收响应数据时间。也就是客户端接收到服务端返回的第一个字节开始，到接收到最后一个字节结束的这一段时间。
  一般来说时间也比较小，如果返回体比较大，这个时间也可能会长一点。

参考：[https://developers.google.com/web/tools/chrome-devtools/network-performance/understanding-resource-timing](https://developers.google.com/web/tools/chrome-devtools/network-performance/understanding-resource-timing)