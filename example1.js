const puppeteer = require('puppeteer');
async function main (){
    const browser = await puppeteer.launch();
    // const browser = await puppeteer.launch({headless:false}); // default is true
    const page = await browser.newPage();
    await page.goto('https://www.bcv.org.ve/');
    await page.screenshot({path: 'bcv.png'})
    title = await page.evaluate(() => {
        // retorno el precio de la tasa del dolar
        return document.querySelector(".views-row.views-row-1.views-row-odd.views-row-first"+
                                        ".views-row-last.row>#dolar>div>div>div:last-child").textContent.trim();
    });
    console.log(title);
    browser.close();
}
main();