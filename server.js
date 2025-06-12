// server.js
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

// قائمة لتخزين المستخدمين المتصلين
const users = new Map();

wss.on('connection', (ws) => {
    console.log('New client connected');
    
    // عند استلام رسالة من العميل
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            // إذا كانت رسالة تسجيل دخول
            if (data.type === 'login') {
                users.set(ws, data.username);
                broadcast({
                    type: 'system',
                    message: `${data.username} has joined the chat`
                });
                return;
            }
            
            // إذا كانت رسالة دردشة عادية
            const username = users.get(ws) || 'Anonymous';
            broadcast({
                type: 'chat',
                username,
                message: data.message,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    // عند انقطاع الاتصال
    ws.on('close', () => {
        const username = users.get(ws) || 'Anonymous';
        users.delete(ws);
        broadcast({
            type: 'system',
            message: `${username} has left the chat`
        });
    });
});

// دالة لإرسال الرسائل للجميع
function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

console.log('WebSocket server running on ws://localhost:8080');