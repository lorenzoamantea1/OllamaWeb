import { getCurrentConversation, createNewConversation, saveConversations, streamingConversationId, writeStreamingConversationId } from "./convsManager.js";
import { renderMessages, renderAssistantStreamingMessage } from "./ui/rendering.js";
import { autoResizeTextarea } from "./ui/domManipulation.js";
import { showLoadingMessage, hideLoadingMessage } from "./ui/loadingIndicator.js";
import { model, model_name } from "./app.js";

let isLoading = false;

export async function sendMessage() {
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

    writeStreamingConversationId(currentConv.id);
    

    try {
        const response = await fetch('/api/chat', {
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
        writeStreamingConversationId(null);
    }
}