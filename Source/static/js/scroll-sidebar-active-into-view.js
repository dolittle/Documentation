$(function () {
    const activeSidebarItem = $('div#td-sidebar-menu .td-sidebar-nav-active-item')[0];
    if (activeSidebarItem) {
        activeSidebarItem.scrollIntoView({ block: 'center' });
    }
});
