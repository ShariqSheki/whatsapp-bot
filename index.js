const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { createClient } = require('@supabase/supabase-js');
const http = require('http');
const os = require('os');
const path = require('path');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// HTTP server for Render
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('WhatsApp Bot is running!');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Find Chrome path
const chromePath = path.join(os.homedir(), '.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        executablePath: chromePath,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    }
});

client.on('qr', (qr) => {
    console.log('QR CODE:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp bot is ready!');
});

client.on('message', async msg => {
    console.log('Message:', msg.body);
    msg.reply('You said: ' + msg.body);
    
    await supabase.from('messages').insert({
        content: msg.body,
        sender: msg.from,
        timestamp: new Date()
    });
});

client.initialize();
