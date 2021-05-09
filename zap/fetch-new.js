async function fetchJSON(searchURL) {
	console.log('fetching', {searchURL});
	return await (await fetch(searchURL)).json();
}

async function zap(inptuData) {
	const url = 'https://compassionate-snyder-995b29.netlify.app/.netlify/functions/new';
	const {links} = await fetchJSON(url);
	return {links};
}

output = await zap(inputData);
