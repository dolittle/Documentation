$(function () {
    const sidebar = $('nav.td-sidebar-nav')[0];

    const canScroll = sidebar.scrollHeight > sidebar.clientHeight;
    if (!canScroll) return;

    const activeSidebarItem = $(sidebar).find('span.td-sidebar-nav-active-item')[0];
    if (!activeSidebarItem) return;

    const distanceFromTop = activeSidebarItem.offsetTop - sidebar.offsetTop;
    const desiredScroll = distanceFromTop - sidebar.clientHeight/2;

    sidebar.scrollTop = desiredScroll;
});
