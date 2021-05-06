const axios = require('axios');
const https = require('https');
const httpsAgent = new https.Agent( {rejectUnauthorized: false} );

const cheerio = require('cheerio');

const { saveGroups } = require('../../database/groupsCollection');
const { isWrongFakulty, isWrongCourse } = require('../../components/FUCKING_MITSO');

let requestCounter = 0;

module.exports = async function createLinks(weekNumber) {

	const
		promiseArray = [],
		state = [
		{name: "Magistratura"},
		{name: "ME`OiM"},
		{name: "YUridicheskij"}
	];




	// Запрос форм обучения (дневная, заочная)
	promiseArray.length = 0;
	state.map(fakultet => {
		let req = sendLinkRequest(fakultet, 'form', fakultet.name);
		promiseArray.push(req);
	});
	await Promise.all(promiseArray);

	// Запрос курсов (1 курс, 2 курс)
	promiseArray.length = 0;
	state.map(fakultet => {
		fakultet.inner.map(forma => {
			let req = sendLinkRequest(forma, 'kurse', fakultet.name, forma.name);
			promiseArray.push(req);
		});
	});
	await Promise.all(promiseArray);

	// Запрос групп (1820, 1821)
	promiseArray.length = 0;
	state.map(fakultet => {
		fakultet.inner.map(forma => {
			forma.inner.map(kurse => {
				let req = sendLinkRequest(kurse, 'group_class', fakultet.name, forma.name, kurse.name);
				promiseArray.push(req);
			});
		});
	});
	await Promise.all(promiseArray);

	// Запрос недель (1 неделя, 2неделя)
	promiseArray.length = 0;
	state.map(fakultet => {
		fakultet.inner.map(forma => {
			forma.inner.map(kurse => {
				kurse.inner.map(group => {
					let req = sendLinkRequest(group, 'date', fakultet.name, forma.name, kurse.name, group.name);
					promiseArray.push(req);
				});
			});
		});
	});
	await Promise.all(promiseArray);
	//console.log('Итого запросов было отправлено - ', requestCounter);

	// Итоговое составление ссылок
	let groupsList = []; // список всех групп университета, которые есть в расписании
	let outputLinks = {}; // ссылки по которым нужно отправлять запрос на получение расписания

	state.map(fakultet => {
		fakultet.inner.map(forma => {
			forma.inner.map(kurse => {
				kurse.inner.map(group => {

					if (isWrongFakulty(fakultet.name, group.title)) return;
					if (isWrongCourse(kurse.name, group.title)) return;

					group.inner.map(week => {
						if (weekNumber == null || weekNumber == week.name) {
							if ( !Array.isArray(outputLinks[week.name]) ) outputLinks[week.name] = [];
							let link = `https://mitso.by/schedule/${forma.name}/${fakultet.name}/${kurse.name}/${group.name}/${week.name}`;
							outputLinks[week.name].push(link);
						}
					});
					groupsList.push({
						name: group.title,
						url: `https://mitso.by/schedule/${forma.name}/${fakultet.name}/${kurse.name}/${group.name}`
					});
				});
			});
		});
	});

	// Сохранение списка групп в БД
	await saveGroups(groupsList);

	return outputLinks;
}

// Отправка запросов для составления ссылок на получение расписания
function sendLinkRequest(link, type='', fak='', form='', kurse='', group='') {
	requestCounter++;
	return new Promise(resolve => {
		axios
		.get(`https://mitso.by/schedule_update?type=${type}&kaf=Glavnaya%20kafedra&fak=${fak}&form=${form}&kurse=${kurse}&group_class=${group}`,
		{httpsAgent})
		.then((response) => {
			const $ = cheerio.load(response.data);

			link.inner = [];
			$('option').each((i, elem) => {
				link.inner.push({name: $(elem).val(), title: $(elem).text()})
			});

			resolve();
		})
		.catch((reason) => {
			console.warn('src/autoExecuting/saveAllSchedule/createLinks.js\n', 'Ошибка запроса к МИТСО. Составление ссылок на получение расписания');
			resolve();
		});
	});
}