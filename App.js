const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    const filePath = path.join(__dirname, 'index.html');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error al cargar el archivo');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
  }
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(\`Servidor en http://localhost:\${PORT}\`);
});

const htmlContent = \`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LoveConnect</title>
  <style>
    body { font-family: sans-serif; background: #ffdde1; padding: 2rem; text-align: center; }
    #chat { background: white; height: 300px; overflow-y: auto; padding: 1rem; border-radius: 10px; }
    .message { margin-bottom: 0.5rem; background: #ffe6f0; padding: 0.5rem; border-radius: 5px; }
    input, button { padding: 0.5rem; margin-top: 1rem; font-size: 1rem; }
    button { background: pink; border: none; color: white; }
  </style>
</head>
<body>
  <h1>LoveConnect 💖</h1>
  <div id="chat"></div>
  <input id="msg" placeholder="Escribe...">
  <button onclick="sendMessage()">Enviar</button>
  <script>
    const socket = new WebSocket('wss://' + location.host);
    const chat = document.getElementById('chat');
    const msgInput = document.getElementById('msg');
    socket.onmessage = (event) => {
      const div = document.createElement('div');
      div.className = 'message';
      div.textContent = event.data;
      chat.appendChild(div);
      chat.scrollTop = chat.scrollHeight;
    };
    function sendMessage() {
      const message = msgInput.value;
      if (message.trim() !== '') {
        socket.send(message);
        const div = document.createElement('div');
        div.className = 'message';
        div.textContent = 'Tú: ' + message;
        chat.appendChild(div);
        msgInput.value = '';
      }
    }
  </script>
</body>
</html>
\`;
fs.writeFileSync(path.join(__dirname, 'index.html'), htmlContent);
