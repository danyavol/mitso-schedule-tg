const axios = require('axios');
const FormData = require('form-data');
const https = require('https');
const httpsAgent =  new https.Agent({
	rejectUnauthorized: false,

});

const cheerio = require('cheerio');

module.exports.getUserBalance = async (pass) => {
	let result;
	let form = new FormData();
	form.append('login', pass);
	form.append('password', pass);
	await axios.post(
		'https://student.mitso.by/login_stud.php',
		form,
		{
			httpsAgent,
			headers: form.getHeaders()
		})
		.then((response) => {
			result = getBalanceFromHtml(response.data, pass);
		})
		.catch((err) => {
			console.log('Error sending balance request to MITSO', err)
			result = getBalanceFromHtml(err, pass, true);
		});
	return result;
}

/** Поиск баланса в html документе */
function getBalanceFromHtml(html, pass, ifError=false) {
	/**
	 * text: текст который нужно вернуть пользователю
	 * data: объект со значениями баланса для сохранения в бд
	 * error: true если не удалось получить баланс
	 * */
	let result = {
		text: '💸 ',
		data: {
			number: pass
		},
		error: false
	};

	// Не удалось отправить запрос
	if (ifError) {
		result.text = 'Не удалось отправить запрос на сайт МИТСО.';
		result.error = true;
		return result;
	}

	try {
		const $ = cheerio.load(html);

		// Проверка правильности ввода лицевого счета
		if ($('#container').length === 0) {
			result.text = 'Не удалось получить данные о балансе.';
			$('p').each(function (i, elem) {
				if ( $( this ).text().match(/Ошибка входа/) ) {
					result.text = 'Ошибка входа. Попробуйте изменить номер лицевого счета.'
				}
			})
			result.error = true;
			return result;
		}

		// Данные получены, обрабатываем их

		let s = $('#what_section b');
		if (s) result.text += norm(s.text()) + '\n\n';
		s = $('#topsection #title');
		if (s) result.text += s.text() + '\n';
		s = $('#topsection .topmenu');
		if (s) result.text += norm(s.text()) + '\n\n';

		s = $('#middle_section .content_text table td:nth-child(2)');
		if (s) {
			for (let i = 0; i < 3; i++) {
				if (!s.eq(i).text()) {
					s.eq(i).text('???');
				} else {
					switch(i) {
						case 0:
							result.data.balance = s.eq(0).text();
							break;
						case 1:
							result.data.dolg = s.eq(1).text();
							break;
						case 2:
							result.data.penia = s.eq(2).text();
							break;
					}
				}
			}
			result.text += `Баланc: ${s.eq(0).text()}\nОсновной долг: ${s.eq(1).text()}\nПеня: ${s.eq(2).text()}`
		}
	} catch (e) {
		console.log(e);
		result.text = 'Не удалось обработать запрос и получить данные о балансе.';
		result.error = true;
	}
	return result;

	// Нормализация кривых строк с непонятными пробелами
	function norm(str) {
		return str.replace(/\n/g, ' ').replace(/\t/g, '').trim();
	}
}