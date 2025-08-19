import { renderMessages } from './ui/rendering.js'
import { model, model_name} from "./app.js";

let conversations = [];

export let currentConversationId = null;
export let streamingConversationId = null;
export function writeStreamingConversationId(val) {streamingConversationId = val}
export function writeCurrentConversationId(val) {currentConversationId = val}

export function loadConversations() {
    const saved = localStorage.getItem('ai-conversations');
    if (saved) {
        try {
            conversations = JSON.parse(saved);
            if (!Array.isArray(conversations)) {
                conversations = [];
            }
        } catch {
            conversations = [];
        }
    } else {
        conversations = [];
    }
    currentConversationId = null;

    renderConversations();
    renderMessages();
}

export function saveConversations() {
    localStorage.setItem('ai-conversations', JSON.stringify(conversations));
}

export function createNewConversation() {
    const newConversation = {
        id: Date.now().toString(),
        title: 'New Conversation',
        messages: [{
            id: 'welcome',
            content: "Hi! I'm your AI assistant. How can I help you today?",
            role: 'assistant',
            timestamp: new Date().toLocaleTimeString(),
            model: model,
            model_name: model_name
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    conversations.unshift(newConversation);
    currentConversationId = newConversation.id;
    saveConversations();
    renderConversations();
    renderMessages();
    if (window.innerWidth < 768) {
        sidebarOpen = false;
        updateSidebarVisibility();
    }
}

export function selectConversation(conversationId) {
    currentConversationId = conversationId;
    streamingConversationId = conversationId;
    renderConversations();
    renderMessages();
    if (window.innerWidth < 768) {
        sidebarOpen = false;
        updateSidebarVisibility();
    }
}

export function deleteConversation(id) {
    conversations = conversations.filter(conv => conv.id !== id);
    currentConversationId = null;

    saveConversations();
    renderConversations();
    renderMessages();
}


export function getCurrentConversation() {
    return conversations.find(c => c.id === currentConversationId);
}

function renderConversations() {
    const container = document.getElementById('conversationsList');
    container.innerHTML = '';

    conversations.forEach(conversation => {
        const item = document.createElement('div');
        item.className = `conversation-item ${conversation.id === currentConversationId ? 'active' : ''}`;
        item.onclick = () => selectConversation(conversation.id);

        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1; overflow: hidden;">
                    <div class="conversation-title" style="display: flex; align-items: center;">
                        <svg class="icon icon-sm" viewBox="0 0 24 24" style="flex-shrink: 0;">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex-grow: 1; margin-left: 8px;">
                            ${conversation.title}
                        </span>
                    </div>
                    <div class="conversation-meta">
                        <svg class="icon icon-sm" viewBox="0 0 24 24">
                            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        ${new Date(conversation.updatedAt).toLocaleDateString()}
                        <span style="margin-left: 8px;">${conversation.messages.length} messaggi</span>
                    </div>
                </div>
                <button class="delete-btn" onclick="event.stopPropagation(); deleteConversation('${conversation.id}')"
                    title="Delete Conversation">
                    <svg class="icon icon-sm" viewBox="0 0 24 24">
                        <path d="m3 6 3 0"/>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    </svg>
                </button>
                <button class="edit-btn" onclick="event.stopPropagation(); editConversationTitleById('${conversation.id}')"
                    title="Modify Title">
                    <svg class="icon icon-sm" viewBox="0 0 24 24">
                        <path d="M12 20h9"/>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                    </svg>
                </button>
            </div>
        `;

        container.appendChild(item);
    });

    const currentConv = getCurrentConversation();
    const info = document.getElementById('conversationInfo');
    info.textContent = currentConv ? currentConv.title : 'New Conversation';
}

export function editConversationTitleById(conversationId) {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return;

    const container = document.getElementById('conversationsList');
    const items = container.querySelectorAll('.conversation-item');

    items.forEach(item => {
        const titleSpan = item.querySelector('.conversation-title span');
        if (titleSpan && item.classList.contains('active')) {
            titleSpan.innerHTML = `<input type="text" id="editTitleInput" class="conversation-edit-input" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" value="${conversation.title}" style="width: 100%; font-size: 1em;">`;

            const input = titleSpan.querySelector('input');
            input.focus();
            input.select();

            function saveTitle() {
                const newTitle = input.value.trim();
                if (newTitle) {
                    conversation.title = newTitle;
                    conversation.updatedAt = new Date().toISOString();
                    saveConversations();
                }
                renderConversations();
                renderMessages();
            }

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') saveTitle();
                if (e.key === 'Escape') {
                    renderConversations();
                }
            });
            input.addEventListener('blur', saveTitle);
        }
    });
}