class Sidebar {
    constructor() {
        this.init();
        this.initMobileMenu();
        this.hoverTimeout = null;
        this.currentHoverPanel = null;
        this.initHorizontalMode();
    }

    init() {
        this.initCollapse();
        this.initTreeView();
        this.loadSavedState();
    }

    initCollapse() {
        const $sidebar = $('#sidebar');
        const $mainContent = $('#mainContent');

        $('#collapseBtn').click(() => {
            const isCollapsed = $sidebar.hasClass('collapsed');
            $sidebar.toggleClass('collapsed');
            $mainContent.toggleClass('collapsed');

            // Toggle icon visibility (reversed logic)
            $('#collapseBtn .bi-box-arrow-in-left').toggle(isCollapsed);
            $('#collapseBtn .bi-box-arrow-right').toggle(!isCollapsed);

            // Close all opened submenus when collapsing
            if (!isCollapsed) {  // If we're going to collapse

                $('.tree-view ul').slideUp();
                $('.hover-panel').remove();
            }

            // Store the state
            localStorage.setItem('sidebarState', isCollapsed ? 'expanded' : 'collapsed');
        });
    }

    initTreeView() {
        // Add has-children class to parent items
        $('.tree-view li').each(function () {
            if ($(this).find('> ul').length) {
                $(this).find('> .tree-item').addClass('has-children');
            }
        });

        $('.tree-item').off('click').on('click', (e) => {
            const $currentTarget = $(e.currentTarget);
            const $submenu = $currentTarget.siblings('ul');
            const $parentLi = $currentTarget.closest('li');

            // Handle navigation for items without children
            if (!$currentTarget.hasClass('has-children')) {
                // Handle the link navigation
                if ($currentTarget.attr('href')) {
                    return true; // Allow default link behavior
                }
                return;
            }

            // Prevent default only for items with children
            e.preventDefault();
            e.stopPropagation();

            if ($('#sidebar').hasClass('collapsed')) {
                // In collapsed state
                if ($currentTarget.closest('.hover-panel').length) {
                    $currentTarget.toggleClass('open');

                }
            } else {
                // In expanded state
                $currentTarget.toggleClass('open');
                $parentLi.siblings('li').find('ul').slideUp();
                $parentLi.siblings('li').find('.tree-item').removeClass('open');
                $submenu.stop().slideToggle();
            }
        });

        // Delegate event handling for hover panel items
        $(document).on('click', '.hover-panel .tree-item', function (e) {
            const $currentTarget = $(this);

            // If it's not a parent item, handle navigation
            if (!$currentTarget.hasClass('has-children')) {
                if ($currentTarget.attr('href')) {
                    return true; // Allow default link behavior
                }
                return;
            }

            // Handle submenu toggling
            e.preventDefault();
            e.stopPropagation();

            const $submenu = $currentTarget.siblings('ul');
            const $parentLi = $currentTarget.closest('li');

            $currentTarget.toggleClass('open');
            $parentLi.siblings('li').find('ul').slideUp();
            $parentLi.siblings('li').find('.tree-item').removeClass('open');
            $submenu.stop().slideToggle();
        });

        // Modified hover handler
        $('.tree-view > li').hover(
            (e) => {
                $(e.currentTarget).find('ul').removeAttr('style');
                // $(e.currentTarget).find('li ul').removeAttr('style');
                if ($('#sidebar').hasClass('collapsed')) {
                    clearTimeout(this.hoverTimeout);
                    this.showHoverPanel($(e.currentTarget));
                }
            },
            (e) => {
                if ($('#sidebar').hasClass('collapsed')) {
                    this.scheduleHoverPanelClose(e);
                }
            }
        );

        // Add these new methods
        $(document).on('mouseenter', '.hover-panel', () => {
            clearTimeout(this.hoverTimeout);
        });

        $(document).on('mouseleave', '.hover-panel', (e) => {
            this.scheduleHoverPanelClose(e);
        });
    }

    loadSavedState() {
        const isCollapsed = localStorage.getItem('sidebarState') === 'collapsed';
        if (isCollapsed) {
            $('#sidebar').addClass('collapsed');
            $('#mainContent').addClass('collapsed');
            //$('#mainContent').removeClass('col-md-9').addClass('col-md-11');
            // Set initial icon state for collapsed
            $('#collapseBtn .bi-box-arrow-in-left').hide();
            $('#collapseBtn .bi-box-arrow-right').show();
        } else {
            $('#sidebar').removeClass('collapsed');
            $('#mainContent').removeClass('collapsed');
            //$('#mainContent').removeClass('col-md-11').addClass('col-md-9');
            // Set initial icon state for expanded
            $('#collapseBtn .bi-box-arrow-in-left').show();
            $('#collapseBtn .bi-box-arrow-right').hide();
        }
    }

