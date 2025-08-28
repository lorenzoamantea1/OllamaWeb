import { loadConversations, selectConversation } from "./convsManager.js";
import { sendMessage } from "./messageHandling.js";
import { updateSidebarVisibility, autoResizeTextarea, writeSidebarOpen } from './ui/domManipulation.js'
import { renderModelsList } from "./ui/rendering.js";

export const title = document.querySelector('.header-left .title');
const models_menu = document.querySelector('.header-left .models-menu');
const searchInput = document.querySelector('.models-search');
const info = document.querySelector('.search-info');

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

document.addEventListener('DOMContentLoaded', () => {
    loadConversations();
    renderModelsList();

    const sessionId = getQueryParam("c");
    if (sessionId) {
        selectConversation(sessionId);
    }

    updateSidebarVisibility();
    setupEventListeners();
});

function updateSearch() {
    const modelsList = document.querySelector('#modelsList');
    const models = modelsList.querySelectorAll('li');
    const query = searchInput.value.toLowerCase();
    let count = 0;

    models.forEach(model_item => {
        if (model_item.textContent.toLowerCase().includes(query)) {
            model_item.style.display = '';
            count++;
        } else {
            model_item.style.display = 'none';
        }
    });

    if (count === 0) {
        info.textContent = 'No models found';
    } else {
        info.textContent = `Found ${count} model${count > 1 ? 's' : ''}`;
    }
}
export function setupEventListeners() {
    const messageInput = document.getElementById('messageInput');

    messageInput.addEventListener('input', autoResizeTextarea);
    messageInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    document.getElementById('overlay').addEventListener('click', () => {
        writeSidebarOpen(false);
        updateSidebarVisibility();
    });
    window.addEventListener('resize', () => {
        writeSidebarOpen(window.innerWidth >= 768);
        updateSidebarVisibility();
    });

    title.addEventListener('click', () => {
        models_menu.classList.toggle('show');
    })
    searchInput.addEventListener('input', updateSearch);
}