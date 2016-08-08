$(document).ready(function(){
    var browser_anim_end = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
            browser_anim_start = 'webkitAnimationStart mozAnimationStart MSAnimationStart oanimationstart animationstart'
    $('#post-index .hentry,.archives .collection').each(function(i){
        $(this).css({
            'animation-duration':'1s',
            'animation-delay':i*0.4+'s',
            'animation-timing-function':'ease',
        });
    })

    $('.archives .collection').on('webkitAnimationStart',function(){
        $('.archives').css({'border-left-width':'.04rem'});
    })

    /*$('.dl-menuwrapper,.hentry,.tags .entry-meta,.archives .collection').on(browser_anim_end,function(){
        $(this).css('opacity','1');
    })*/

})