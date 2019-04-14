---
title: 与前端相关的Nginx配置
tags: [Nginx]
layout: post
---

### 前端开发nginx配置

[1. 开启压缩和自定义特殊文件MIME响应头](#1-开启压缩和自定义特殊文件mime响应头)

[2. nginx 缓存配置说明](#2-nginx-缓存配置说明)

[3. SSL配置和启用HSTS(HTTP Strict Transport Security，HTTP严格传输安全)](#3-ssl配置和启用hstshttp-strict-transport-securityhttp严格传输安全)

[4. CSP策略](#4-csp策略)

> nginx 配置一般由后端开发人员配置，因此以下内容作为学习了解。与前端有关的配置总结如下，根据实际项目进行修改，再告知后端人员进行配置即可。

```
    server{
        # 压缩配置
        gzip on;                            # 开启http gzip 压缩输出
        gzip_min_length 1k;        # 不压缩临界值。默认，一般不改
        gzip_buffers 4 16k;          # 设置系统获取几个单位的缓存用于存储gzip的压缩结果数据流。默认，一般不改
        gzip_comp_level 6 ;         # 压缩级别(级别越高,压的越小,越浪费CPU计算资源)。推荐6
        gzip_types text/plain application/x-javascript text/css application/xml text/javascript application/x-httpd-php image/jpeg image/gif image/png; # 进行压缩的文件类型
        gzip_http_version 1.0|1.1;          # 进行压缩的http协议版本。默认1.1
        gzip_vary on|off;                        # 是否传输gzip压缩标志

        include /etc/nginx/mime.types;                    #加入nginx默认的文件MIME响应头
        types {                                                             #自定义文件响应头
            image/webp webp;                                    #定义webp图片格式响应头
            text/mainfest mainfest;                             #定义mainfest文件响应头
        }

        # 缓存配置, example
        etag on;
        location ~\.(gif|jpg|png)$ {
            expires 10d;　#设置图片缓存时间
            add_header Cache-Control max-age=60
        }

        # HSTS
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains;preload" always;

        
        # CSP 策略
        Content-Security-Policy: default-src 'self' *.trusted.com; img-src https://example.com/; frame-src https: ; style-src: 'unsafe-inline'; connect-src: https://*.example.xx.com; 

        # 配置block-all-mixed-content规则，所有非https的资源都不允许加载。
        Content-Security-Policy: block-all-mixed-content; 

        # 或

        # 配置upgrade-insecure-requests, 浏览器会帮忙做HTTP-->HTTPS的转换。
        Content-Security-Policy: upgrade-insecure-requests
    

    }

```

#### 1. 开启压缩和自定义特殊文件MIME响应头

nginx中很多配置既可写在http,亦可写在server和location上下文中,
具体可查看[官方文档](http://nginx.org/en/docs/http/ngx_http_core_module.html)

```
http {
    gzip on;                            # 开启http gzip 压缩输出
    gzip_min_length 1k;        # 不压缩临界值。默认，一般不改
    gzip_buffers 4 16k;          # 设置系统获取几个单位的缓存用于存储gzip的压缩结果数据流。默认，一般不改
    gzip_comp_level 6 ;         # 压缩级别(级别越高,压的越小,越浪费CPU计算资源)。推荐6
    gzip_types text/plain application/x-javascript text/css application/xml text/javascript application/x-httpd-php image/jpeg image/gif image/png; # 进行压缩的文件类型
    gzip_http_version 1.0|1.1;          # 进行压缩的http协议版本。默认1.1
    gzip_vary on|off;                        # 是否传输gzip压缩标志

    include /etc/nginx/mime.types;                    #加入nginx默认的文件MIME响应头
    types {                                                             #自定义文件响应头
        image/webp webp;                                    #定义webp图片格式响应头
        text/mainfest mainfest;                             #定义mainfest文件响应头
    }
}
```
**[⬆ back to top](#前端开发nginx配置)**

#### 2. nginx 缓存配置说明

```
server {
    etag on; #开启etag缓存

    #缓存响应的修改时间小于或等于“If-Modified-Since”请求头字段中的时间。
    #if_modified_since　before;

    server {
        listen 80;

        location ~\.(gif|jpg|png)$ {
            expires 10d;　#设置图片缓存时间
            add_header Cache-Control max-age=60
        }
    }
}

```

- `expires` 绝对缓存时间, 以分钟为单位，即下一次请求时，请求时间小于服务端返回的到期时间，直接使用缓存数据。
- `Cache-Control` 相对缓存时间，max-age表示以秒为单位的缓存时间。`(会覆盖expires设置)`Cache-Control其他常见值及含义如下
    - `private`(默认): 只能在浏览器中缓存, 只有在第一次请求的时候才访问服务器, 若有max-age, 则缓存期间不访问服务器.
    - `public`: 可以被任何缓存区缓存, 如: 浏览器、服务器、代理服务器等.
    - `no-cache`: 每次使用缓存前需要将请求提交给原始服务器进行验证，若缓存未过期（返回304）则使用本地缓存。
    - `no-store`: 所有数据内容不会被缓存，每次请求都重新访问服务器。
    - `no-transform`: 不得对资源进行转换或转变。Content-Encoding, Content-Range, Content-Type等HTTP头不能由代理修改.
    - `must-revalidate`: 缓存过期前（max-age），可以使用缓存；缓存过期后每次请求都必须访问源服务器（区别于缓存服务器）进行验证.
    - `max-stale`:  以秒为单位，表示客户端支持接收一个过期不超过指定秒数的资源.
- `If-Modified-Since/Last-Modified` 
    - `Last-Modified`：服务器在响应请求时，告诉浏览器资源的最后修改时间。
    - `If-Modified-Since`: 浏览器再次请求服务器时，通过发送If-Modified-Since 头，带上上一次请求获得的修改时间（在Last-Modified头里）发送到服务器，服务器会判断这个时间之后文件有没有改变，如果没有改变返回状态值304，如果有返回新文件，状态值200．可选值有 `off`, `exact` 和 `before` .
        - `off` If-Modified-Since”请求头字段被忽略
        - `exact` 完全匹配
        - `before` 响应的修改时间小于或等于“If-Modified-Since”请求头字段中的时间。
- `etag` 实体内容的hash字符串(md5或者SHA1的算法计算出来的)，这个方法更准确但是更消耗服务器的CPU。`(优先级高于Last-Modified / If-Modified-Since)`
    - 浏览器第一次请求资源时，服务器会返回Etag值
    - 浏览器再次请求资源时，通过发送If-None-Match 头，带上Etag值，服务器会进行比较，如果一样就返回304，不一样则发送最新文件，返回值200。可选值有　`on` 和　`off`, 分别表示开启和关闭.

**[⬆ back to top](#前端开发nginx配置)**

#### 3. SSL配置和启用HSTS(HTTP Strict Transport Security，HTTP严格传输安全)

启用HSTS首先要启用SSL,使用SSL需要先生成证书。

```
server {
    ssl on;                                                             # 开启ssl配置
    ssl_certificate /etc/nginx/ssl/server.crt;        # 证书公钥
    ssl_certificate_key /etc/nginx/ssl/server.key;      #证书私钥

    # ssl_protocols SSLv3 TLSv1 TLSv1.1 TLSv1.2;     # 加密协议，默认
    # ssl_ciphers ALL:!ADH:!EXPORT56:RC4+RSA:+HIGH:+MEDIUM:+LOW:+SSLv2:+EXP; # 加密套件，默认
    ssl_prefer_server_ciphers on;                         # 设置协商加密算法时，优先使用我们服务端的加密套件，而不是客户端浏览器的加密套件。
}
```

HSTS允许一个 HTTPS 网站要求浏览器总是通过 HTTPS 来访问，这使得攻击者在用戶与服务器通讯过程中拦截、篡改信息以及冒充身份变得更为困难。只要在 Nginx 配置文件加上以下头信息就可以了：
```
server {
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains;preload" always;
}
```
- max-age：设置单位时间内強制使用 HTTPS 连接
- includeSubDomains：可选，所有子域同时生效
- preload：可选，非规范值，用于定义使用『HSTS 预加载列表』
- always：可选，保证所有响应都发送此响应头，包括各种內置错误响应

一个简单https服务例子

```
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    # 通过使用永久重定向到HTTPS网站的主页来阻止深层链接
    return 301 https://$host;

    # 或者将所有HTTP链接重定向到匹配的HTTPS页面
    # return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name www.example.com;

    ssl on;                                                             # 开启ssl配置
    ssl_certificate /etc/nginx/ssl/server.crt;        # 证书公钥
    ssl_certificate_key /etc/nginx/ssl/server.key;      #证书私钥

    # ssl_protocols SSLv3 TLSv1 TLSv1.1 TLSv1.2;     # 加密协议，默认
    # ssl_ciphers ALL:!ADH:!EXPORT56:RC4+RSA:+HIGH:+MEDIUM:+LOW:+SSLv2:+EXP; # 加密套件，默认
    ssl_prefer_server_ciphers on;                         # 设置协商加密算法时，优先使用我们服务端的加密套件，而不是客户端浏览器的加密套件。
    
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY";                          # 避免点击劫持，确保被不会嵌入到frame 或 iframe
}

```
**[⬆ back to top](#前端开发nginx配置)**

#### 4. CSP策略

CSP (Content Security Policy, 全称: 内容安全策略)是一种以可信白名单作机制，来限制网站中是否可以包含某来源的资源。有助于检测并缓解某些类型的攻击，包括跨站脚本（XSS）和数据注入攻击。优先采用最先定义的策略。

1、 在配置文件中添加`Content-Security-Policy `, 并配置相应的值，便可以控制用户代理可以为该页面获取哪些资源。 

一个简单的CSP例子

    server {
        Content-Security-Policy: default-src 'self' *.trusted.com; img-src https://example.com/; frame-src https: ; style-src: 'unsafe-inline'; connect-src: https://*.example.xx.com
    }

说明：

    // 默认规则，当相关资源未定义规则时，就使用默认规则。
    // self , 表示只可请求来自同一源的内容（不包括其子域名）
    // *.trusted.com , 表示可请求该域名和子域名下的内容
    default-src 'self' *.trusted.com  




    // 其他特殊规则, 相关资源使用定义规则（覆盖默认规则）
    // img-src https://example.com/ , 表示允许图片从https://example.com/加载（不包括其子域名）
    // frame-src https: , 表示frame允许所有https链接
    // style-src 'unsafe-inline', 表示允许内联脚本
    // connect-src: https://*.example.xx.com , 包括 XMLHttpRequest、WebSocket 等链接,允许从https://*.example.xx.com和其子域加载
    img-src https://example.com/
    frame-src https: 
    style-src: 'unsafe-inline'; 
    connect-src: https://*.example.xx.com

其中frame-src规则在CSP2中被废弃，在CPS3又被恢复。其他规则指令查看[CSP官方文档](https://www.w3.org/TR/CSP/)
 
2、CSP默认不支持内联样式和内联脚本。支持内联样式和内联脚本需要启用规则`unsafe-inline`, 或使用`Nonces`和`Hashes`规则
    
    Content-Security-Policy: script-src unsafe-inline unsafe-eval; style-src unsafe-inline

(1)`Nonces` 是通过在 CSP 中指定允许资源的序号，达到限制非法 inline 代码的目的。只有与 CSP 策略中序号一致的代码可以执行。实际使用中为了确保安全，nonce 的值都会经过 base64 编码。

一个简单的例子
    
    // 配置文件
    Content-Security-Policy: script-src 'nonce-1'
    
    // html文件
    <script nonce="1">alert(0);</script>

(2)`Hashes` 是通过在 CSP 中指定允许资源的摘要签名，达到限制非法 inline 代码的目的。支持 sha256、sha384 和 sha512 三种算法。计算hash值时，标签不算在内。

一个简单的例子
    
    // 配置文件
    Content-Security-Policy: script-src 'sha256-d3ii1Pel57UO62xosCMNgTaZJhJa87Gd/X6e7UdlEU8='
    
    // html文件
    <script>alert(0);</script>


3、避免加载混合内容引起的问题
        
    混合内容：HTTPS网页中加载的HTTP资源

(1) 配置`block-all-mixed-content`规则，所有非https的资源都不允许加载。
    
    Content-Security-Policy: block-all-mixed-content

(2) 配置`upgrade-insecure-requests`, 浏览器会帮忙做HTTP-->HTTPS的转换。

- 页面所有 HTTP 资源，会被替换为 HTTPS 地址再发起请求；
- 页面所有站内链接，点击后会被替换为 HTTPS 地址再跳转；


    Content-Security-Policy: upgrade-insecure-requests  // 只替换协议部分，所以只适用于 HTTP/HTTPS 域名和路径完全一致的场景

>upgrade-insecure-requests 指令会在 block-all-mixed-content 之前执行；如果前者执行成功，后者就不再发挥任何作用。推荐的做法是设置二者之一，而不是全部。

**[⬆ back to top](#前端开发nginx配置)**

参考:

[官方教程](http://nginx.org/en/docs/beginners_guide.html)

[官方HSTS文档](https://www.nginx.com/blog/http-strict-transport-security-hsts-and-nginx/)