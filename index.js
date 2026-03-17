const express = require('express');
const path = require('path');
const cors = require('cors');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
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
            const executablePath = await chromium.executablePath();
            
            browser = await puppeteer.launch({
                args: [
                    ...chromium.args,
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--disable-gpu',
                    '--window-size=1280,800'
                ],
                defaultViewport: chromium.defaultViewport,
                executablePath: executablePath,
                headless: chromium.headless,
                ignoreHTTPSErrors: true,
            });
            
            page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            
            await page.goto('https://www.instagram.com', {
                waitUntil: 'networkidle2',
                timeout: 60000
            });
        }
        
        res.json({ success: true, message: 'Navegador inicializado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/navigate', async (req, res) => {
    const { username } = req.body;
    
    if (!username) {
        return res.status(400).json({ error: 'Username obrigatorio' });
    }

    try {
        if (!page) {
            return res.status(400).json({ error: 'Navegador nao inicializado' });
        }

        await page.goto(`https://www.instagram.com/${username}/`, {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        await page.waitForTimeout(3000);
        await autoScroll(page);

        res.json({ success: true, message: `Navegando para ${username}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/screenshot', async (req, res) => {
    try {
        if (!page) {
            return res.status(400).json({ error: 'Navegador nao inicializado' });
        }

        await page.waitForTimeout(1000);
        
        const screenshot = await page.screenshot({
            encoding: 'base64',
            fullPage: true,
            type: 'jpeg',
            quality: 80
        });

        res.json({ success: true, image: screenshot });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/scroll', async (req, res) => {
    const { direction = 'down' } = req.body;
    
    try {
        if (!page) {
            return res.status(400).json({ error: 'Navegador nao inicializado' });
        }

        if (direction === 'down') {
            await page.evaluate(() => {
                window.scrollBy(0, 500);
            });
        } else {
            await page.evaluate(() => {
                window.scrollBy(0, -500);
            });
        }

        await page.waitForTimeout(1000);
        
        const screenshot = await page.screenshot({
            encoding: 'base64',
            fullPage: true,
            type: 'jpeg',
            quality: 80
        });

        res.json({ success: true, message: `Scroll ${direction}`, image: screenshot });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/click-post', async (req, res) => {
    const { index = 0 } = req.body;
    
    try {
        if (!page) {
            return res.status(400).json({ error: 'Navegador nao inicializado' });
        }

        await page.waitForSelector('article a', { timeout: 10000 });
        const posts = await page.$$('article a');
        
        if (posts.length > index) {
            await posts[index].click();
            await page.waitForTimeout(3000);
        }

        const screenshot = await page.screenshot({
            encoding: 'base64',
            fullPage: true,
            type: 'jpeg',
            quality: 80
        });

        res.json({ success: true, message: 'Post clicado', image: screenshot });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/close-browser', async (req, res) => {
    try {
        if (browser) {
            await browser.close();
            browser = null;
            page = null;
        }
        res.json({ success: true, message: 'Navegador fechado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 200;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight || totalHeight >= 3000) {
                    clearInterval(timer);
                    resolve();
                }
            }, 200);
        });
    });
}

app.post('/api/create-vm', (req, res) => {
    const { name, type } = req.body;
    
    const vmConfig = {
        id: Date.now(),
        name: name || 'Instagram Viewer VM',
        type: type || 't2.micro',
        resources: {
            cpu: '1 vCPU',
            memory: '1 GB',
            storage: '30 GB'
        },
        status: 'running',
        created: new Date().toISOString(),
        ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
    };

    res.json({
        success: true,
        message: 'VM criada',
        vm: vmConfig
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
