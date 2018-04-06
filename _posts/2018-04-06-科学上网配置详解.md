---
title: 科学上网配置详解 Chrome+SwitchyOmega+Shadowsocks  
tags: [Brower]
layout: post
---

有些朋友问我怎么配置科学上网的时候，在网上找一些教程扔给他们也常配不对。感觉主要还是代理和端口不知道怎么配，所以记录一下详细的配置过程吧。
主要工具是Chrome浏览器+SwitchyOmega插件+Shadowsocks。

### 一 、Shadowsocks的安装与配置

1、下载Shadowsocks。各系统客户端[下载地址](https://shadowsocks.org/en/download/clients.html)，[mac客户端下载地址](https://github.com/shadowsocks/shadowsocks-iOS/releases)。

2、下载完成后开始配置。如图所示，首先进行服务器设置，【打开服务器设定】。
     如果有二维码，可以直接选择【从屏幕扫描二维码】。
![qq20180407-3](https://user-images.githubusercontent.com/10647005/38432530-517ad13a-39fa-11e8-8df7-1e8776ea17e7.png)

3、按照图示配置shadowsocks 的服务器 IP、服务器端口、加密方式、密码、代理端口。
![qq20180407-4](https://user-images.githubusercontent.com/10647005/38432650-c768f124-39fa-11e8-9159-0b317bc79b58.jpeg)


4、PAC使用本地PAC，点击【从GFWList更新PAC】。

5、其他配置不用修改。然后打开shadowsocks（如果有的话），点击【全局模式】。

然后就可以打开chrome浏览器，访问https://www.google.com/  。如果访问成功，说明配置正常。


### 二、接下来，配置浏览器自动代理

1、保持shadowsocks全局翻墙模式，访问 Chrome 应用商店安装[SwitchyOmega](https://chrome.google.com/webstore/search/SwitchyOmega?hl=zh-CN)。

2、打开【选项】进行配置。
![image](https://user-images.githubusercontent.com/10647005/38431142-e1abc494-39f5-11e8-8946-eddf7fe3ff88.png)

3、点击【新建情景模式】，按照图示填写选择。
![qq20180407-3](https://user-images.githubusercontent.com/10647005/38432721-09755e2c-39fb-11e8-8fcf-c63f97cf22d1.jpeg)

4、创建后按照图示选择代理协议，填写代理服务器和代理端口。保存。
![qq20180407-0](https://user-images.githubusercontent.com/10647005/38432800-447c1056-39fb-11e8-9150-374b441f1630.jpg)
![img_8659](https://user-images.githubusercontent.com/10647005/38432835-5b0163d0-39fb-11e8-8a81-ba44943d1312.PNG)


5、此时，将shadowsocks改为【自动代理模式】，将SwitchyOmega设置为【自动切换】。
然后访问某个被墙的网址，将网址按照图示加入自动切换列表，以后再访问该网址就会自动使用代理访问。
如果有某个网址访问不了，手动加入自动切换列表是最好的方式。
![image](https://user-images.githubusercontent.com/10647005/38431353-8cf6bba6-39f6-11e8-9f65-cf0940820407.png)
![img_8660](https://user-images.githubusercontent.com/10647005/38432852-6bcd95d0-39fb-11e8-8592-a9844c61839e.PNG)


6、因为开启全局模式会影响其他不需要梯子的网站访问速度，所以一般开启自动代理模式。


### 三、命令行配置shadowsocks（跟图形客户端配置类似，可略过。）
1、使用python安装shadowsocks

```
apt-get install python-pip
pip install shadowsocks

```

2、创建客户端配置文件（即类似图形客户端的配置）
 
```
 vi /etc/shadowsocks/config.json
```

```
      {
      	／／服务器ip或域名均可，若需同时指定多个服务端ip，使用如下例的语法"server":["1.1.1.1","2.2.2.2"]
        "server":"hk.kingss.me",  
        "server_port":13330,               ／／ 服务器端口
        "local_address":"127.0.0.1",      ／／本地监听地址
        "local_port":1082,                    ／／本地代理端口，即上面所配置的1082
        "password":"123456",                 ／／ 密码
        "timeout":600,
        "method":"aes-256-cfb",               ／／代理协议
        "fast_open":false,
        "workers":1
     }
```

具体参数说明可见[官方文档](https://wiki.archlinux.org/index.php/Shadowsocks_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))

3、启动代理。在终端执行如下命令。（配合nohup和&可以使之后台运行，关闭终端也不影响）

```
nohup sslocal -c /etc/shadowsocks/config.json &
```

4、不创建配置文件，手动执行方式如下。（主要命令比较长，容易出错。如果config.json加载失败，可以尝试一下这种方式。）

```
nohup sslocal -s 服务器地址 -p 服务器端口 -l 本地端端口 -k 密码 -m 加密方法 &
```













