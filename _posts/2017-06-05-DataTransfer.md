---
title: $watch、$observe、$on在主control和directive之间进行数据通信的使用和区别 
tags: [Angular]
layout: post
---

$watch、$observe用于自动监听模型变化，实时反映到View中；$on是一个接收广播事件方法，用于不同控制器之间的消息传递，实际上也就是不同控制器之间的数据更新传递，$broadcast和$emit用于发送广播事件。
这三个方法都可以用于在control和directive之间对更新的数据进行互相传递。下面它们说一说在这种实际场景中的使用和区别。


## 1、$broadcast/$emit + $on 广播模式
$broadcast （在父scope）发一个向下的事件给作用域中的子节点以及以下的节点，其子节点及以下节点注册的监听器（$on）都会接收到通知。

$emit （在子scope）发一个向上的事件给作用域中的父节点以及以上的节点，该事件会逐渐向上传递，其中某节点注册的监听器（$on）接收到了这个事件。

$on 监听指定类型的事件。
### （1）$broadcast
```js
//html
<div ng-controller="parentCtrl">
    <button ng-click="click()">Click</button>
    <div child></div>
</div>
 
//js
var app = angular.module('app',[]);
app.controller('parentCtrl',function ($scope){
    $scope.parent = 'Ctrl parent';
    $scope.click = function(){
        console.log('---------------parent click------------');
        $scope.parent = 'tochild';
        $scope.$broadcast('tochild',$scope.parent);
 
    }
})
 
.directive('child',function(){
    return {
        restrict: 'AE',
        link:function(scope,ele,attrs){
            scope.$on('tochild',function(event,data){
                console.log(data);
            })
        },
    }
})
```
结果：
![image](https://cloud.githubusercontent.com/assets/10647005/26441974/393ca35c-4165-11e7-81ce-3aab6efe9399.png)

### （2）$emit
```js
// html
<div ng-controller="parentCtrl">
    <div child></div>
</div>
 
// js
var app = angular.module('app',[]);
app.controller('parentCtrl',function ($scope){
    $scope.$on('toparent',function(event, data){
        console.log(data);
    });
})
 
.directive('child',function(){
    return {
        restrict: 'AE',
        template:'<button ng-click="click()">child click</div>',
        link:function(scope,ele,attrs){
            scope.child = 'Directive child';
            scope.click = function(){
                console.log('---------------child click------------');
                scope.child = 'toparent';
                scope.$emit('toparent',scope.child);
            }
        },
    }
})
```
结果：
![image](https://cloud.githubusercontent.com/assets/10647005/26442000/526c9c38-4165-11e7-8d12-fa238b00a88d.png)
## 2、 $watch、$observe
 $watch、$observe都可以自动监听scope的属性变化而不需要手动发送广播通知，区别在于$watch是scope对象上的一个方法，$observe是指令directive中link或compile函数中实例属性（attrs）的一个方法。

directive与父controller进行数据通信主要有两种模式，非隔离作用域和隔离作用域
### （1）非隔离作用域

```js
// html
<div ng-controller="parentCtrl">
    <button ng-click="click()">Click</button>
    <div child attr="parent"></div>
</div>
// js
var app = angular.module('app',[]);
app.controller('parentCtrl',function ($scope){
    $scope.parent = 'Ctrl parent';
    $scope.click = function(){
        console.log('---------------parent click------------')
        $scope.parent = 'tochild';
    }
})
 
.directive('child',function(){
    return {
        restrict: 'AE',
        link:function(scope,ele,attrs){
            attrs.$observe('attr',function(newValue,oldValue){
                console.log("observe:",newValue);
            })
            scope.$watch(attrs.attr,function(newValue, oldValue){
                console.log("watch:",newValue);
            })
        },
        controller:function($scope){
        }
    }
})
```

结果：
a、在`<div child attr="parent"></div>`中，parent没有带插值符号{{}}，数据没有被解析为DOM属性上的值，$observe是用来监控DOM属性上的值，因此监测到的数据一直没有变化，
b、因为父子共享作用域，因此$watch监听的attrs.attr实际上与父scope建立了双向绑定。
![image](https://cloud.githubusercontent.com/assets/10647005/26442038/73045828-4165-11e7-827b-b8b1f57ac957.png)
修改：

```js
// html
<div ng-controller="parentCtrl">
    <button ng-click="click()">Click</button>
    <div child attr="{{parent}}"></div>
</div>
// js
.directive('child',function(){
    return {
        restrict: 'AE',
        link:function(scope,ele,attrs){
            attrs.$observe('attr',function(newValue,oldValue){
                console.log("observe:",newValue);
            })
            scope.$watch('attr',function(newValue, oldValue){
                console.log("watch:",newValue);
            })
        },
        controller:function($scope){
        }
    }
})
```

结果：
a、在`<div child parent="{{parent}}"></div>`中，parent带插值符号{{}}，数据被解析为DOM属性上的值，因此$observe能够监测其变化。b、$watch不支持监听带插值符号的数据。（注意$watch监听的数据格式不同）
![image](https://cloud.githubusercontent.com/assets/10647005/26442056/87dbcea2-4165-11e7-928a-75568c69cf0f.png)

### （2）隔离作用域
隔离作用域中，= 表示通过directive 的 attr属性的值在父子scope之间建立某数据的双向绑定; @ 表示绑定一个局部 scope 属性到当前dom节点的属性值，相当于单向绑定传递。

```js
// html
<div ng-controller="parentCtrl">
    <button ng-click="click()">Click</button>
    <div child attr="parent"></div>
</div>
// js
var app = angular.module('app',[]);
app.controller('parentCtrl',function ($scope){
    $scope.parent = 'Ctrl parent';
    $scope.click = function(){
        console.log('---------------parent click------------')
        $scope.parent = 'tochild';
    }
})
.directive('child',function(){
    return {
        restrict: 'AE',
        scope:{
            attr:'=',
        },
        link:function(scope,ele,attrs){
            scope.$watch('attr',function(newValue, oldValue){
                console.log("watch:",newValue);
            })
            attrs.$observe('attr',function(newValue,oldValue){
                console.log("observe:",newValue);
            })
        },
        controller:function($scope){
        }
    }
})
```

结果：
a、`<div child parent="parent"></div>`同理。parent没有带插值符号，数据没有被解析，$observe监测不到数据变化。
b、$watch监听的是attrs下attr属性的值，该值与父scope建立了双向绑定。
![image](https://cloud.githubusercontent.com/assets/10647005/26442088/a0fa2eba-4165-11e7-8ca3-36eea1fc4824.png)
修改：

```js
<div ng-controller="parentCtrl">
    <button ng-click="click()">Click</button>
    <div child attr="{{parent}}"></div>
</div>
 
 
var app = angular.module('app',[]);
app.controller('parentCtrl',function ($scope){
    $scope.parent = 'Ctrl parent';
    $scope.click = function(){
        console.log('---------------parent click------------')
        $scope.parent = 'tochild';
    }
})
 
.directive('child',function(){
    return {
        restrict: 'AE',
        scope:{
            attr:'@',
        },
        link:function(scope,ele,attrs){
            scope.$watch('attr',function(newValue, oldValue){
                console.log("watch:",newValue);
            })
            attrs.$observe('attr',function(newValue,oldValue){
                console.log("observe:",newValue);
            })
        },
        controller:function($scope){
        }
    }
})
```

结果：
a、`<div child parent="{{parent}} "></div>`同理。parent带插值符号，数据被解析为dom属性的值，$observe能够监测数据变化。
b、$watch监听的是attr属性的值，该值与父scope建立了单向绑定，父scope更新数据，$watch能够监听到数据变化。
![image](https://cloud.githubusercontent.com/assets/10647005/26442107/b56c6aca-4165-11e7-9aef-486795f225a2.png)

**重点总结：
     1、$broadcast/$emit + $on 不受control和directive之间的共享作用域限制。
     2、$broadcast 服务会将事件广播给所有子节点以及以下的节点，一个优化方式是使用$emit, 参见https://github.com/angular/angular.js/issues/4574。
     3、由于angular的dirty-checking，不建议在controller中使用$watch。如果需要父scope需要监听子scope数据更新，使用$emit。
     4、在directive中监听数据时，根据父子作用域共享模式和数据绑定模式选择 $watch 或 $observe。$watch监听数据范围更广。
     5、在directive中，无论在什么情况下，使用$observe监听带插值符号的属性值（attr="{{data}}"）能够得到更正确的数据。
          因为带{{}}的数据都是将scope的属性解析为字符串直接作为dom的属性值；而不带{{}}的数据则可能被绑定为scope属性，也可能被解读为字符串。**
