import {getList, getNew} from "../../../cli/ebay-api";
import {Handler} from "@netlify/functions";

import moment from "moment";

const handler: Handler = async (event, context) => {
	const start = moment();
	// @ts-ignore
	const page = event.queryStringParameters.page
		// @ts-ignore
		? parseInt(event.queryStringParameters.page) : 1;
	const {searchURL, links} = await getNew(page);
	return {
		statusCode: 200, body: JSON.stringify({
			searchURL,
			links,
			duration: moment().diff(start) / 1000,
		}),
	};
}

export {handler};

