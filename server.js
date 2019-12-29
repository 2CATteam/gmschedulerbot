'use strict';

const express = require('express')
const app = express()
const path = require('path')
const https = require('https')
const cookieParser = require('cookie-parser')
const url = require('url')
const port = 3000
var favicon = require('serve-favicon');

var sender = require('./lib/MessageSender');
var schedulerFile = require('./lib/MessageScheduler');
var scheduler = new schedulerFile();

app.use(cookieParser());
app.use(express.static(__dirname + '/views'));
app.use(favicon(__dirname + '/views/favicon.ico'));

//Normal website just gives normal screen
app.get('/', (req, res) =>
{
	res.sendFile(path.join(__dirname + '/views/baseView.html'))
});

//Authentication just adds a cooke and then redirects
app.get('/authenticate/?', (req, res) =>
{
	res.cookie('token', req.query.access_token);
	res.redirect("/");
});

//Debug view, just to figure stuff out
app.get('/debugPrint/', (req, res) =>
{
	res.sendFile(path.join(__dirname + '/views/debugView.html'))
});

//FAQ view
app.get('/faq/', (req, res) =>
{
	res.sendFile(path.join(__dirname + '/views/faqView.html'))
});

app.get('/anon/', (req, res) => 
{
	res.sendFile(path.join(__dirname + '/views/anonSendView.html'))
});

//Gets the chats from GroupMe
app.post('/getInfo/', (req, res) =>
{
	var info = "";
	req.on('data', (chunk) =>
	{
		info += chunk;
	});
	req.on('end', () =>
	{
		//Parses info
		const infoJson = JSON.parse(info);
		//Gets messages
		const messages = scheduler.getMessages(infoJson.token);
		//Gets chats
		sender.getChats(infoJson.token, function(returnValue) {
			//Returns info
			sender.getDMs(infoJson.token, function(returnValue2) {
                                returnValue["DMs"] = returnValue2["DMs"]
                                const toSend = {
                                        info: returnValue,
                                        messages: messages
                                };
                                console.log(toSend);
                                res.end(JSON.stringify(toSend));
                        });
		});
	});
});

//Adds messages to be sent to the list
app.post('/submitMessage/', (req, res) =>
{
	var info = "";
	req.on('data', (chunk) =>
	{
		info += chunk;
	});
	req.on('end', () =>
	{
		const infoJson = JSON.parse(info);
		var date = new Date(infoJson.time);
		scheduler.scheduleMessage(infoJson.token, infoJson.chat, date, infoJson.toSend, infoJson.messageType);
		const messages = scheduler.getMessages(infoJson.token);
		sender.getChats(infoJson.token, function(returnValue) {
			sender.getDMs(infoJson.token, function(returnValue2) {
				returnValue["DMs"] = returnValue2["DMs"]
				const toSend = {
					info: returnValue,
					messages: messages
				};
				console.log(toSend);
				res.end(JSON.stringify(toSend));
			});
		});
	});
});

//Removes message from being sent
app.post('/deleteMessage/', (req, res) =>
{
	var info = "";
	req.on('data', (chunk) =>
	{
		info += chunk;
	});
	req.on('end', () =>
	{
		const infoJson = JSON.parse(info);
		var date = new Date(infoJson.time);
		scheduler.unscheduleMessage(infoJson.token, infoJson.chat, date, infoJson.toSend);
		const messages = scheduler.getMessages(infoJson.token);
		sender.getChats(infoJson.token, function(returnValue) {
			sender.getDMs(infoJson.token, function(returnValue2) {
                                returnValue["DMs"] = returnValue2["DMs"]
                                const toSend = {
                                        info: returnValue,
                                        messages: messages
                                };
                                console.log(toSend);
                                res.end(JSON.stringify(toSend));
                        });
		});
	});
});

//Restores backup on start
scheduler.restoreBackup();

const server = app.listen(port, () => console.log(`Schmessage listening on port ${port}!`))
