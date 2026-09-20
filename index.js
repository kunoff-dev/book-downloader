require('dotenv').config();

const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs').promises;


async function saveBookAsPDF(token, type, pages, outputName) {
    const browser = await puppeteer.launch({
        headless: true
    });

    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.print = () => {
            console.log('Print window call intercepted');
        };
    });

    const mergedPDF = await PDFDocument.create();

    try {
        for (let i = 1; i <= pages; i++){
            console.log(`Page loading ${i}...`);

            await page.goto(`...`, { waitUntil: 'networkidle0' });

            console.log('Copying a page to the clipboard...');

            const pageBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '20px',
                    right: '20px',
                    bottom: '20px',
                    left: '20px'
                }
            });

            const tempPDF = await PDFDocument.load(pageBuffer);
            const [ copiedPage ] = await mergedPDF.copyPages(tempPDF, [0]);
            mergedPDF.addPage(copiedPage);

            console.log(`Done! ${i} page has been added to the buffer`);
        }

        const mergedPdfBytes = await mergedPDF.save();
        await fs.writeFile(outputName, mergedPdfBytes);

        console.log(`Done! Pages have been successfully combined`);

    } catch (error) {
        console.error('An error occurred when creating the PDF:', error);
    } finally {
        await browser.close();
    }
}

const token = process.env.TOKEN;
const type = process.env.TYPE;
const pages = process.env.PAGES;
const outputName = process.env.OUTPUT_NAME;

saveBookAsPDF(token, type, pages, outputName);