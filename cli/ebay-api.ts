import axios from "axios";
import cheerio from "cheerio";
import memoizeFs from "memoize-fs";

const shortUrl = require('node-url-shortener');
import Cheerio = cheerio.Cheerio;
import Root = cheerio.Root;

export const DEVELOPMENT = process.env.NODE_ENV === 'development';

let fetchHTML = async (searchURL) => {
	console.log('fetching', {searchURL});
	return (await axios.get(searchURL)).data;
};
const makeFetchMem = async () => {
	let memoOptions = {cachePath: '.cache'};
	const memoizer = memoizeFs(memoOptions);
	return await memoizer.fn(fetchHTML);
}

export async function getList(page: number) {
	const fetchMem = DEVELOPMENT ? await makeFetchMem() : fetchHTML;
	const seite = page > 1 ? `seite:${page}/` : '';
	let searchURL =
		`https://www.ebay-kleinanzeigen.de/s-fahrraeder/damen/60435/sortierung:entfernung/anbieter:privat/anzeige:angebote/preis:600:1000/${seite}c217l4328r100+fahrraeder.art_s:damen+fahrraeder.type_s:ebike`;
	// @ts-ignore
	// const cacheFile = memoizer.getCacheFilePath(fetchHTML, [searchURL], {...memoOptions, cacheId: './'});
	// console.log({page, cacheFile});
	const html = await fetchMem(searchURL);
	const {links} = await parseList(html);
	return {
		DEVELOPMENT,
		searchURL,
		links,
	};
}

// copy from above
export async function getNew(page: number) {
	const fetchMem = DEVELOPMENT ? await makeFetchMem() : fetchHTML;
	let searchURL =
		`https://www.ebay-kleinanzeigen.de/s-fahrraeder/damen/60435/anbieter:privat/anzeige:angebote/preis:600:1000/c217l4328r100+fahrraeder.art_s:damen+fahrraeder.type_s:ebike`;
	// @ts-ignore
	const html = await fetchMem(searchURL);
	const {links} = await parseList(html);
	return {
		DEVELOPMENT,
		searchURL,
		links,
	};
}

async function parseList(html: string) {
	const $: Root = cheerio.load(html);
	const li = $('ul#srchrslt-adtable li');
	const results: any[] = li.toArray();
	const links = results.map(post => {
		let detailLink: Cheerio = $(post).find('a.ellipsis');
		//console.log('==', detailLink.text());
		let href = detailLink.attr('href');
		// console.log({href});
		return href;
	}).filter(x => x);
	return {$, results, links};
}

export async function fetchDescription(href: string) {
	const homepage = 'https://www.ebay-kleinanzeigen.de/';
	const detailURL = new URL(href, homepage).toString();
	// console.log({detailURL});
	const fetchMem = DEVELOPMENT ? await makeFetchMem() : fetchHTML;
	const html = await fetchMem(detailURL);
	const $: Root = cheerio.load(html);
	const title = $('h1#viewad-title').text().trim();
	const price = $('h2.boxedarticle--price').text().trim();
	const locality = $('span#viewad-locality').text().trim();
	let sDescription = $('p#viewad-description-text').html()?.replaceAll('<br>', "\n").split("\n").filter(x => x.trim()).map(x => x.trim()).join("\n");
	const words = sDescription?.split(' ');
	const years = words?.filter(x => x.length === 4 && x.startsWith('201')) ?? [];
	const description = sDescription?.split("\n");
	const since = $('div#viewad-extra-info div:nth-child(1) span').text();
	const image = $('div.galleryimage-element img#viewad-image').attr('src');
	return {$, title, detailURL, price, locality, description, sDescription, years, since, image};
}

export async function shorturl(url: string) {
	return new Promise((resolve, reject) => {
		shortUrl.short(url, function (err: any, url: string) {
			if (err) {
				return reject(err);
			}
			resolve(url);
		});
	});
}
