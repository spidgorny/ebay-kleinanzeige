import axios from "axios";
import memoizeFs from "memoize-fs";
import cheerio from "cheerio";
import Cheerio = cheerio.Cheerio;
import Root = cheerio.Root;
import moment from "moment";
const shortUrl = require('node-url-shortener');

const memoizer = memoizeFs({cachePath: '.cache'})
let range = (n: number) => [...Array(n).keys()]

async function getList(page: number) {
	const fetchMem = await memoizer.fn((searchURL) => axios.get(searchURL));

	const seite = page > 1 ? `seite:${page}/` : '';
	let searchURL =
		`https://www.ebay-kleinanzeigen.de/s-fahrraeder/damen/60435/sortierung:entfernung/anbieter:privat/anzeige:angebote/preis:600:1000/${seite}c217l4328r100+fahrraeder.art_s:damen+fahrraeder.type_s:ebike`;

	const html = await fetchMem(searchURL);
	const $: Root = cheerio.load(html.data);
	const li = $('ul#srchrslt-adtable li');
	const results: any[] = li.toArray();
	return {$, results};
}

async function fetchDescription(href: string) {
	const homepage = 'https://www.ebay-kleinanzeigen.de/';
	const detailURL = new URL(href, homepage).toString();
	// console.log({detailURL});
	const fetchMem = await memoizer.fn((detailURL) => axios.get(detailURL));
	const html = await fetchMem(detailURL);
	const $: Root = cheerio.load(html.data);
	const title = $('h1#viewad-title').text().trim();
	const price = $('h2.boxedarticle--price').text().trim();
	const locality = $('span#viewad-locality').text().trim();
	let sDescription = $('p#viewad-description-text').html()?.replaceAll('<br>', "\n").split("\n").filter(x => x.trim()).map(x => x.trim()).join("\n");
	const words = sDescription?.split(' ');
	const years = words?.filter(x => x.length === 4 && x.startsWith('201')) ?? [];
	const description = sDescription?.split("\n");
	const since = $('div#viewad-extra-info div:nth-child(1) span').text();
	return {$, title, detailURL, price, locality, description, sDescription, years, since};
}

async function shorturl(url: string) {
	return new Promise((resolve, reject) => {
		shortUrl.short(url, function(err: any, url: string) {
			if (err) {
				return reject(err);
			}
			resolve(url);
		});
	});
}

async function showResultFromList(results: any[], $: Root) {
	const since = moment('2021-05-07')
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
		const {$: $item, years, ...item} = await fetchDescription(href);
		const isBosch = item.sDescription?.includes('Bosch') || item.title.includes('Bosch');
		const date = moment(item.since, 'DD.MM.YYYY');
		const url = await shorturl(item.detailURL);
		if ((isBosch || years.length) && date.isAfter(since)) {
			console.log({
				title: item.title,
				url,
				price: item.price,
				locality: item.locality,
				since: item.since,
				isBosch,
				years,
				description: item.description
			});
		} else {
			console.log({price: item.price, years});
		}
	}
}

async function main() {
	for (let page of range(5)) {
		const {$, results} = await getList(page + 1);
		await showResultFromList(results, $);
	}
}

main();
