class Header {
    constructor() {
        this.init();
        this.applyStoredLayoutMode();
        this.initSearchModal();
    }

    init() {
        this.initThemeToggle();
        this.initNotificationPanel();
        this.initSocialPanel();
        this.initUserPanel();
        this.initSearchPanel();
        this.initSlimMode();
    }

    initThemeToggle() {
        // Check system preference first, then stored preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const storedTheme = localStorage.getItem('theme');
        const html = document.documentElement;

        if (storedTheme) {
            html.setAttribute('data-bs-theme', storedTheme);
        } else if (prefersDark) {
            html.setAttribute('data-bs-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            html.setAttribute('data-bs-theme', 'light');
            localStorage.setItem('theme', 'light');
        }

        // Handle theme toggle click
        $('#themeToggle').click(() => {
            const currentTheme = html.getAttribute('data-bs-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-bs-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (!localStorage.getItem('theme')) {  // Only auto-switch if user hasn't set a preference
                const newTheme = e.matches ? 'dark' : 'light';
                html.setAttribute('data-bs-theme', newTheme);
            }
        });
    }

    initNotificationPanel() {
        const $notificationContainer = $('.notification-container');
        const $notificationToggle = $('#notificationToggle');
        const $markAllRead = $('#markAllRead');

        // Toggle panel
        $notificationToggle.click((e) => {
            e.stopPropagation();
            // Close other panels first
            $('.social-container, .user-container, .search-container').removeClass('active');
            $notificationContainer.toggleClass('active');
        });

        // Close panel when clicking outside
        $(document).click((e) => {
            if (!$(e.target).closest('.notification-container').length) {
                $notificationContainer.removeClass('active');
            }
        });

        // Prevent panel from closing when clicking inside
        $('.notification-panel').click((e) => {
            e.stopPropagation();
        });

        // Handle mark all as read
        $markAllRead.click((e) => {
            e.preventDefault();
            $('.notification-item.unread').removeClass('unread');
            $('.notification-badge').text('0').hide();
        });

        // Handle notification item clicks
        $('.notification-item').click(function (e) {
            e.preventDefault();
            $(this).removeClass('unread');

            // Update badge count
            const unreadCount = $('.notification-item.unread').length;
            const $badge = $('.notification-badge');

            if (unreadCount > 0) {
                $badge.text(unreadCount);
            } else {
                $badge.text('0').hide();
            }

            // Handle notification click (add your logic here)
            console.log('Notification clicked:', $(this).find('.notification-text').text());
        });
    }

    initSocialPanel() {
        const $socialContainer = $('.social-container');
        const $socialToggle = $('#socialToggle');

        // Toggle panel
        $socialToggle.click((e) => {
            e.stopPropagation();
            // Close other panels first
            $('.notification-container, .user-container, .search-container').removeClass('active');
            $socialContainer.toggleClass('active');
        });

        // Close panel when clicking outside
        $(document).click((e) => {
            if (!$(e.target).closest('.social-container').length) {
                $socialContainer.removeClass('active');
            }
        });

        // Prevent panel from closing when clicking inside
        $('.social-panel').click((e) => {
            e.stopPropagation();
        });

        // Handle social item clicks
        $('.social-item a').click((e) => {
            e.preventDefault();
            // Add your social item click handling here
            console.log('Clicked:', $(e.currentTarget).attr('title'));
        });
    }

    initUserPanel() {
        const $userContainer = $('.user-container');
        const $userToggle = $('#userToggle');

        // Toggle panel
        $userToggle.click((e) => {
            e.stopPropagation();
            // Close other panels first
            $('.notification-container, .social-container, .search-container').removeClass('active');
            $userContainer.toggleClass('active');
        });

        // Close panel when clicking outside
        $(document).click((e) => {
            if (!$(e.target).closest('.user-container').length) {
                $userContainer.removeClass('active');
            }
        });

        // Prevent panel from closing when clicking inside
        $('.user-panel').click((e) => {
            e.stopPropagation();
        });

        // Handle user link clicks
        $('.user-link').click((e) => {
            e.preventDefault();
            const action = $(e.currentTarget).find('span').text();
            console.log('User action:', action);
        });
    }

    initSearchPanel() {
        const $searchContainer = $('.search-container');
        const $searchInput = $('.search-input');

        // Toggle panel on input focus
        $searchInput.on('focus', () => {
            // Close other panels first
            $('.notification-container, .social-container, .user-container').removeClass('active');
            $searchContainer.addClass('active');
        });

        // Close panel when clicking outside
        $(document).click((e) => {
            if (!$(e.target).closest('.search-container').length) {
                $searchContainer.removeClass('active');
            }
        });

        // Prevent panel from closing when clicking inside
        $('.search-panel').click((e) => {
            e.stopPropagation();
        });

        // Handle remove button clicks
        $('.search-item-remove').click((e) => {
            e.preventDefault();
            e.stopPropagation();
            $(e.currentTarget).closest('.search-item').fadeOut(200, function () {
                $(this).remove();
            });
        });
    }

    initSlimMode() {
        // Check stored preference
        const isSlim = localStorage.getItem('headerMode') === 'slim';
        if (isSlim) {
            $('.header-bar').addClass('slim');
            $('.sidebar').addClass('slim');
            $('#mainContent').addClass('slim');
            const $topNav = $('.top-nav');
            if($topNav) $topNav.addClass('slim');
            $('#slimModeSwitch').prop('checked', true);
        } else {
            $('.header-bar').removeClass('slim');
            // $('.sidebar').removeClass('slim');
            $('#mainContent').removeClass('slim');
            const $topNav = $('.top-nav');
            if($topNav) $topNav.removeClass('slim');
            $('#slimModeSwitch').prop('checked', false);
        }

        // Initialize right sidebar
        this.initRightSidebar();
    }

    initRightSidebar() {
        const $rightSidebar = $('.right-sidebar');
        const $rightSidebarToggle = $('#rightSidebarToggle');
        const $rightSidebarClose = $('#rightSidebarClose');

        // Toggle right sidebar
        $rightSidebarToggle.click(() => {
            $rightSidebar.toggleClass('show');
        });

        // Close button handler
        $rightSidebarClose.click(() => {
            $rightSidebar.removeClass('show');
        });

        // Close when clicking outside
        $(document).click((e) => {
            if (!$(e.target).closest('.right-sidebar').length &&
                !$(e.target).closest('#rightSidebarToggle').length) {
                $rightSidebar.removeClass('show');
            }
        });

        // Handle slim mode switch
        $('#slimModeSwitch').change((e) => {
            const isSlim = $(e.target).is(':checked');
            $('.header-bar').toggleClass('slim', isSlim);
            $('.sidebar').toggleClass('slim', isSlim);
            $('#mainContent').toggleClass('slim', isSlim);
            const $topNav = $('.top-nav');
            if($topNav) $topNav.toggleClass('slim', isSlim);
            localStorage.setItem('headerMode', isSlim ? 'slim' : 'regular');
        });

        // Handle dark mode switch
        $('#darkModeSwitch').change((e) => {
            const isDark = $(e.target).is(':checked');
            const newTheme = isDark ? 'dark' : 'light';
            document.documentElement.setAttribute('data-bs-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });

        // Set initial dark mode switch state
        const isDarkMode = document.documentElement.getAttribute('data-bs-theme') === 'dark';
        $('#darkModeSwitch').prop('checked', isDarkMode);
    }

    toggleSlimMode() {
        const $header = $('.header-bar');
        const isSlim = $header.hasClass('slim');
        const $topNav = $('.top-nav');
        if (isSlim) {
            $header.removeClass('slim');
            $('.sidebar').removeClass('slim');
            $('#mainContent').removeClass('slim');
            if($topNav) $topNav.removeClass('slim');
            localStorage.setItem('headerMode', 'regular');
        } else {
            $header.addClass('slim');
            $('.sidebar').addClass('slim');
            $('#mainContent').addClass('slim');
            if($topNav) $topNav.addClass('slim');
            localStorage.setItem('headerMode', 'slim');
        }
    }

    applyStoredLayoutMode() {
        const mode = localStorage.getItem('layoutMode') || 'default';
        applyLayoutMode(mode);
    }

    initSearchModal() {
        // Create and append modal HTML
        const modalHTML = `
            <div class="search-modal">
                <div class="search-modal-content">
                    <div class="pl-3 position-relative d-flex align-items-center search-input-container">
                        <i class="bi bi-search search-icon"></i>
                        <input type="search" class="form-control search-input" placeholder="Search...">
                        <i class="bi bi-x-lg close-icon"></i>
                    </div>
                    <div class="search-panel">
                        <div class="search-section">
                            <div class="search-section-title">Recent Searches</div>
                            <a href="#" class="search-item">
                                <i class="bi bi-clock-history"></i>
                                <span class="search-item-text">Dashboard overview</span>
                                <i class="bi bi-x search-item-remove"></i>
                            </a>
                            <a href="#" class="search-item">
                                <i class="bi bi-clock-history"></i>
                                <span class="search-item-text">User settings</span>
                                <i class="bi bi-x search-item-remove"></i>
                            </a>
                        </div>
                        <div class="search-section">
                            <div class="search-section-title">Suggested</div>
                            <a href="#" class="search-item">
                                <i class="bi bi-star"></i>
                                <span class="search-item-text">Profile settings</span>
                            </a>
                            <a href="#" class="search-item">
                                <i class="bi bi-star"></i>
                                <span class="search-item-text">Notification preferences</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>`;

        $('body').append(modalHTML);

        // Add search icon to header
        const searchIconHTML = `
            <button class="btn search-icon-toggle me-2">
                <i class="bi bi-search header-icon"></i>
            </button>`;

        // Insert search icon before theme toggle
        $('.theme-toggle').before(searchIconHTML);

        // Handle search icon click
        $('.search-icon-toggle').click(() => {
            $('.search-modal').addClass('show');
            $('.search-modal .search-input').focus();
        });

        // Handle close icon click
        $('.search-modal .close-icon').click(() => {
            $('.search-modal').removeClass('show');
        });

        // Close modal when clicking outside
        $('.search-modal').click((e) => {
            if ($(e.target).hasClass('search-modal')) {
                $('.search-modal').removeClass('show');
            }
        });

        // Handle escape key
        $(document).keyup((e) => {
            if (e.key === "Escape") {
                $('.search-modal').removeClass('show');
            }
        });
    }
}

// Initialize header
$(document).ready(() => {
    new Header();
});

document.addEventListener('DOMContentLoaded', function () {
    // Layout option handling
    const layoutOptions = document.querySelectorAll('.layout-option');

    // Set initial active state based on current mode
    const currentMode = localStorage.getItem('layoutMode') || 'default';
    document.querySelector(`[data-mode="${currentMode}"]`).classList.add('active');
    applyLayoutMode(currentMode);

    layoutOptions.forEach(option => {
        option.addEventListener('click', function () {
            // Remove active class from all options
            layoutOptions.forEach(opt => opt.classList.remove('active'));

            // Add active class to clicked option
            this.classList.add('active');

            // Apply layout mode
            const mode = this.dataset.mode;
            applyLayoutMode(mode);

            // Store preference
            localStorage.setItem('layoutMode', mode);
        });
    });
});

function applyLayoutMode(mode) {
    const body = document.body;
    const header = document.querySelector('.header-bar');
    const sidebar = document.querySelector('.sidebar');
    const topNav = document.querySelector('.top-nav');
    const mainContent = document.querySelector('#mainContent');

    // Remove all layout classes first
    body.classList.remove('horizontal', 'hidden-mode');
    header.classList.remove('slim');
    sidebar.classList.remove('slim');
    if (topNav) topNav.classList.remove('slim');
    mainContent.classList.remove('slim');

    // Apply new layout mode
    switch (mode) {
        case 'hidden':
            body.classList.add('hidden-mode');
            break;
        case 'slim':
            header.classList.add('slim');
            sidebar.classList.add('slim');
            mainContent.classList.add('slim');
            if (topNav) topNav.classList.add('slim');
            localStorage.setItem('previousMode', 'slim');
            break;
        case 'horizontal':
            body.classList.add('horizontal');
            // Apply previous slim state if it was slim
            const previousMode = localStorage.getItem('previousMode') || 'default';
            if (previousMode === 'slim') {
                header.classList.add('slim');
                sidebar.classList.add('slim');
                if (topNav) topNav.classList.add('slim');
            }
            break;
        case 'default':
            localStorage.setItem('previousMode', 'default');
            break;
    }
    // Store current mode
    localStorage.setItem('layoutMode', mode);
}

// Add this after the DOMContentLoaded event listener
document.addEventListener('keydown', function(e) {
    // Alt + H to toggle hidden mode
    if (e.altKey && e.key.toLowerCase() === 'h') {
        const currentMode = localStorage.getItem('layoutMode');
        const newMode = currentMode === 'hidden' ? 'default' : 'hidden';
        applyLayoutMode(newMode);

        // Update active state of layout options
        document.querySelectorAll('.layout-option').forEach(opt => {
            opt.classList.toggle('active', opt.dataset.mode === newMode);
        });
    }
});