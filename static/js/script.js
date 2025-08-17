let isLoading = false;

let sidebarOpen = window.innerWidth >= 768;

const customSelect = document.getElementById('customSelect');
const selected = customSelect.querySelector('.selected');
const options = customSelect.querySelector('.options');
const defaultOption = options.querySelector('.selected-option');

const title = document.querySelector('.header-left .title');

const sendButton = options.querySelector('.send-btn');

let model = null;
let model_name = null;

let conversations = [];
let currentConversationId = null;
let streamingConversationId = null;

if (defaultOption) {
    model = defaultOption.getAttribute('data-value');
    model_name = defaultOption.textContent;
    selected.textContent = model_name;
}
document.addEventListener('DOMContentLoaded', () => {
    loadConversations();
    setupEventListeners();
    updateSidebarVisibility();
});


selected.addEventListener('click', () => {
    options.classList.toggle('show');
    customSelect.classList.toggle('open');

    options.style.display = 'block'
});

options.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', () => {
        model = li.getAttribute('data-value');
        model_name = li.textContent;

        title.textContent = model_name
        selected.textContent = model_name;;
        options.classList.remove('show');

        options.style.display = 'none'
    });
});



function setupEventListeners() {
    const messageInput = document.getElementById('messageInput');
    messageInput.addEventListener('input', autoResizeTextarea);
    messageInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    document.getElementById('overlay').addEventListener('click', () => {
        sidebarOpen = false;
        updateSidebarVisibility();
    });
    window.addEventListener('resize', () => {
        sidebarOpen = window.innerWidth >= 768;
        updateSidebarVisibility();
    });
}

function autoResizeTextarea() {
    const textarea = document.getElementById('messageInput');
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
}

function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
    updateSidebarVisibility();
}

function updateSidebarVisibility() {
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

function loadConversations() {
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

function saveConversations() {
    localStorage.setItem('ai-conversations', JSON.stringify(conversations));
}

function createNewConversation() {
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

function selectConversation(conversationId) {
    currentConversationId = conversationId;
    streamingConversationId = conversationId;
    renderConversations();
    renderMessages();
    if (window.innerWidth < 768) {
        sidebarOpen = false;
        updateSidebarVisibility();
    }
}

function deleteConversation(id) {
    conversations = conversations.filter(conv => conv.id !== id);
    currentConversationId = null;

    saveConversations();
    renderConversations();
    renderMessages();
}


function getCurrentConversation() {
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

function editConversationTitleById(conversationId) {
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

function renderMessages() {
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
                    <span class="message-role">${message.role === 'user' ? 'Tu' : message.model_name}</span>
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

function showLoadingMessage() {
    const container = document.getElementById('messagesWrapper');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-message';
    loadingDiv.id = 'loadingMessage';
    loadingDiv.innerHTML = `
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
            </div>
            <div class="loading-dots">
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
            </div>
        </div>
    `;
    container.appendChild(loadingDiv);
    container.scrollTop = container.scrollHeight;
}

function hideLoadingMessage() {
    const loadingMessage = document.getElementById('loadingMessage');
    if (loadingMessage) loadingMessage.remove();
}

async function sendMessage() {
    if (isLoading) return;

    let input = document.getElementById('messageInput');

    const userMessage = input.value.trim();
    if (!userMessage) return;

    document.querySelector('.send-btn').disabled = true;
    isLoading = true;

    let currentConv = getCurrentConversation();
    if (!currentConv) {
        createNewConversation()
        currentConv = getCurrentConversation();
    }
    const timestamp = new Date().toLocaleTimeString();

    const newUserMessage = {
        id: Date.now().toString(),
        content: userMessage,
        role: 'user',
        timestamp: timestamp
    };
    currentConv.messages.push(newUserMessage);
    currentConv.updatedAt = new Date().toISOString();
    renderMessages();
    input.value = '';
    autoResizeTextarea();
    showLoadingMessage();
    saveConversations();

    streamingConversationId = currentConv.id;

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                message: userMessage,
                conversation_id: currentConv.id,
                messages: JSON.stringify(currentConv.messages),
                model: model
            })
        });

        if (!response.ok) throw new Error(`Errore dal server: ${response.status} ${response.statusText}`);

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let done = false;

        let assistantMessage = {
            id: Date.now().toString() + '-assistant',
            content: '',
            role: 'assistant',
            timestamp: new Date().toLocaleTimeString(),
            model: model,
            model_name: model_name
        };

        while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            if (value) {
                const chunk = decoder.decode(value, { stream: true });
                
                if (chunk.includes('<!--END-->')) {
                    const [rawPart, markdownPart] = chunk.split('<!--END-->');

                    assistantMessage.content = markdownPart.trim();
                    assistantMessage.raw = rawPart

                    if (streamingConversationId === currentConv.id) {
                        renderMessages();
                    }
                    
                    const scriptMatch = markdownPart.match(/window\.chatMeta\s*=\s*(\{.*\});/);
                    if (scriptMatch) {
                        window.chatMeta = JSON.parse(scriptMatch[1]);
                        const thinkTime = window.chatMeta.total_think_time_sec.toFixed(2)
                        assistantMessage.content = assistantMessage.content.replace(
                            /(<button[^>]*class="[^"]*toggle-think[^"]*"[^>]*>)(.*?)(<\/button>)/gi,
                            `<button class="toggle-think">Thought for ${thinkTime} seconds</button>`
                        );
                    }
                    continue;
                }

                if (streamingConversationId === currentConv.id) {
                    assistantMessage.content += chunk;
                    renderAssistantStreamingMessage(assistantMessage.content, currentConv.id);
                }

            }
        }

        hideLoadingMessage();
        if (assistantMessage.content.trim().length === 0)
            assistantMessage.content = '[No Response Recived]';

        currentConv.messages.push(assistantMessage);
        currentConv.updatedAt = new Date().toISOString();
        saveConversations();

        if (streamingConversationId === currentConv.id) {
            renderMessages();
        }

    } catch (error) {
        hideLoadingMessage();
        alert('Errore durante la comunicazione: ' + error.message);
        console.error(error);
    } finally {
        isLoading = false;
        document.querySelector('.send-btn').disabled = false;
        streamingConversationId = null;
    }
}


function renderAssistantStreamingMessage(text) {
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