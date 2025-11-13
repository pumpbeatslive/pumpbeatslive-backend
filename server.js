import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import WebSocket from 'ws';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

let beatQueue = [];
let nowPlaying = null;

// Pump.fun WebSocket connection
const pumpWs = new WebSocket('wss://pumpportal.fun/api/data');

pumpWs.on('open', () => {
  console.log('Connected to Pump.fun');
  // Subscribe to your token -B1yNXS1zB45Z1zfvM7yw2NSebHPnH1UBHUECY7YUpump
  pumpWs.send(JSON.stringify({
    method: 'subscribeTokenTrade',
    keys: ['B1yNXS1zB45Z1zfvM7yw2NSebHPnH1UBHUECY7YUpump']
  }));
});

pumpWs.on('message', (data) => {
  const msg = JSON.parse(data);
  console.log('Pump.fun message:', msg);
  // Parse commands from pump.fun chat here
});

app.post('/api/request', (req, res) => {
  const { command } = req.body;
  
  if (command.startsWith('!make')) {
    const style = command.replace('!make', '').replace('beat', '').trim() || 'random';
    const beat = {
      title: style + ' beat',
      requester: 'User',
      wallet: 'local'
    };
    
    beatQueue.push(beat);
    io.emit('queue', beatQueue);
    io.emit('chat', { user: 'System', text: 'Beat added to queue: ' + beat.title });
  }
  
  res.json({ status: 'ok' });
});

io.on('connection', (socket) => {
  console.log('Client connected');
  socket.emit('queue', beatQueue);
  socket.emit('nowPlaying', nowPlaying);
});

const PORT = process.env.PORT || 10000; app.listen(PORT, () => console.log(`Server running on port ${PORT}`));