'use strict';

const express = require('express')
const app = express()
const path = require('path')
const port = 443

var sender = require('./lib/MessageSender');
var schedulerFile = require('./lib/MessageScheduler');
var scheduler = new schedulerFile();

const testToken = "cXojGY947qrZhTXiPxLGBqnalisd5aJxdOHYnjF9"
const testGroupID = "14538582"
const testMessageID = "154710840693462940"

app.use(express.static('views'))

app.get('/', (req, res) => 
{
	res.sendFile(path.join(__dirname + '/views/baseView.html'))
});

app.post('/schedule/', (req, res) =>
{
	res.sendFile(path.join(__dirname + '/views/addView2.html'))
});

app.post('/getInfo/', (req, res) =>
{
	var info = "";
	req.on('data', (chunk) =>
	{
		info += chunk;
	});
	req.on('end', () =>
	{
		const infoJson = JSON.parse(info);
		const messages = scheduler.getMessages(infoJson.token);
		sender.getChats(infoJson.token, function(returnValue) {
			const toSend = {
				chats: returnValue,
				messages: messages
			};
			res.end(JSON.stringify(toSend));
		});
	});
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))