'use strict';

const express = require('express')
const app = express()
const path = require('path')
const https = require('https')
const cookieParser = require('cookie-parser')
const url = require('url')
const port = 3000
var favicon = require('serve-favicon');
const fileupload = require('express-fileupload')

var sender = require('./lib/MessageSender');
var schedulerFile = require('./lib/MessageScheduler');
var scheduler = new schedulerFile();

var hits = 0;

app.use(cookieParser());
app.use(express.static(__dirname + '/views'));
app.use(favicon(__dirname + '/views/favicon.ico'));
app.use(fileupload());

//Normal website just gives normal screen
app.get('/', (req, res) =>
{
	res.sendFile(path.join(__dirname + '/views/baseView.html'))
});

//Fallback website just gives fallback screen
app.get('/fallback', (req, res) =>
{
	res.sendFile(path.join(__dirname + '/views/fallbackView.html'))
});

//Authentication just adds a cookie and then redirects
app.get('/authenticate/?', (req, res) =>
{
	res.cookie('token', req.query.access_token);
	res.redirect("/");
});

//Summary website just gives summary screen
app.get('/summary/?', (req, res) =>
{
	res.sendFile(path.join(__dirname + '/views/summaryView.html'))
});

//Summary website just gives summary screen
app.get('/vibecheck/?', (req, res) =>
{
	res.sendFile(path.join(__dirname + '/views/vibeView.html'))
});

app.get('/list/?', (req, res) => {
	res.sendFile(path.join(__dirname + '/views/tools.html'))
});

//Authentication just adds a cookie and then redirects
app.get('/summary/authenticate/?', (req, res) =>
{
	res.cookie('token', req.query.access_token, {maxAge: 604800000});
	res.redirect("/summary/");
});

//Authentication just adds a cookie and then redirects
app.get('/vibecheck/authenticate/?', (req, res) =>
{
	res.cookie('token', req.query.access_token, {maxAge: 604800000});
	res.redirect("/vibecheck/");
});

//FAQ view
app.get('/faq/', (req, res) =>
{
	res.sendFile(path.join(__dirname + '/views/faqView.html'))
});

//loss view
app.get('/loss/', (req, res) =>
{
	res.sendFile(path.join(__dirname + '/views/lossView.html'))
});

//A bunch of individual anonymous bot hosting
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
				sender.getId(infoJson.token, function(id, name) {
					returnValue["DMs"] = returnValue2["DMs"]
					const toSend = {
						info: returnValue,
						messages: messages,
						userId: id,
						name: name
					};
					res.end(JSON.stringify(toSend));
				})
			});
		});
	});
});

//Adds messages to be sent to the list
app.post('/submitMessage/', (req, res) =>
{
	hits++;
	console.log(hits)
	var info = "";
	req.on('data', (chunk) => {
		info += chunk;
	});
	req.on('end', () => {
		const infoJson = JSON.parse(info);
		console.log(infoJson)
		var date = new Date(infoJson.time);
		scheduler.scheduleMessage(infoJson.token, infoJson.chat, date, infoJson.toSend, infoJson.image, infoJson.messageType, infoJson.file);
		const messages = scheduler.getMessages(infoJson.token);
		sender.getChats(infoJson.token, function(returnValue) {
			sender.getDMs(infoJson.token, function(returnValue2) {
				returnValue["DMs"] = returnValue2["DMs"]
				const toSend = {
					info: returnValue,
					messages: messages
				};
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
		scheduler.unscheduleMessage(infoJson.token, infoJson.chat, date, infoJson.toSend, infoJson.file);
		const messages = scheduler.getMessages(infoJson.token);
		sender.getChats(infoJson.token, function(returnValue) {
			sender.getDMs(infoJson.token, function(returnValue2) {
				returnValue["DMs"] = returnValue2["DMs"]
				const toSend = {
					info: returnValue,
					messages: messages
				};
				res.end(JSON.stringify(toSend));
			});
		});
	});
});

app.post('/uploadImage/?', (req, res) => {
	const fileName = Date.now().toString() + ".jpeg"
	const path = __dirname + '/images/' + fileName
	req.files.image.mv(path, (error) => {
		if (error) {
			console.error(error)
			res.writeHead(500, { 'Content-Type': 'application/json' })
			res.end(JSON.stringify({ status: 'error', message: error }))
			return
		}
		sender.uploadImage(path, req.cookies.token, (url, err) => {
			if (err) {
				res.writeHead(400, {'Content-Type': 'application.json' })
				res.end(JSON.stringify({ status: 'error', message: err}))
			}
			res.writeHead(200, { 'Content-Type': 'application/json' })
			res.end(JSON.stringify({ status: 'success', path: url }))
		})
	})
})

process.on('SIGINT', () => {
	console.log('Stopping gracefully');
	scheduler.closeDB((err) => {
		console.log('Closed db gracefully')
		process.exit(err ? 1 : 0);
	});
})

//Restores backup on start
scheduler.restoreBackup();

const server = app.listen(port, () => console.log(`Schmessage listening on port ${port}!`))
