import { sendMessage } from './messageHandling.js';
import { showLoadingMessage, hideLoadingMessage } from './ui/loadingIndicator.js';
import { createNewConversation, selectConversation, deleteConversation, editConversationTitleById } from './convsManager.js';
import { title } from './eventListeners.js'
import { toggleSidebar } from './ui/domManipulation.js';

const defaultOption = "deepseek-r1:32b"

export let model = null;
export let model_name = null;
export function writeModelName(val) { model_name = val }
export function writeModel(val) { model = val }

if (defaultOption) {
    model = defaultOption;
    model_name = defaultOption;
    title.textContent = defaultOption;
}

window.sendMessage = sendMessage;
window.showLoadingMessage = showLoadingMessage;
window.hideLoadingMessage = hideLoadingMessage;

window.createNewConversation = createNewConversation;
window.editConversationTitleById = editConversationTitleById;
window.selectConversation = selectConversation;
window.deleteConversation = deleteConversation;

window.model = model;
window.model_name = model_name;

window.toggleSidebar = toggleSidebar