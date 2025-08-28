import { getCurrentConversation } from '../convsManager.js'
import { getModels } from '../api/models.js';
import { model_name, writeModel, writeModelName } from "../app.js";

export const title = document.querySelector('.header-left .title');
const models_menu = document.querySelector('.header-left .models-menu');

export function renderMessages() {
    const container = document.getElementById('messagesWrapper');
    const currentConv = getCurrentConversation();
    container.innerHTML = '';

    if (!currentConv) return;


    currentConv.messages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.role}`;
        const avatarIcon = message.role === 'user'
            ? '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'
            : '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>';
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <svg class="icon" viewBox="0 0 24 24">
                    ${avatarIcon}
                </svg>
            </div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-role">${message.role === 'user' ? 'You' : message.model_name}</span>
                    <span class="message-time">${message.timestamp}</span>
                </div>
                <div class="message-text">${message.content}</div>
            </div>
        `;
        container.appendChild(messageDiv);
    });

    document.querySelectorAll('.copy-btn').forEach(copyBtn => {
        copyBtn.addEventListener('click', () => {
            const pre = copyBtn.closest('pre');
            if (!pre) return;

            const codeText = pre.querySelector('code')?.innerText || pre.innerText;
            if (!codeText) return;

            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(codeText.trim()).catch(err => console.error(err));
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = codeText.trim();
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                try { document.execCommand('copy'); } catch (err) { console.error(err); }
                document.body.removeChild(textarea);
            }
        });
    });

    document.querySelectorAll('.toggle-think').forEach(toggleThink => {
        toggleThink.addEventListener('click', () => {
            const div = toggleThink.parentElement.querySelector('.think-content');

            if (!div) return;

            if (div.style.display == "block") {
                div.style.display = 'none'
            } else {
                div.style.display = 'block'
            }

        });
    });

    container.scrollTop = container.scrollHeight;
}
export async function renderModelsList() {
    try {
        let models_list = await getModels();
        let container = document.getElementById('modelsList');
        
        if (Array.isArray(models_list)) {
            container.innerHTML = '';

            models_list.forEach(model_ => {
                let listItem = document.createElement('li');
                listItem.classList.add('model');
                listItem.textContent = model_["model"]; 
                
                listItem.addEventListener('click', () => {
                    if (typeof models !== 'undefined') {
                        models.forEach(m => m.id = '');
                    }
                    listItem.id = 'selected-model';
                    
                    writeModel(listItem.textContent);
                    writeModelName(listItem.textContent);
                    title.textContent = listItem.textContent;
                    models_menu.classList.toggle('show');
                });

                container.appendChild(listItem); 
            });
        } else {
            console.error('I dati non sono un array valido:', models_list);
        }
    } catch (error) {
        console.error('Errore nel rendering dei modelli:', error);
    }
}




export function renderAssistantStreamingMessage(text) {
    const container = document.getElementById('messagesWrapper');
    let assistantDiv = document.getElementById('assistantStreamingMessage');

    if (!assistantDiv) {
        assistantDiv = document.createElement('div');
        assistantDiv.id = 'assistantStreamingMessage';
        assistantDiv.className = 'message assistant';
        assistantDiv.innerHTML = `
            <div class="message-avatar">
                <svg class="icon" viewBox="0 0 24 24">
                    <path d="M12 8V4H8"/>
                    <rect width="16" height="12" x="4" y="8" rx="2"/>
                    <path d="M2 14h2"/>
                    <path d="M20 14h2"/>
                    <path d="M15 13v2"/>
                    <path d="M9 13v2"/>
                </svg>
            </div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-role">${model_name}</span>
                    <span class="message-time">${new Date().toLocaleTimeString()}</span>
                </div>
                <div class="message-text"></div>
            </div>
        `;
        container.appendChild(assistantDiv);
    }

    const textDiv = assistantDiv.querySelector('.message-text');
    textDiv.innerHTML = text;
    container.scrollTop = container.scrollHeight;
}