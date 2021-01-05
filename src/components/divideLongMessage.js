// Лимит длины сообщения вк/телеграм
const LIMIT = 4096;

/**
 * Разделяет сообщение на несколько, если слишком длинное сообщение
 *
 * input -> String
 * output -> Array of Strings, each max <LIMIT> length
 */
module.exports = function (msg) {
	if (msg.length <= LIMIT) return [msg];
	let input = msg.split('\n');
	let output = [''];
	let i = 0;
	for (let k = 0; k < input.length; k++) {
		if (output[i].length + input[k].length > LIMIT) {
			// Слишком длинная строка, переносим в следующее сообщение
			output[++i] = input[k];
		} else {
			// Длина допустимая, добавляем в этот же элемент
			output[i] += input[k];
			// Добавляем разделитель, если не последнее сообщение
			if (k !== input.length - 1) output[i] += '\n';
		}
	}
	return output;
};