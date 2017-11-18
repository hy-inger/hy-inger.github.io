---
title: W3C下的冒泡和捕获机制
tags: [Capture, Bubble, Event]
layout: post
---
一个DOM元素绑定两个事件，一个冒泡，一个捕获，则事件会执行多少次，执行顺序如何。

这导致了我对冒泡和捕获又进一步深入的了解。(永远都在发现自己知识匮乏的日子中度过人生真是好抓急啊。)

首先冒泡和捕获是怎么一回事。

简单点说。冒泡就是从下往上，像鱼吐泡，泡泡是从下往上升的，也就是DOM元素被触法事件时(此时的dom元素为目标元素)，目标元素事件执行后，它的祖先元素所绑定的事件会向上顺序执行。

如下代码，有四个div嵌套元素，均绑定了click事件，addEventListener函数的第三个参数设置为false说明不为捕获事件，即为冒泡事件。该代码执行结果如下：

点击one元素，输出one；
点击two元素，输出two one;
点击three元素，输出 three two one；
点击four元素，输出 four three two one；

```html
    <div id='one'>  
        <span style="white-space:pre"></span>
        <div id='two'>  
            <div id='three'>  
                <div id='four'>  
                </div>  
            </div>  
        </div>  
    </div>  
    <script type='text/javascript'>  
        var one=document.getElementById('one');  
        var two=document.getElementById('two');  
        var three=document.getElementById('three');  
        var four=document.getElementById('four');  
        one.addEventListener('click',function(){  
            alert('one');  
        },false);  
        two.addEventListener('click',function(){  
            alert('two');  
        },false);  
        three.addEventListener('click',function(){  
            alert('three');  
        },false);  
        four.addEventListener('click',function(){  
            alert('four');  
        },false);  
    </script>  
```

而捕获则相反。当触发目标元素时，会从目标元素的最顶层的祖先元素事件往下执行到目标元素为止。
将上面的代码第三个参数均改为true，则执行结果如下：
点击one，输出one；
点击two，输出one two；
点击three，输出one two three；
点击four，输出one two three four；
很明显执行顺序是不同的。
以上便是冒泡和捕获的基本理解。

而在一篇原创翻译中了解到W3C的执行顺序是择中的。即
任何发生在w3c事件模型中的事件，首是进入捕获阶段，直到达到目标元素，再进入冒泡阶段。(原文链接：[http://www.cnblogs.com/hh54188/archive/2012/02/08/2343357.html](http://www.cnblogs.com/hh54188/archive/2012/02/08/2343357.html))
不过就是这篇文中的例子只有两个dom元素。测试时无法充分理解。我自己便增加了两个元素来理解。

首先，无论是冒泡事件还是捕获事件，元素都会先执行捕获阶段
仍然以上面的代码为例子，假设目标元素为four,也就是four被点击，执行结果是一样，那么它的执行过程呢？
其实过程就是，从four元素的最顶层的祖先开始向下判断是否有捕获事件的元素，即第三个参数为true的绑定事件的元素。
从上往下，如有捕获事件，则执行；一直向下到目标元素后，从目标元素开始向上执行冒泡元素，即第三个参数为false的绑定事件的元素。(在向上执行过程中，已经执行过的捕获事件不再执行，只执行冒泡事件。)

如下代码：

```javascript
    one.addEventListener('click',function(){  
        alert('one');  
    },true);  
    two.addEventListener('click',function(){  
        alert('two');  
    },false);  
    three.addEventListener('click',function(){  
        alert('three');  
    },true);  
    four.addEventListener('click',function(){  
        alert('four');  
    },false);
```

此时点击four元素，four元素为目标元素，one为根元素祖先，从one开始向下判断执行。
one为捕获事件，输出one；
two为冒泡事件，忽略；
three为捕获时间，输出three；
four为目标元素，开始向上冒泡执行，输出four；（从此处分为两部分理解较容易。）
three为捕获已执行，忽略;
two为冒泡事件，输出two；
one为捕获已执行，忽略。
最终执行结果为：one three four two

(在这里可能会有疑问，目标元素是什么事件有区别吗？我的测试结果是没有区别的，无论目标元素是捕获还是冒泡，在w3c下都是先从根元素执行捕获到目标元素，再从目标元素向上执行。)
有疑问的话可以在这个例子上将其他三个元素作为目标元素测试。
例如，three作为目标元素，执行结果为：one three two(因为two是冒泡事件，在向下执行时没有执行到。)

最后就是讨论一个DOM元素绑定多个事件的执行过程。
执行次数：绑定了几个事件便执行几次。
如下代码，two元素绑定了两个不同事件，点击two都会执行这两个事件。而执行顺序有所差异

```javascript
    one.addEventListener('click',function(){  
        alert('one');  
    },true);  
    two.addEventListener('click',function(){  
        alert('two,bubble');  
    },false);  
    two.addEventListener('click',function(){  
        alert('two,capture');  
    },true);  
    three.addEventListener('click',function(){  
        alert('three,bubble');  
    },true);  
    four.addEventListener('click',function(){  
        alert('four');  
    },true);  
```

1、如果two为目标元素，目标元素的事情按顺序执行，而其他元素根据W3C的标准执行，即先捕获后冒泡。
点击two执行结果：one(因为是two的父元素支持捕获事件所以先执行)  two,bubble  two,capture(顺序执行，注意逗号不是间隔，是输出内容。)
2、如果目标元素不是two，则two的两个事件按先捕获后冒泡触发执行，也就是跟前面讨论的执行过程是一样的，只不过两个事件都绑定在同一个DOM元素上。
点击three执行结果：one two,capture three,bubble two,bubble

完。