    initMobileMenu() {
        // Add mobile menu toggle handler
        $('#mobileMenuBtn').click(() => {
            const $sidebar = $('#sidebar');

            // Ensure sidebar is expanded when showing on mobile
            if (!$sidebar.hasClass('mobile-show')) {
                $sidebar.removeClass('collapsed');
                // Reset collapse button icons
                $('#collapseBtn .bi-box-arrow-in-left').show();
                $('#collapseBtn .bi-box-arrow-right').hide();
                // Update localStorage
                localStorage.setItem('sidebarState', 'expanded');
            }

            $sidebar.toggleClass('mobile-show');
            $('body').toggleClass('sidebar-mobile-open');
        });

        // Close sidebar when clicking outside on mobile
        $(document).on('click', (e) => {
            if ($('body').hasClass('sidebar-mobile-open')) {
                const $sidebar = $('#sidebar');
                const $mobileMenuBtn = $('#mobileMenuBtn');

                if (!$sidebar.is(e.target) &&
                    !$mobileMenuBtn.is(e.target) &&
                    $sidebar.has(e.target).length === 0 &&
                    $mobileMenuBtn.has(e.target).length === 0) {

                    $sidebar.removeClass('mobile-show');
                    $('body').removeClass('sidebar-mobile-open');
                }
            }
        });
    }

    showHoverPanel($li) {
        // Remove any existing hover panels
        $('.hover-panel').remove();

        const $submenu = $li.find('ul').first();
        if (!$submenu.length) return;

        const parentTop = $li.offset().top;
        const viewportHeight = $(window).height();
        const parentName = $li.find('> .tree-item .item-name').text();

        const $clonedSubmenu = $submenu.clone(true)
            .addClass('hover-panel')
            .css({
                'position': 'fixed',
                'left': $('#sidebar').width() + 10,
                'top': Math.min(parentTop, viewportHeight - $submenu.height() - 20)
            });

        if (!$clonedSubmenu.find('.hover-panel-header').length) {
            $clonedSubmenu.prepend(`<div class="hover-panel-header">${parentName}</div>`);
        }

        $('body').append($clonedSubmenu);
        this.currentHoverPanel = $clonedSubmenu;
    }

    scheduleHoverPanelClose(e) {
        clearTimeout(this.hoverTimeout);
        this.hoverTimeout = setTimeout(() => {
            const $activeElement = $(document.activeElement);
            const $hoverElement = $(e.relatedTarget);

            if (!$activeElement.closest('.hover-panel').length &&
                !$hoverElement.closest('.hover-panel').length &&
                !$hoverElement.closest('.top-nav-item').length) {
                $('.hover-panel').remove();
                this.currentHoverPanel = null;
            }
        }, 300);
    }

    initHorizontalMode() {
        // Create top nav if it doesn't exist
        if (!$('.top-nav').length) {
            const $topNav = $('<div class="top-nav"></div>');

            // Clone first-level items from sidebar
            $('.tree-view > li > .tree-item').each(function () {
                const $clone = $(this).clone();
                const $wrapper = $('<div class="top-nav-item"></div>').append($clone);
                $topNav.append($wrapper);
            });

            // Insert top nav after header
            //$('.header-bar').after($topNav);
            $('#middle').append($topNav);
        }

        // Update hover events for top nav items
        $('.top-nav-item').off('mouseenter mouseleave').hover(
            (e) => {
                if ($('body').hasClass('horizontal')) {
                    clearTimeout(this.hoverTimeout);
                    // Remove any existing hover panels first
                    $('.hover-panel').remove();

                    const $item = $(e.currentTarget);
                    const $originalItem = $('.tree-view > li').eq($item.index());
                    const $submenu = $originalItem.find('> ul').first();

                    if ($submenu.length) {
                        this.showTopNavPanel($item, $submenu);
                    }
                }
            },
            (e) => {
                if ($('body').hasClass('horizontal')) {
                    const $toElement = $(e.relatedTarget);
                    if (!$toElement.closest('.hover-panel').length) {
                        this.scheduleHoverPanelClose(e);
                    }
                }
            }
        );

        // Improve document click handling to close panels
        $(document).on('click', (e) => {
            const $target = $(e.target);
            if (!$target.closest('.hover-panel').length &&
                !$target.closest('.top-nav-item').length) {
                $('.hover-panel').remove();
                this.currentHoverPanel = null;
            }
        });

        // Add escape key handler to close panels
        $(document).on('keydown', (e) => {
            if (e.key === 'Escape') {
                $('.hover-panel').remove();
                this.currentHoverPanel = null;
            }
        });
    }

