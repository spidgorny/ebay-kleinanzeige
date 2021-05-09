const moment = require('moment');

function handler() {
	let time = moment().toISOString();
	console.log(time);
	return { statusCode: 200, body: time };
}

module.exports = { handler }
