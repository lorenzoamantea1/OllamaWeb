import { loadConversations } from "./convsManager.js";
import { sendMessage } from "./messageHandling.js";
import { updateSidebarVisibility, autoResizeTextarea, writeSidebarOpen } from './ui/domManipulation.js'
import { model_name, writeModelName, writeModel } from "./app.js";

const customSelect = document.getElementById('customSelect');
export const selected = customSelect.querySelector('.selected');
export const options = customSelect.querySelector('.options');

const title = document.querySelector('.header-left .title');

document.addEventListener('DOMContentLoaded', () => {
    loadConversations();
    setupEventListeners();
    updateSidebarVisibility();
});

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

    options.querySelectorAll('li').forEach(li => {
        li.addEventListener('click', () => {
            writeModel(li.getAttribute('data-value'));
            writeModelName(li.textContent);

            title.textContent = model_name
            selected.textContent = model_name;;
            options.classList.remove('show');

            options.style.display = 'none'
        });
    });


    customSelect.addEventListener('click', () => {
        options.classList.toggle('show');
        customSelect.classList.toggle('open');

        options.style.display = 'block'
    });
}