    showTopNavPanel($item, $submenu) {
        const $clonedSubmenu = $submenu.clone(true)
            .addClass('hover-panel');

        const parentName = $item.find('.item-name').text();
        if (!$clonedSubmenu.find('.hover-panel-header').length) {
            $clonedSubmenu.prepend(`<div class="hover-panel-header">${parentName}</div>`);
        }

        // Store reference to current panel and remove any existing ones
        if (this.currentHoverPanel) {
            this.currentHoverPanel.remove();
        }
        this.currentHoverPanel = $clonedSubmenu;

        // Add the panel to the item
        $item.append($clonedSubmenu);

        // Update click handler for items with children
        $clonedSubmenu.find('.tree-item').hover(
            (e) => {
                e.preventDefault();
                e.stopPropagation();
                const $hoveredItem = $(e.currentTarget);
                const $parentPanel = $hoveredItem.closest('.hover-panel');

                // Remove any existing child panels at the same level
                $parentPanel.find('.hover-panel').remove();
                $parentPanel.siblings('.hover-panel').remove();
            }
        );

        // Remove click handler and only use hover for child panels
        $clonedSubmenu.find('.tree-item.has-children').hover(
            (e) => {
                e.preventDefault();
                e.stopPropagation();
                const $hoveredItem = $(e.currentTarget);
                const $parentPanel = $hoveredItem.closest('.hover-panel');

                // Remove any existing child panels at the same level
                $parentPanel.find('.hover-panel').remove();
                $parentPanel.siblings('.hover-panel').remove();

                // Only show new child panel if item has children
                const $nextSubmenu = $hoveredItem.siblings('ul');
                if ($nextSubmenu.length) {
                    const $childPanel = $nextSubmenu.clone(true)
                        .addClass('hover-panel child-panel')
                        .addClass('active');

                    // Add header to child panel
                    const childPanelName = $hoveredItem.find('.item-name').text();
                    if (!$childPanel.find('.hover-panel-header').length) {
                        $childPanel.prepend(`<div class="hover-panel-header">${childPanelName}</div>`);
                    }

                    // Position the child panel relative to the hovered item
                    const hoveredItemOffset = $hoveredItem.offset();
                    const hoveredItemHeight = $hoveredItem.outerHeight();
                    const headerHeight = $('.header-bar').outerHeight();
                    const topNavHeight = $('.top-nav').outerHeight();
                    $childPanel.attr('style', `position: fixed; top: ${hoveredItemOffset.top - hoveredItemHeight  -13}px !important; `);

                    // Append the child panel to the hovered item's parent li
                    $hoveredItem.parent('li').append($childPanel);
                }
            },
            // Add mouseleave handler to hide child panel
            (e) => {
                const $hoveredItem = $(e.currentTarget);
                const $parentPanel = $hoveredItem.closest('.hover-panel');

                // Only remove child panels if not hovering over them
                const $relatedTarget = $(e.relatedTarget);
                if (!$relatedTarget.closest('.hover-panel.child-panel').length) {
                    $parentPanel.find('.hover-panel.child-panel').remove();
                }
            }
        );

        // Update hover handling for panels
        $clonedSubmenu
            .on('mouseenter', () => {
                clearTimeout(this.hoverTimeout);
            })
            .on('mouseleave', (e) => {
                const $toElement = $(e.relatedTarget);
                if (!$toElement.closest('.hover-panel').length &&
                    !$toElement.closest('.top-nav-item').length) {
                    // Remove child panels when leaving parent item
                    if ($('body').hasClass('horizontal')) {
                        $('.hover-panel.child-panel').remove();
                    }
                    this.scheduleHoverPanelClose(e);
                }
            });


    }
}

// Initialize sidebar
$(document).ready(() => {
    new Sidebar();
});