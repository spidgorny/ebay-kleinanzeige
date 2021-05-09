import {FastifyReply, FastifyRequest} from "fastify";
import moment from "moment";
import {fetchDescription, getList, getNew} from "./ebay-api";

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
	const start = moment();
	try {
		// @ts-ignore
		const page = req.query.page;
		const {searchURL, links} = await getList(page);
		return {
			searchURL,
			links,
			duration: moment().diff(start)/1000,
		};
	} catch (e) {
		console.error(e);
		reply.code(500).send({
			status: e.message
		})
	}
});

app.get('/api/new', async (req: FastifyRequest, reply: FastifyReply) => {
	const start = moment();
	try {
		// @ts-ignore
		const page = req.query.page;
		const {searchURL, links} = await getNew(page);
		return {
			searchURL,
			links,
			duration: moment().diff(start)/1000,
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
