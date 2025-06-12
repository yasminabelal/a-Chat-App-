document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const usernameInput = document.getElementById('username');
    
    // الاتصال بالخادم المحلي
    const socket = new WebSocket('ws://localhost:8080');
    
    socket.onopen = () => {
        const username = usernameInput.value.trim() || 'Anonymous';
        socket.send(JSON.stringify({
            type: 'login',
            username
        }));
    };
    
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'chat') {
            addMessage(data.username, data.message, data.username !== usernameInput.value.trim());
        } else if (data.type === 'system') {
            addSystemMessage(data.message);
        }
    };
    
    // باقي الكود كما هو...
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => e.key === 'Enter' && sendMessage());
    
    async function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;
        
        socket.send(JSON.stringify({
            type: 'chat',
            message
        }));
        
        messageInput.value = '';
    }
    
    function addMessage(username, message, isOtherUser) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${isOtherUser ? 'other-message' : 'user-message'}`;
        messageElement.innerHTML = `
            <span class="message-username">${username}</span>
            ${message}
            <span class="message-time">${new Date().toLocaleTimeString()}</span>
        `;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function addSystemMessage(message) {
        const systemMsg = document.createElement('div');
        systemMsg.className = 'system-message';
        systemMsg.textContent = message;
        chatMessages.appendChild(systemMsg);
    }
});