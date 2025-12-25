const axios = require('axios');
const cheerio = require('cheerio');

async function testParse() {
    const url = 'https://avtprom.ru/news/2025/12/17/trendy-toir-2026-novyi-e';
    try {
        console.log('Fetching URL:', url);
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        });

        const html = response.data;
        const $ = cheerio.load(html);

        let title = $('h1').first().text().trim() || $('title').text().trim();
        console.log('Title found:', title);

        let content = '';
        const contentSelectors = [
            'article',
            '.entry-inner',
            '.ast-article-single',
            '[role="main"]',
            'main',
            '.post-content',
            '.article-content',
            '.entry-content',
            '.content',
            '.post',
            '.article-body',
            '#content',
            '.story-body',
            '.post-body'
        ];

        for (const selector of contentSelectors) {
            const element = $(selector).first();
            if (element.length > 0) {
                element.find('script, style, nav, header, footer, aside, .ad, .advertisement, .social-share, button, form, .comments').remove();
                content = element.text().trim();
                if (content.length > 200) {
                    console.log('Content found with selector:', selector);
                    break;
                }
            }
        }

        if (!content || content.length < 200) {
            console.log('Falling back to paragraphs...');
            const paragraphs = $('p')
                .map((i, el) => $(el).text().trim())
                .get()
                .filter(p => p.length > 30);
            content = paragraphs.join('\n\n');
        }

        console.log('Content length:', content.length);
        console.log('Content snippet:', content.substring(0, 200));

    } catch (error) {
        console.error('Error fetching or parsing:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
        }
    }
}

testParse();
