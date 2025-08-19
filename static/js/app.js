import { sendMessage } from './messageHandling.js';
import { showLoadingMessage, hideLoadingMessage } from './ui/loadingIndicator.js';
import { createNewConversation, selectConversation, deleteConversation, editConversationTitleById } from './convsManager.js';
import { options, selected } from './eventListeners.js'

const defaultOption = options.querySelector('.selected-option');
export let model = null;
export let model_name = null;
export function writeModelName(val) {model_name=val}
export function writeModel(val) {model=val}
if (defaultOption) {
    model = defaultOption.getAttribute('data-value');
    model_name = defaultOption.textContent;
    selected.textContent = model_name;
}

window.sendMessage = sendMessage;
window.showLoadingMessage = showLoadingMessage;
window.hideLoadingMessage = hideLoadingMessage;

window.createNewConversation = createNewConversation;
window.editConversationTitleById = editConversationTitleById;
window.selectConversation = selectConversation;
window.deleteConversation = deleteConversation;

window.writeModel = writeModel;
window.writeModelName = writeModelName;

window.model = model;
window.model_name = model_name;