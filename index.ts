import axios from "axios";
import memoizeFs from "memoize-fs";
import cheerio from "cheerio";
import Cheerio = cheerio.Cheerio;
import Root = cheerio.Root;

const memoizer = memoizeFs({ cachePath: '.cache' })

const searchURL = 'https://www.ebay-kleinanzeigen.de/s-fahrraeder/damen/60435/sortierung:entfernung/anbieter:privat/anzeige:angebote/preis:600:1000/c217l4328r100+fahrraeder.art_s:damen+fahrraeder.type_s:ebike';

async function getList() {
	const fetchMem = await memoizer.fn(() => axios.get(searchURL));
	const html = await fetchMem();
	const $: Root = cheerio.load(html.data);
	const li = $('ul#srchrslt-adtable li');
	const results: any[] = li.toArray();
	return {$, results};
}

async function fetchDescription(href: string) {
	const detailURL = new URL(href, searchURL).toString();
	// console.log({detailURL});
	const fetchMem = await memoizer.fn((detailURL) => axios.get(detailURL));
	const html = await fetchMem(detailURL);
	const $: Root = cheerio.load(html.data);
	const title = $('h1#viewad-title').text().trim();
	const price = $('h2.boxedarticle--price').text().trim();
	const locality = $('span#viewad-locality').text().trim();
	let sDescription = $('p#viewad-description-text').html()?.replaceAll('<br>', "\n").split("\n").filter(x => x.trim()).map(x => x.trim()).join("\n");
	const isBosch = sDescription?.includes('Bosch');
	const words = sDescription?.split(' ');
	const years = words?.filter(x => x.length === 4 && x.startsWith('20')) ?? [];
	const description = sDescription?.split("\n");
	return {$, title, detailURL, price, locality, description: description, isBosch, years};
}

async function main() {
	const {$, results} = await getList();
	console.log(results.length);
	for (let post of results) {
		// console.log(post);
		// console.log(post.html());
		let detailLink: Cheerio = $(post).find('a.ellipsis');
		console.log('==', detailLink.text());
		let href = detailLink.attr('href');
		// console.log({href});
		if (!href) {
			continue;
		}
		const {$: $item, ...item} = await fetchDescription(href);
		const {isBosch, years} = item;
		if (isBosch || years.length) {
			console.log(item);
		} else {
			console.log({price: item.price, years: item.years});
		}
	}
}

main();
