import {getList} from "../../../cli/ebay-api";
import {Handler} from "@netlify/functions";

import moment from "moment";

const handler: Handler = async (event, context) => {
	const start = moment();
	// @ts-ignore
	const page = event.queryStringParameters.page
		// @ts-ignore
		? parseInt(event.queryStringParameters.page) : 1;
	const {DEVELOPMENT, searchURL, links} = await getList(page);
	return {
		statusCode: 200, body: JSON.stringify({
			DEVELOPMENT,
			searchURL,
			links,
			duration: moment().diff(start) / 1000,
		}),
	};
}

export {handler};

