import {FastifyReply, FastifyRequest} from "fastify";
import moment from "moment";

const fastify = require('fastify');
const app = fastify({
	logger: true
})

app.get('/api/list', async (req: FastifyRequest, reply: FastifyReply) => {
	return {
		status: 'ok',
		error: false,
		username: 'asd',
		time: moment().toISOString(),
	};
});

app.listen(8082).then(() => {
	console.log('Server running at http://localhost:8082/');
});
