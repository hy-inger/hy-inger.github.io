var module = (function(mod){
    /* addEventListener */
    var eventCompat = function(event) {
        var type = event.type;
        if (type == 'DOMMouseScroll' || type == 'mousewheel') {
            event.delta = (event.wheelDelta) ? event.wheelDelta / 120 : -(event.detail || 0) / 3;
        }
        if (event.srcElement && !event.target) {
            event.target = event.srcElement;    
        }
        if (!event.preventDefault && event.returnValue !== undefined) {
            event.preventDefault = function() {
                event.returnValue = false;
            };
        }
        return event;
    };
    var Listener = function(listener){
        var handler = function(event){
           listener.call(this,eventCompat(event)); 
        }
        return handler;
    }
    mod.addEvent = function(ele,event,listener,bubble){
        var event_list = event.split(',');          //多个操作绑定同一事件回调
        if (typeof ele.addEventListener != "undefined") {
            /*
            */
            for(var i=0;i<event_list.length;i++){
                var e = event_list[i];
                ele.addEventListener(e,listener,bubble?bubble:false);
            }
        } else {
            for(var i=0;i<event_list.length;i++){
                var e = event_list[i];  
                ele.attachEvent('on'+e,listener);
            }
        } 
    };
    /* removeEventListener */
    mod.removeEvent = function(ele,event,listener,bubble){
        var event_list = event.split(',');          //多个操作绑定同一事件回调
        if (typeof ele.removeEventListener != "undefined") {
            for(var i=0;i<event_list.length;i++){
                var e = event_list[i];
                ele.removeEventListener(e,listener,bubble?bubble:false);
            }
        } else {
            for(var i=0;i<event_list.length;i++){
                var e = event_list[i];  
                ele.detachEvent('on'+e,listener);
            }
        } 
    };
    /* hasClass */
    mod.hasClass = function(ele,class_name){
        if(ele.classList){
            return ele.classList.contains(class_name);
        } else {
            var reg = new RegExp('(^| )' + class_name + '( |$)', 'gi');
            return reg.test(ele.className);
        }
    }
    mod.addClass = function(ele,class_name){
        if(!this.hasClass(ele,class_name)){
            if(ele.classList){
                ele.classList.add(class_name);
            } else {
                ele.className +=class_name;
            }
        }
    }
    /* removeClass */
    mod.removeClass = function(ele,class_name){
        if(!ele){
            return;
        }
        if(ele.classList){
            ele.classList.remove(class_name);
        } else {
           ele.className =  ele.className.replace(new RegExp('(^|\\b)' + class_name.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    }
    /* siblings */
    mod.siblings = function(ele,sibling){
        var siblings = Array.prototype.slice.call(ele.parentNode.children);
        var result=[];
        for (var i = siblings.length; i--;) {
          if (siblings[i] === ele) {
            siblings.splice(i, 1);
            break;
          }
        }
        var name = (/^(\.|\#)(.+)/).exec(sibling)[2];       // 匹配id或class
        for (var i = siblings.length; i--;) {
          if (module.hasClass(siblings[i],name)||siblings[i].id == name) {
            result = siblings.splice(i, 1);
            break;
          }
        }
        if(result.length){
            return result;
        } else {
            return null;
        }
    };
    /*get offset,逐步向上一层元素递归计算偏移值,直至body元素*/
    mod.getOffset = function(ele,offset){
        if(!offset){
            offset = {};
            offset.top = 0;
            offset.left = 0;
        }
        if(ele!=null){
            offset.top += ele.offsetTop;
            offset.left += ele.offsetLeft;
        } else {
            return offset;
        }
        return this.getOffset(ele.offsetParent,offset);
    };
    /* 获取键盘符数值 */
    mod.getKeycode =  function(event){
        var keycode = -1;
        if(window.event){
            keycode = event.keyCode;
        } else {
           keycode = event.which;
        }
        return keycode;
    };
    /* 获取屏幕宽高 */
    mod.getWindow = function(){
       return {
            width:window.innerHeight,
       }
    }
    /* 阻止form验证默认气泡,html5 */
    mod.preventTips = function(form){
        this.addEvent(form,'invalid',function(event){
            event.preventDefault();        // 阻止默认动作,即输入框数据无效时字自动弹出的气泡.
        },true);
    }
     /* 表单序列化 */
    mod.serialize = function(form) {
        var parts = [],
            field = null,
            i,
            len,
            j,
            optLen,
            option,
            optValue;

        for (var i = 0, len = form.elements.length; i < len; i++) {
            field = form.elements[i];

            switch (field.type) {
                case "select-one":
                case "select-multiple":

                if (field.name.length) {
                    for (var j = 0, optLen = field.options.length; j < optLen; j++) {
                        option = field.options[j];
                        if (option.selected) {
                            optValue = "";
                            if (option.hasAttributes) {
                                optValue = ((option.hasAttributes("value")) ? option.value : option.text);
                            } else {
                                optValue = (option.attributes("value").specified ? option.value : option.text);
                            }
                            parts.push(encodeURIComponent(field.name) + "=" + encodeURIComponent(optValue));
                        }
                    }
                }
                break;

                case undefined:
                case "file":
                case "submit":
                case "reset":
                case "button":
                    break;

                case "radio":
                case "checkbox":
                    if (!field.checked) {
                        break;
                    }
                //这里没有break
                default:
                    if (field.name.length) {
                        parts.push(encodeURIComponent(field.name) + "=" + encodeURIComponent(field.value));
                    }
            }
        };
        return parts.join("&");
    }
    return mod;
})(module || {})

/* get,post*/
var module = (function(mod){
    function createxmlHttpRequest(){
        if(window.ActiveXObject){
            xhr = new ActiveXObject('Microsoft.XMLHTTP');
        } else if(window.XMLHttpRequest){
            xhr = new XMLHttpRequest();
        }
    }
    mod.doGet = function(url){
        createxmlHttpRequest();
        xhr.open('GET',url,true);
        //xhr.setRequestHeader('Content-Type','application/octet-stream');
        xhr.send(null);
        xhr.onload = function(){
            var data = xhr.response;        //服务端返回的数据
            console.log(data);
        }
    };
    mod.doPost = function(url,data,callback){
        createxmlHttpRequest();
        xhr.open('POST',url,true);
        xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');   //以表格数据发送
        xhr.send(data);
        xhr.onreadystatechange = function(){
            if(xhr.readyState == 4 && xhr.status == 200){
                callback(JSON.parse(xhr.response));
            } else {
            }
        }
    };
    return mod;
})(module||{})

/* Slider */
var module = (function(mod){
    var Slider = (function() {
        // 定义Slider对象
        var Slider = {};
        // I.定义一个TimerManager类

        // 1）构造函数
        function TimerManager() {
            this.timers = [];       // 保存定时器
            this.args = [];         // 保存定时器的参数
            this.isFiring = false;
        }

        // 2）静态方法：为element添加一个TimerManager实例
        TimerManager.makeInstance = function(element) {
            // 如果element.__TimerManager__上没有TimerManager，就为其添加一个
            if (!element.__TimerManager__ || element.__TimerManager__.constructor != TimerManager) {
                element.__TimerManager__ = new TimerManager();
            }
        };

        // 3）扩展TimerManager原型，分别实现add，fire，next方法
        TimerManager.prototype.add = function(timer, args) {
            this.timers.push(timer);
            this.args.push(args);
            this.fire();
        };

        TimerManager.prototype.fire = function() {
            if ( !this.isFiring ) {
                var timer = this.timers.shift(),        // 取出定时器
                    args  = this.args.shift();          // 取出定时器参数
                if (timer && args) {
                    this.isFiring = true;
                    // 传入参数，执行定时器函数
                    timer(args[0], args[1],args[2]);
                }
            }
        };

        TimerManager.prototype.next = function() {
            this.isFiring = false;
            this.fire();
        };

        // II. 修改动画函数并在定时器结束后调用element.__TimerManager__.next()

        // 1）下滑函数
        function fnSlideDown(element, time,callback) {
            if (element.offsetHeight == 0) {  //如果当前高度为0，则执行下拉动画
                // 获取元素总高度
                element.style.display = "block";            // 1.显示元素，元素变为可见
                var totalHeight = element.offsetHeight;     // 2.保存总高度
                element.style.height = "0px";               // 3.再将元素高度设置为0，元素又变为不可见
                // 定义一个变量保存元素当前高度
                var currentHeight = 0;                      // 当前元素高度为0
                // 计算每次增加的值
                var increment = totalHeight / (time/10);
                // 开始循环定时器
                function setHeight(currentHeight){
                    var timer = setTimeout(function(){
                        // 增加一部分高度
                        currentHeight = currentHeight + increment;
                        // 把当前高度赋值给height属性
                        element.style.height = currentHeight + "px";
                        // 如果当前高度大于或等于总高度则关闭定时器
                        if (currentHeight >= totalHeight) {
                            // 关闭定时器
                            clearInterval(timer);
                            // 把高度设置为总高度
                            element.style.height = totalHeight + "px";
                            //执行回调函数
                            if(callback){
                                callback();
                            }
                            if (element.__TimerManager__ && element.__TimerManager__.constructor == TimerManager) {
                                element.__TimerManager__.next();
                            }
                        } else {
                            clearInterval(timer);
                            setHeight(currentHeight);
                        }
                    },10)
                }
                setHeight(currentHeight);
            } else {  // 如果当前高度不为0，则直接执行队列里的下一个函数
                if (element.__TimerManager__ && element.__TimerManager__.constructor == TimerManager) {
                    element.__TimerManager__.next();
                }
            }
        }

        // 2）上拉函数
        function fnSlideUp(element, time,callback) {
            if (element.offsetHeight > 0) {  // 如果当前高度不为0，则执行上滑动画
                // 获取元素总高度
                var totalHeight = element.offsetHeight;
                // 定义一个变量保存元素当前高度
                var currentHeight = totalHeight;
                // 计算每次减去的值
                var decrement = totalHeight / (time/10);
                // 开始循环定时器
                function setHeight(currentHeight){
                    var timer = setTimeout(function(){
                        // 减去当前高度的一部分
                        currentHeight = currentHeight - decrement;
                        // 把当前高度赋值给height属性
                        element.style.height = currentHeight + "px";
                        // 如果当前高度小于等于0，就关闭定时器
                        if (currentHeight <= 0) {
                            // 关闭定时器
                            clearInterval(timer);
                            // 把元素display设置为none
                            element.style.display = "none";
                            // 把元素高度值还原
                            element.style.height = totalHeight + "px";
                            //执行回调函数
                            if(callback){
                                callback();
                            }
                            if (element.__TimerManager__ && element.__TimerManager__.constructor == TimerManager) {
                                element.__TimerManager__.next();
                            }
                        } else {
                            clearInterval(timer);
                            setHeight(currentHeight);
                        }
                    },10);
                }
                setHeight(currentHeight);
            } else {  // 如果当前高度为0， 则直接执行队列里的下一个函数
                if (element.__TimerManager__ && element.__TimerManager__.constructor == TimerManager) {
                    element.__TimerManager__.next();
                }
            }
        }

        // III.定义外部访问接口

        // 1）下拉接口
        Slider.slideDown = function(element, time,callback) {
            TimerManager.makeInstance(element);
            element.__TimerManager__.add(fnSlideDown, arguments);
            return this;
        };

        // 2）上滑接口
        Slider.slideUp = function(element, time,callback) {
            TimerManager.makeInstance(element);
            element.__TimerManager__.add(fnSlideUp, arguments);
            return this;
        };

        // 返回Slider对象
        return Slider;
    })();
    mod.slideDown = function(element, time,callback){
        Slider.slideDown(element,time,callback);
    };
    mod.slideUp = function(element,time,callback){
        Slider.slideUp(element,time,callback);
    }
    return mod;
})(module || {})

/* select */
var module = (function(mod){
    var next = 0,           // 方向键选择下一个元素的坐标
            prev = -1,        // 方向键选择上一个元素的坐标
            now = -1,       // 下拉框当前元素的坐标
            self = {},          
            list_filter = [];   // 输入框过滤的数据列表
    function selectManager(params){
        this.init(params);
        this.handleEvents();
    };
    selectManager.prototype = {
        init : function(params){
            this.dropdown = document.getElementById(params.dropdown?params.dropdown:null),
            this.list_div = document.getElementById(params.list),
            this.list_ul = this.list_div.querySelector('.ul'),
            this.items= this.list_ul.querySelectorAll('.li'),
            this.show_input = document.getElementById(params.show_input),
            this.real_input = document.getElementById(params.real_input);
            self = this;

            var input_height = this.show_input.offsetHeight,
                    input_width = this.show_input.offsetWidth;
            this.list_div.style.top = input_height+'px';
            this.list_div.style.width = input_width + 'px';
            if(dropdown){
                dropdown.style.width = dropdown.style.height = input_height + 'px';
            }
        },

        handleEvents : function(){
            // 下拉按钮点击事件
            if(this.dropdown){
                module.addEvent(this.dropdown,'click',this.showList);
            }
            // 输入框获得焦点和点击事件
            module.addEvent(this.show_input,'focus',this.openSelect);

            // 输入框失去焦点事件
            module.addEvent(this.show_input,'blur',function(){
                // input的blur事件和下拉列表的click事件冲突，将下拉列表延后折叠收起，click事件才能够正常执行。
                setTimeout(function(){              
                    self.closeSelect();
                },200);
            });

            // 使用事件委托选择数据，将数据填入输入框，收起列表。
            module.addEvent(this.list_ul,'click',this.delegateSelect,true);

            // mouseover事件
            module.addEvent(this.list_ul,'mouseover',function(e){
                if(module.hasClass(e.target,'li')){
                    var active_li = self.list_div.querySelector('.active');
                    module.removeClass(active_li,'active');
                }
            });

            // 使用方向键选择数据
            module.addEvent(this.show_input,'keydown',this.arrowSelect);

            // 输入框搜索过滤功能
            module.addEvent(this.show_input,'keyup',this.inputFilter);
        },

        getEleIndex : function(list,class_name){        // 获取元素下标
            var index = -1;
            for(var i=0;i<list.length;i++){
                if(module.hasClass(list[i],class_name)){
                    index = i;
                    break;
                }
            }
            return index;
        },

        openSelect : function(){                            // 展开下拉框
            self.real_input.value = self.show_input.value = '';
            for(var i=0;i<self.items.length;i++){
                module.removeClass(self.items[i],'hide');
            }
            list_filter = self.items;

            module.slideDown(self.list_div,'200',function(){
                module.addClass(self.list_div,'show');
                // 标记已选中的数据，并将滚动条定位到该数据位置
                var selected_index = self.getEleIndex(self.items,'selected');
                var offset_top = self.items[0].offsetHeight*(selected_index-1),
                        scroll_height = self.list_div.scrollHeight;
                self.list_ul.scrollTop = offset_top;
            });
        },
        closeSelect : function(){                           // 关闭下拉框
            var selected_index = this.getEleIndex(this.items,'selected');
            if(selected_index>=0){
                // 如果没有重新选择数据，将标记原先选中的数据，并记录该数据的位置
                var select_value = this.items[selected_index].textContent;
                this.real_input.value =this.show_input.value = select_value;
                next = selected_index+1;
                prev = selected_index-1;
                now = selected_index;
            }
                    
            module.slideUp(self.list_div,'200',function(){
                module.removeClass(self.list_div,'show');
                module.removeClass(self.list_ul.querySelector('.active'),'active');
            });
        },
        showList: function(event){                  // 
            if(!module.hasClass(self.list_div,'show')){
                self.openSelect();
            } else {
                self.closeSelect();
            }
        },
        delegateSelect : function(e){               // 选中数据的事件委托
            if(module.hasClass(e.target,'li')){
                e.stopPropagation();
                self.selectItem(e.target ? e.target: e.srcElement);
            }
        },
        selectItem:function(target){                // 选中数据后的操作，对数据进行标记并关闭下拉框
            //var notice = this.show_input.parentNode.querySelector('.notice');
            var selected =  module.siblings(target,'.selected');
            if(selected){
                module.removeClass(selected[0],'selected');
            }
            module.addClass(target,'selected');
            module.addClass(target,'active');
            //Slider.slideUp(notice,'100');

            this.closeSelect();
        },
        arrowSelect : function(e){                      // 使用键盘方向键选择数据事件
            var target = e.target;
            e.stopPropagation();
            var keycode = module.getKeycode(e);
            switch(keycode){
                case 40:                                        // 向下
                    if(!module.hasClass(self.list_div,'show')){
                        self.openSelect();
                    }
                    if(now >=0 && next!=list_filter.length){
                        module.removeClass(list_filter[now],'active');
                        prev = now;
                    }
                    if(next<list_filter.length){
                        var next_item = list_filter[next];
                        module.addClass(list_filter[next],'active');
                        now = next;
                        next += 1;
                        // 滚动条自动向上滚动
                        self.scrollUp(next_item);
                    }
                    break;
                case 38:                                        // 向上
                    if(now >0){ 
                        module.removeClass(list_filter[now],'active');
                        next = now;
                    }
                    if(prev >=0){
                        var prev_item = list_filter[prev];
                        module.addClass(list_filter[prev],'active');
                        now = prev;
                        prev -=1;
                        // 滚动条自动向下滚动
                        self.scrollDown(prev_item);
                    }
                    break;
                case 13:                                      // 回车选中数据
                    e.preventDefault();
                    self.selectItem(list_filter[now]);
                    self.show_input.blur();
                    break;
            }
        },
        scrollUp : function(next_item){       // 滚动条自动向上滚动
            var next_height = next_item.offsetHeight,
                    offset_top = next_item.offsetTop,
                    scroll_height = this.list_div.scrollHeight,
                    scroll_top = this.list_ul.scrollTop;
            if(offset_top+scroll_top >= scroll_height){
                this.list_ul.scrollTop += next_height;
            }
        },
        scrollDown : function(prev_item){       // 滚动条自动向下滚动
            var prev_height = prev_item.offsetHeight,
                    offset_top = prev_item.offsetTop,
                    scroll_height = this.list_div.scrollHeight,
                    scroll_top = this.list_ul.scrollTop;
            if(scroll_top >= offset_top){
                this.list_ul.scrollTop -= prev_height;
            }
        },
        inputFilter : function(e){
            var keycode = module.getKeycode(e);
            if(module.hasClass(self.list_div,'show')&&keycode!=13&&keycode!=37&&keycode!=38&&keycode!=39&&keycode!=40){
                var value = e.target.value,
                        reg = new RegExp(value,'i');
                // 搜索时数据更新，滚动条和方向标记位重置
                list_filter = [];
                self.list_ul.scrollTop = 0;
                next = 0,prev = -1,now = -1;
                // 对数据进行匹配
                for(var i=0;i<self.items.length;i++){
                    var coun = self.items[i].textContent || self.items[i].innerText;
                    if(!reg.test(coun)){
                        module.addClass(self.items[i],'hide');
                    } else {
                        list_filter.push(self.items[i]);
                        module.removeClass(self.items[i],'hide');
                    }
                }
            }
        }
    }
    mod.select = function(params){
        var action = new selectManager(params);
    }
    return mod;
})(module || {})

        
   
    