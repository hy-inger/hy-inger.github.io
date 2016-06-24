window.onload = function(){
    // document.mozHidden !== undefined
    var now = 1,next = 1,action = false;
    var section = document.querySelectorAll('.item'),
            num = section.length;
    var animation = function(next,prev,next_action,prev_action){
        var next_item = document.querySelector('.item'+next),
                prev_item = document.querySelector('.item'+prev),
                next_nav = document.querySelector('.step'+next),
                prev_nav = document.querySelector('.step'+prev);
                
                module.addClass(next_item,next_action);
                module.addClass(prev_item,prev_action);
        var anim_end = function(e){
            module.removeClass(prev_item,'active');
            module.removeClass(prev_item,prev_action);

            module.removeClass(next_item,next_action);
            module.addClass(next_item,'active');  

            module.addClass(next_nav,'active');
            module.removeClass(prev_nav,'active');

            action = false;
            module.removeEvent(next_item,'webkitAnimationEnd',anim_end);  
        }
        
        module.addEvent(next_item,'webkitAnimationEnd',anim_end);
             
    }
    /* 鼠标滚轮事件切换页面 */
    module.addEvent(document,'mousewheel,DOMMouseScroll',function(e){
        if(action){
            return;
        }
        action = true;
        e.delta = (e.wheelDelta) ? e.wheelDelta / 120 : -(e.detail || 0) / 3;
        if(e.delta<0){              // 滚轮向下,当前页面缩小向下隐藏,
            next = now+1;
            if(next>num){
                action = false;
                return;
            }
            prev = now;
            now = next;
            animation(next,prev,'next-slide-up','prev-scale-down');
        } else {                        // 滚轮向上,当前页面大小不变向下隐藏,
            if(now==1){
                action = false;
                return;
            }
            next = now-1;
            prev = now;
            now = next;
            animation(next,prev,'next-scale-up','prev-slide-down');
        }
    })
    /* 点击导航切换页面,事件委托 */
    var ul = document.getElementById('nav');
    module.addEvent(ul,'click',function(e){
        if(action){
            setTimeout(function(){
                action = false;
            },300000);
            return;
        }
        action = true;
        var target = e.target?e.target:e.srcElement;
        if(module.hasClass(target,'step')){
            e.stopPropagation();
            next = target.getAttribute('data');
            prev = now;
            if(now == next){
                action = false;
                return;
            }
            if(now < next){
                animation(next,prev,'next-slide-up','prev-scale-down');
            } else {
                animation(next,prev,'next-scale-up','prev-slide-down');
            }
            now = next;
        }
    },true);
}