import cheerio from "cheerio";
import Root = cheerio.Root;
import moment from "moment";
import {fetchDescription, getList, shorturl} from "./ebay-api";

let range = (n: number) => [...Array(n).keys()]

async function showResultFromList(results: any[], $: Root) {
	const since = moment('2021-05-07')
	for (let href of results) {
		// console.log(post);
		// console.log(post.html());
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
