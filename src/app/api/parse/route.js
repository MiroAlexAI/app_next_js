import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function POST(request) {
    try {
        let { url } = await request.json();

        if (!url) {
            return NextResponse.json(
                { error: 'URL is required' },
                { status: 400 }
            );
        }

        url = url.trim();

        // Fetch the HTML content
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            },
            timeout: 15000 // Increased timeout for slower industrial servers
        });

        const html = response.data;
        const $ = cheerio.load(html);

        // Extract title
        let title = $('h1').first().text().trim() ||
            $('title').text().trim() ||
            $('meta[property="og:title"]').attr('content') ||
            'Заголовок не найден';

        // Extract date
        let date = $('time').attr('datetime') ||
            $('meta[property="article:published_time"]').attr('content') ||
            $('meta[name="date"]').attr('content') ||
            $('.date').first().text().trim() ||
            $('.published').first().text().trim() ||
            $('.node-news .submitted').first().text().trim() || // For older Drupal
            'Дата не найдена';

        // Extract main content - try multiple selectors
        let content = '';

        const contentSelectors = [
            '.node-content', // Drupal / Avtprom
            '.node-full .content', // Drupal
            'article',
            '.entry-inner', // WordPress / Elementor
            '.ast-article-single', // Astra Theme
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
                // Remove unwanted elements
                element.find('script, style, nav, header, footer, aside, .ad, .advertisement, .social-share, button, form, .comments, .related-posts').remove();

                content = element.text().trim();

                if (content.length > 300) { // Increased threshold for quality
                    break;
                }
            }
        }

        // Fallback: get all meaningful paragraphs
        if (!content || content.length < 300) {
            const paragraphs = $('p')
                .map((i, el) => $(el).text().trim())
                .get()
                .filter(p => p.length > 25); // Slightly lowered for better coverage
            content = paragraphs.join('\n\n');
        }

        // Clean up content
        content = content
            .replace(/\t/g, ' ')
            .replace(/[ ]+/g, ' ')
            .replace(/\n\s*\n/g, '\n\n')
            .trim();

        // Limit content length for display
        if (content.length > 8000) { // Increased limit for detailed analysis
            content = content.substring(0, 8000) + '...';
        }

        return NextResponse.json({
            date,
            title,
            content: content || 'Контент не найден'
        });

    } catch (error) {
        console.error('Parse error:', error);

        return NextResponse.json(
            {
                error: 'Ошибка при парсинге статьи',
                details: error.message
            },
            { status: 500 }
        );
    }
}
