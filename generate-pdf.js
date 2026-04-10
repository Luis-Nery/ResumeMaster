const puppeteer = require('puppeteer')

const html = Buffer.from(process.argv[2], 'base64').toString('utf-8')

;(async () => {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
        ]
    })
    const page = await browser.newPage()
    await page.setContent(html, {waitUntil: 'networkidle0'})
    const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {top: 0, right: 0, bottom: 0, left: 0},
        scale: 0.9,
    })
    await browser.close()
    process.stdout.write(pdf)
})()