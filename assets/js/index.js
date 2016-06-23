$(document).ready(function(){
    /*var index_hentry = $('#post-index .hentry');
    for(var i=0;i<index_hentry.length;i++){
        index_hentry[i]
    }*/
    $('#post-index .hentry').each(function(i){
        $(this).css({
            'animation-duration':'1s',
            'animation-delay':i*0.4+'s',
            'animation-timing-function':'ease',
        });
    })

    $('.hentry').on('webkitAnimationEnd',function(){
        $(this).css('opacity','1');
    })
    $('.dl-menuwrapper').on('webkitAnimationEnd',function(){
        $(this).css({
            'padding-top':'60px',
            'opacity':'1',
        });
    })
})