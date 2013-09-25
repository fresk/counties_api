var shown_list = $('.scroll-visible')
var hidden_list = $(".scroll-hidden");


var cycle_fading_list = function(){
    shown_list.children().fadeOut(1000, function(){
        shown_list.children().appendTo(hidden_list);
        //show the first child in from the hidden list
        var show_item = hidden_list.children().first()
        show_item.appendTo(shown_list);
        show_item.hide();
        show_item.fadeIn(1000);
        setTimeout(cycle_fading_list, 1700);
    });
};

cycle_fading_list();
