/** Создает ссылки на расписание группы
 *
 * input ->  'https://mitso.by/schedule/Dnevnaya/ME`OiM/3 kurs/1820 ISiT'
 *
 * output -> [
 * 	'https://mitso.by/schedule/Dnevnaya/ME`OiM/3 kurs/1820 ISiT/0',
 *  'https://mitso.by/schedule/Dnevnaya/ME`OiM/3 kurs/1820 ISiT/1'
 * ]
 */
const axios = require('axios');
const https = require('https');
const httpsAgent = new https.Agent( {rejectUnauthorized: false} );

const cheerio = require('cheerio');

module.exports = async (groupUrl) => {
	let group = groupUrl.split('/');
	let links = [];
	await axios
		.get(`https://mitso.by/schedule_update?type=date&kaf=Glavnaya%20kafedra&fak=${group[group.length-3]}&form=${group[group.length-4]}&kurse=${group[group.length-2]}&group_class=${group[group.length-1]}`,
			{httpsAgent})
		.then(response => {
			const $ = cheerio.load(response.data);

			$('option').each((i, elem) => {
				links.push(groupUrl + '/' + $(elem).val());
			});
		})
		.catch(reason => console.log(reason));
	return links;
};