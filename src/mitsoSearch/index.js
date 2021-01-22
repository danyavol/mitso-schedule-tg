/** Поиск по сайту МИТСО */

const axios = require('axios');
const https = require('https');
const httpsAgent = new https.Agent( {rejectUnauthorized: false} );

const cheerio = require('cheerio');

module.exports = async (searchText) => {
	let url = 'https://mitso.by/search?search=' + encodeURI(searchText);
	return await axios.get(url, {httpsAgent})
		.then(response => {
			// Поиск первых пяти ссылок
			let links = [];
			const $ = cheerio.load(response.data);
			$('.rp-news-gl > div > div').each((i, elem) => {
				if (links.length < 5)
					links.push({
						title: $(elem).find('a').text(),
						url: 'https://mitso.by' + $(elem).find('a').attr('href')
					});
			});
			return links;
		})
		.catch(reason => {
			console.log(reason);
		});
};