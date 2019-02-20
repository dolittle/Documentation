(function ($) {
//left menu expand/collapse
$('.list-styled .expand').on('click', function () {
    $parent = $(this).parent();
    console.log($parent);
    $parent.toggleClass('active');
});

})(jQuery);