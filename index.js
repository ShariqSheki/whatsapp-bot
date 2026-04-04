const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { createClient } = require('@supabase/supabase-js');
const http = require('http');
const { execSync } = require('child_process');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// HTTP server
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('WhatsApp Bot is running!');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Download Chrome at startup
console.log('Installing Chrome...');
try {
    execSync('npx puppeteer browsers install chrome', { stdio: 'inherit' });
    console.log('Chrome installed successfully');
} catch (error) {
    console.error('Failed to install Chrome:', error);
}

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
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
