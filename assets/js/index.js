$(document).ready(function(){
    
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

    $('.dl-menuwrapper,.hentry,.tags .entry-meta,.archives .collection').on('webkitAnimationEnd',function(){
        $(this).css('opacity','1');
    })
    /*$('').on('webkitAnimationEnd',function(){
        $(this).css({
            //'padding-top':'60px',
            'opacity':'1',
        });
    })*/
})