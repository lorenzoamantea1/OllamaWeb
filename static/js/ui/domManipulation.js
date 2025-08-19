let sidebarOpen = window.innerWidth >= 768;

export function autoResizeTextarea() {
    const textarea = document.getElementById('messageInput');
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
}

export function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
    updateSidebarVisibility();
}

export function updateSidebarVisibility() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    if (window.innerWidth < 768) {
        if (sidebarOpen) {
            sidebar.classList.add('open');
            overlay.classList.add('active');
        } else {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        }
    } else {
        sidebar.classList.toggle('hidden', !sidebarOpen);
        overlay.classList.remove('active');
    }
}

export function readSidebarOpen() {
    return sidebarOpen
}
export function writeSidebarOpen(val) {
    sidebarOpen = val
}