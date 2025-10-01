const puppeteer = require('puppeteer');
const fs = require('fs');

class VanguardPuppeteerScraper {
    constructor() {
        this.url = 'https://www.vanguardinvestor.co.uk/investments/vanguard-lifestrategy-100-equity-fund-accumulation-shares/overview';
    }

    async scrapeData() {
        let browser;
        try {
            console.log('Launching browser...');
            
            // Launch browser with appropriate settings
            browser = await puppeteer.launch({
                headless: true, // Use headless mode for GitHub Actions
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            });

            const page = await browser.newPage();
            
            // Set viewport and user agent
            await page.setViewport({ width: 1366, height: 768 });
            await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

            console.log(`Navigating to: ${this.url}`);
            
            // Navigate to the page
            await page.goto(this.url, { 
                waitUntil: 'networkidle2',
                timeout: 30000 
            });

            // Handle cookie consent if present
            try {
                await this.handleCookieConsent(page);
            } catch (error) {
                console.log('No cookie consent found or already handled');
            }

            // Wait for content to load
            await new Promise(resolve => setTimeout(resolve, 3000));

            console.log('Extracting fund data...');
            
            // Extract fund data using targeted approach
            const fundData = await page.evaluate(() => {
                const data = {
                    nav_price_gbp: null,
                    change: null,
                    change_percentage: null,
                    currency: 'GBP',
                    last_updated: new Date().toISOString()
                };

                console.log('Starting HTML parsing for NAV price...');

                // Function to find NAV price by looking for "NAV price" label
                const findNavPrice = () => {
                    console.log('Searching for NAV price label...');
                    
                    // First, let's find all text that contains "NAV" or "price"
                    const allElements = document.querySelectorAll('*');
                    const candidateElements = [];
                    
                    for (const element of allElements) {
                        const text = element.textContent || '';
                        const directText = element.innerText || '';
                        
                        // Look for various NAV price patterns
                        if (text.toLowerCase().includes('nav price') || 
                            text.toLowerCase().includes('nav') || 
                            directText.toLowerCase().includes('price') ||
                            text.toLowerCase().includes('net asset value')) {
                            candidateElements.push({
                                element: element,
                                text: text.trim(),
                                directText: directText.trim()
                            });
                        }
                    }
                    
                    console.log(`Found ${candidateElements.length} candidate elements containing NAV/price`);
                    
                    // Search through candidates for price values
                    for (const candidate of candidateElements) {
                        console.log('Checking candidate:', candidate.text.substring(0, 100));
                        
                        // Look for £ values in the same element or nearby
                        const searchArea = candidate.element.closest('div, section, article, table, tr, td') || candidate.element;
                        const areaText = searchArea.textContent || '';
                        
                        const priceMatches = areaText.match(/£(\d+\.?\d*)/g);
                        if (priceMatches) {
                            console.log('Found price matches in area:', priceMatches);
                            // Return the first reasonable price (typically more than £1)
                            for (const match of priceMatches) {
                                const price = match.replace('£', '');
                                const numPrice = parseFloat(price);
                                if (numPrice > 1) { // Filter out very small values that might be fees
                                    console.log('Selected NAV price:', price);
                                    return price;
                                }
                            }
                        }
                    }

                    return null;
                };

                // Function to find change value
                const findChange = () => {
                    // Look for change labels and then find associated values
                    const changeLabels = ['change'];
                    
                    for (const label of changeLabels) {
                        const walker = document.createTreeWalker(
                            document.body,
                            NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
                            null,
                            false
                        );

                        let node;
                        while (node = walker.nextNode()) {
                            const text = node.textContent || '';
                            if (text.toLowerCase().includes(label)) {
                                console.log(`Found ${label} label:`, text.trim());
                                const changeElement = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
                                
                                // Look for change value near this element
                                const searchNearElement = (element) => {
                                    // Check same element
                                    const sameText = element.textContent || '';
                                    const changeMatch = sameText.match(/([+-]£?\d+\.?\d*)/);
                                    if (changeMatch) return changeMatch[1];

                                    // Check siblings
                                    let sibling = element.nextElementSibling;
                                    while (sibling) {
                                        const siblingText = sibling.textContent || '';
                                        const changeInSibling = siblingText.match(/([+-]£?\d+\.?\d*)/);
                                        if (changeInSibling) return changeInSibling[1];
                                        sibling = sibling.nextElementSibling;
                                    }
                                    return null;
                                };

                                const changeValue = searchNearElement(changeElement);
                                if (changeValue) {
                                    console.log('Found change value:', changeValue);
                                    return changeValue;
                                }
                            }
                        }
                    }
                    return null;
                };

                // Execute the search functions
                data.nav_price_gbp = findNavPrice();
                data.change = findChange();

                console.log('Extraction complete. Results:', data);
                return data;
            });

            console.log('Fund data extracted:', fundData);

            return fundData;

        } catch (error) {
            console.error('Error during scraping:', error);
            throw error;
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }

    async handleCookieConsent(page) {
        // Common cookie consent button selectors
        const cookieSelectors = [
            'button[id*="accept"]',
            'button[class*="accept"]',
            'button[data-testid*="accept"]',
            'button:contains("Accept")',
            'button:contains("Accept all")',
            '[data-cy="accept-all-cookies"]',
            '#accept-cookies',
            '.accept-cookies',
            'button[aria-label*="accept"]'
        ];

        for (const selector of cookieSelectors) {
            try {
                const button = await page.$(selector);
                if (button) {
                    console.log(`Found cookie consent button: ${selector}`);
                    await button.click();
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    return;
                }
            } catch (error) {
                // Continue to next selector
            }
        }

        // Try clicking any button that contains "accept" text
        try {
            await page.evaluate(() => {
                const buttons = document.querySelectorAll('button');
                for (const button of buttons) {
                    if (button.textContent.toLowerCase().includes('accept')) {
                        button.click();
                        return;
                    }
                }
            });
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
            console.log('Could not handle cookie consent automatically');
        }
    }

    formatOutput(data) {
        console.log('\n' + '='.repeat(50));
        console.log('VANGUARD LIFESTRATEGY 100 EQUITY FUND');
        console.log('='.repeat(50));
        
        if (data.nav_price_gbp) {
            console.log(`NAV Price (GBP): £${data.nav_price_gbp}`);
        } else {
            console.log('NAV Price (GBP): Not found');
        }
        
        if (data.change) {
            console.log(`Change: ${data.change}`);
        } else {
            console.log('Change: Not found');
        }
        
        if (data.change_percentage) {
            console.log(`Change %: ${data.change_percentage}`);
        }
        
        console.log(`Last Updated: ${new Date().toLocaleString()}`);
        console.log('='.repeat(50));

        // Save to JSON file
        const filename = 'vanguard_fund_data.json';
        fs.writeFileSync(filename, JSON.stringify(data, null, 2));
        console.log(`\nData saved to ${filename}`);

        return data;
    }
}

async function main() {
    const scraper = new VanguardPuppeteerScraper();
    
    try {
        const data = await scraper.scrapeData();
        scraper.formatOutput(data);
    } catch (error) {
        console.error('Scraping failed:', error);
        process.exit(1);
    }
}

// Run the scraper
if (require.main === module) {
    main();
}

module.exports = VanguardPuppeteerScraper;
