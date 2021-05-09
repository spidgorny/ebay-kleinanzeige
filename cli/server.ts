import {FastifyReply, FastifyRequest} from "fastify";
import moment from "moment";
import {fetchDescription, getList} from "./ebay-api";

const fastify = require('fastify');
const app = fastify({
	logger: true
})

app.get('/api', async (req: FastifyRequest, reply: FastifyReply) => {
	return {
		status: 'ok',
		error: false,
		username: 'asd',
		time: moment().toISOString(),
	};
});

app.get('/api/list', async (req: FastifyRequest, reply: FastifyReply) => {
	try {
		// @ts-ignore
		const page = req.query.page;
		const {searchURL, links} = await getList(page);
		return {
			searchURL,
			links
		};
	} catch (e) {
		console.error(e);
		reply.code(500).send({
			status: e.message
		})
	}
});

app.get('/api/details', async (req: FastifyRequest, reply: FastifyReply) => {
	try {
		// @ts-ignore
		const page = req.query.url;
		const response = await fetchDescription(page);
		return response;
	} catch (e) {
		console.error(e);
		reply.code(500).send({
			status: e.message
		})
	}
});

app.listen(8082).then(() => {
	console.log('Server running at http://localhost:8082/');
});
