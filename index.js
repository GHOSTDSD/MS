const express = require('express');
const path = require('path');
const cors = require('cors');
const puppeteer = require('puppeteer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

let browser = null;
let page = null;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    res.render('index.html');
});

app.post('/api/init-browser', async (req, res) => {
    try {
        if (!browser) {
            browser = await puppeteer.launch({
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--disable-gpu',
                    '--window-size=1280,800'
                ],
                headless: 'new',
                defaultViewport: { width: 1280, height: 800 }
            });
            
            page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
            await page.goto('https://www.instagram.com', { waitUntil: 'networkidle2', timeout: 30000 });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/navigate', async (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Username obrigatorio' });
    try {
        if (!page) return res.status(400).json({ error: 'Navegador nao inicializado' });
        await page.goto(`https://www.instagram.com/${username}/`, { waitUntil: 'networkidle2', timeout: 30000 });
        await page.waitForTimeout(2000);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/screenshot', async (req, res) => {
    try {
        if (!page) return res.status(400).json({ error: 'Navegador nao inicializado' });
        const screenshot = await page.screenshot({ encoding: 'base64', fullPage: true });
        res.json({ success: true, image: screenshot });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/scroll', async (req, res) => {
    const { direction = 'down' } = req.body;
    try {
        if (!page) return res.status(400).json({ error: 'Navegador nao inicializado' });
        if (direction === 'down') await page.evaluate(() => window.scrollBy(0, 500));
        else await page.evaluate(() => window.scrollBy(0, -500));
        await page.waitForTimeout(1000);
        const screenshot = await page.screenshot({ encoding: 'base64', fullPage: true });
        res.json({ success: true, image: screenshot });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/click-post', async (req, res) => {
    try {
        if (!page) return res.status(400).json({ error: 'Navegador nao inicializado' });
        await page.waitForSelector('article a', { timeout: 10000 });
        const posts = await page.$$('article a');
        if (posts.length > 0) await posts[0].click();
        await page.waitForTimeout(2000);
        const screenshot = await page.screenshot({ encoding: 'base64', fullPage: true });
        res.json({ success: true, image: screenshot });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/close-browser', async (req, res) => {
    try {
        if (browser) await browser.close();
        browser = null;
        page = null;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/create-vm', (req, res) => {
    const { name, type } = req.body;
    res.json({
        success: true,
        vm: {
            id: Date.now(),
            name: name || 'VM',
            type: type || 't2.micro',
            status: 'running',
            ip: '192.168.1.1'
        }
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
