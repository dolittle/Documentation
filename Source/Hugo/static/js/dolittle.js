(function($) {
    function addAnchorTags() {
        anchors.options = {
            visible: 'touch'
        };

        anchors.add('.doc_content h1, .doc_content h2, .doc_content h3, .doc_content h4, .doc_content h5, .doc_content h6');
    }

    addAnchorTags();

    //left menu expand/collapse
    $('.list-styled .expand, .list-styled .expand + span').on('click', function() {
        $parent = $(this).parent();
        console.log($parent);
        $parent.toggleClass('active');
    });
})(jQuery);
