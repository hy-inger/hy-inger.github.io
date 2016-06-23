window.onload = function(){
    // document.mozHidden !== undefined
    var now = 1,next = 1;
    var section = document.querySelectorAll('.item'),
            num = section.length;
    var animation = function(next,prev,next_action,prev_action){
        var next_item = document.querySelector('.item'+next),
                prev_item = document.querySelector('.item'+prev);
                
                module.addClass(next_item,next_action);
                module.addClass(prev_item,prev_action);
        var anim_end = function(e){
            module.removeClass(prev_item,'active');
            module.removeClass(prev_item,prev_action);

            module.removeClass(next_item,next_action);
            module.addClass(next_item,'active');   
        }
        function test (e){
            console.log(next);
        }
        module.removeEvent(next_item,'webkitAnimationEnd',anim_end);  
        module.removeEvent(next_item,'click',test);
        module.addEvent(next_item,'click',test);
        module.addEvent(next_item,'webkitAnimationEnd',anim_end);
             
    }
    /*var animation_end = function(){
        module.removeClass(prev_item,'active');
        module.removeClass(prev_item,prev_action);

        module.removeClass(next_item,next_action);
        module.addClass(next_item,'active');
    }*/
    module.addEvent(document,'mousewheel,DOMMouseScroll',function(e){
        e.delta = (e.wheelDelta) ? e.wheelDelta / 120 : -(e.detail || 0) / 3;
        if(e.delta<0){
            next = now+1;
            if(next>num){
                return;
            }
            prev = now;
            now = next;
            animation(next,prev,'next-slide-up','prev-scale-down');
        } else {
            if(now==1){
                return;
            }
            next = now-1;
            prev = now;
            now = next;
            animation(next,prev,'next-scale-up','prev-slide-down');
        }
        
    })
}