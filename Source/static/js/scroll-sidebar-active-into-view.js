$(function () {
    const activeSidebarItem = $('div.td-sidebar .td-sidebar-nav-active-item')[0];
    if (activeSidebarItem) {
        activeSidebarItem.scrollIntoView({ block: 'center' });
    }
});
