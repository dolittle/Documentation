// for changing the navbar on cover page on scroll
$(document).ready(function () {
    html = $('html');

    function flipNav() {
        if (window.pageYOffset > 50) {
            html.addClass("flip-nav");
        } else {
            html.removeClass("flip-nav");
        }
    }

    window.addEventListener('resize', flipNav);
    window.addEventListener('scroll', flipNav);
});
