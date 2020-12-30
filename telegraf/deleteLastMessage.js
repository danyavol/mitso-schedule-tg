/** Удаляет последнее сообщение, для поддержания чата чистым */
module.exports = function (ctx, messageId) {
	if (ctx.session.lastMessageId) ctx.deleteMessage(ctx.session.lastMessageId);

	if (messageId) ctx.session.lastMessageId = messageId;
	else delete ctx.session.lastMessageId;
}