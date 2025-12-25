import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'global';

    const globalConfigs = [
        {
            name: 'Russia',
            sources: [
                { url: 'https://www.rt.com/rss/news/', type: 'rss' },
                { url: 'https://tass.com/rss/v2.xml', type: 'rss' }
            ]
        },
        {
            name: 'Europe',
            sources: [
                { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', type: 'rss' },
                { url: 'https://www.euronews.com/rss?level=vertical&name=news', type: 'rss' }
            ]
        },
        {
            name: 'The East',
            sources: [
                { url: 'https://www.aljazeera.com/xml/rss/all.xml', type: 'rss' },
                { url: 'https://www.tehrantimes.com/rss', type: 'rss' }
            ]
        },
        {
            name: 'USA',
            sources: [
                { url: 'https://feeds.npr.org/1001/rss.xml', type: 'rss' },
                { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', type: 'rss' }
            ]
        }
    ];

    const industryConfigs = [
        {
            name: 'Нефть и Газ (RU)',
            sources: [{ url: 'https://angi.ru/', type: 'scrape', selector: 'a[href^="/news/"]', baseUrl: 'https://angi.ru' }]
        },
        {
            name: 'Технологии (WW)',
            sources: [{ url: 'https://techcrunch.com/feed/', type: 'rss' }]
        },
        {
            name: 'Логистика',
            sources: [{ url: 'https://gcaptain.com/feed/', type: 'rss' }]
        },
        {
            name: 'Металлы / Mining',
            sources: [{ url: 'https://www.mining.com/feed/', type: 'rss' }]
        },
        {
            name: 'Агропром (RU)',
            sources: [{ url: 'https://www.agroxxi.ru/news/rss.xml', type: 'rss' }]
        },
        {
            name: 'Энергетика (WW)',
            sources: [{ url: 'https://www.worldoil.com/rss', type: 'rss' }]
        }
    ];

    const financeConfigs = [
        { name: 'Financial Times', sources: [{ url: 'https://www.ft.com/?format=rss', type: 'rss' }] },
        { name: 'Bloomberg', sources: [{ url: 'https://www.bloomberg.com/feeds/bview/rss', type: 'rss' }] },
        { name: 'Nikkei Asia', sources: [{ url: 'https://asia.nikkei.com/rss/feed/nar', type: 'rss' }] },
        { name: 'SCMP Business', sources: [{ url: 'https://www.scmp.com/rss/91/feed.xml', type: 'rss' }] },
        { name: 'Gulf Business', sources: [{ url: 'https://gulfbusiness.com/feed/', type: 'rss' }] },
        { name: 'CNBC Markets', sources: [{ url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', type: 'rss' }] },
        { name: 'MarketWatch', sources: [{ url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', type: 'rss' }] },
        { name: 'Fortune', sources: [{ url: 'https://fortune.com/feed/', type: 'rss' }] },
        { name: 'Forbes', sources: [{ url: 'https://www.forbes.com/business/feed/', type: 'rss' }] }
    ];

    const reliabilityConfigs = [
        { name: 'ECA GMP Academy', sources: [{ url: 'https://www.gmp-compliance.org/gmp-news/rss', type: 'rss' }] },
        { name: 'Pharma Manufacturing (GMP)', sources: [{ url: 'https://www.pharmamanufacturing.com/rss', type: 'rss' }] },
        { name: 'Maintworld (EU)', sources: [{ url: 'https://www.maintworld.com/feed', type: 'rss' }] },
        { name: 'Uptime Magazine', sources: [{ url: 'https://www.uptimemagazine.com/feed/', type: 'rss' }] },
        { name: 'FacilitiesNet', sources: [{ url: 'https://www.facilitiesnet.com/rss/all/RSS2.xml', type: 'rss' }] },
        { name: '1С:ТОИР (RU)', sources: [{ url: 'https://1ctoir.ru/news/', type: 'scrape', selector: '.news-item__title a', baseUrl: 'https://1ctoir.ru' }] },
        { name: 'Управление производством (RU)', sources: [{ url: 'https://up-pro.ru/feed/', type: 'rss' }] },
        { name: 'Prostoev.net (RU)', sources: [{ url: 'https://prostoev.net/feed/', type: 'rss' }] },
        { name: 'Asian Power (Asia)', sources: [{ url: 'https://asian-power.com/rss', type: 'rss' }] },
        { name: 'Reliable Plant (WW)', sources: [{ url: 'https://www.reliableplant.com/rss', type: 'rss' }] },
        { name: 'MRO Magazine (CA)', sources: [{ url: 'https://www.mromagazine.com/feed/', type: 'rss' }] },
        { name: 'ReliabilityWeb', sources: [{ url: 'https://reliabilityweb.com/rss', type: 'rss' }] },
        { name: 'Maintenance World', sources: [{ url: 'https://www.maintenanceworld.com/feed/', type: 'rss' }] },
        { name: 'Engineering.com', sources: [{ url: 'https://www.engineering.com/Rss.aspx', type: 'rss' }] },
        { name: 'Accendo Reliability', sources: [{ url: 'https://accendoreliability.com/feed/', type: 'rss' }] },
        { name: 'Plant Engineering', sources: [{ url: 'https://www.plantengineering.com/feed/', type: 'rss' }] },
        { name: 'Efficient Plant', sources: [{ url: 'https://www.efficientplantmag.com/feed/', type: 'rss' }] },
        { name: 'Reliability Connect', sources: [{ url: 'https://reliabilityconnect.com/feed/', type: 'rss' }] },
        { name: 'BIC Magazine', sources: [{ url: 'https://www.bicmagazine.com/feed/', type: 'rss' }] },
        { name: 'Processing Magazine', sources: [{ url: 'https://www.processingmagazine.com/maintenance-safety/feed/', type: 'rss' }] }
    ];

    let regionConfigs;
    if (category === 'industry') {
        regionConfigs = industryConfigs;
    } else if (category === 'finance') {
        regionConfigs = financeConfigs;
    } else if (category === 'reliability') {
        regionConfigs = reliabilityConfigs;
    } else {
        regionConfigs = globalConfigs;
    }

    try {
        const allHeadlines = [];

        const regionPromises = regionConfigs.map(async (region) => {
            const regionHeadlines = [];
            const limitPerSource = (category === 'finance' || category === 'reliability') ? 1 : 2;

            for (const source of region.sources) {
                if (regionHeadlines.length >= limitPerSource) break;

                try {
                    const response = await axios.get(source.url, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                        },
                        timeout: 10000
                    });

                    const data = response.data;
                    const $ = cheerio.load(data, { xmlMode: true });

                    if (source.type === 'rss' || data.includes('<rss') || data.includes('<feed')) {
                        const items = $('item').length > 0 ? $('item') : $('entry');
                        items.each((i, el) => {
                            if (regionHeadlines.length < ((category === 'finance' || category === 'reliability') ? 1 : 2)) {
                                let title = $(el).find('title').text() || '';
                                // Улучшенный поиск ссылки для разных форматов RSS/Atom
                                let link = $(el).find('link').text() || $(el).find('link').attr('href') || $(el).find('guid').text() || '';

                                // Очистка от CDATA
                                title = title.replace(/<!\[CDATA\[|\]\]>/g, '').trim();
                                link = link.replace(/<!\[CDATA\[|\]\]>/g, '').trim();

                                if (title && link && title.length > 20) {
                                    if (!regionHeadlines.find(h => h.title === title)) {
                                        regionHeadlines.push({ title, link, source: region.name });
                                    }
                                }
                            }
                        });
                    } else {
                        // Manual scraping
                        $(source.selector).each((i, el) => {
                            if (regionHeadlines.length < ((category === 'finance' || category === 'reliability') ? 1 : 2)) {
                                let title = $(el).text().trim();
                                let link = $(el).attr('href') || $(el).closest('a').attr('href') || '';

                                if (link && !link.startsWith('http')) {
                                    link = source.baseUrl + link;
                                }

                                if (title && link && title.length > 25 && !regionHeadlines.find(h => h.title === title)) {
                                    regionHeadlines.push({ title, link, source: region.name });
                                }
                            }
                        });
                    }
                } catch (err) {
                    // console.error(`Error:`, err.message);
                }
            }
            return regionHeadlines;
        });

        const results = await Promise.all(regionPromises);
        results.forEach(rh => allHeadlines.push(...rh));

        return NextResponse.json(allHeadlines);
    } catch (error) {
        return NextResponse.json([]);
    }
}
