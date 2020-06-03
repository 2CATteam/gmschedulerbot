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
	hits++;
	console.log(hits)
	res.sendFile(path.join(__dirname + '/views/baseView.html'))
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

app.get('/list/?', (req, res) => {
	res.sendFile(path.join(__dirname + '/views/tools.html'))
});

//Authentication just adds a cookie and then redirects
app.get('/summary/authenticate/?', (req, res) =>
{
	res.cookie('token', req.query.access_token, {maxAge: 604800000});
	res.redirect("/summary/");
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

//loss view
app.get('/loss/', (req, res) =>
{
	res.sendFile(path.join(__dirname + '/views/lossView.html'))
});

app.get('/anon/', (req, res) => 
{
	res.sendFile(path.join(__dirname + '/views/anonSendView.html'))
});

app.get('/anonymous/', (req, res) =>
{
        res.sendFile(path.join(__dirname + '/views/lgAnon.html'))
});

app.get('/phamilymann/', (req, res) =>
{
        res.sendFile(path.join(__dirname + '/views/lgAnon2.html'))
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
				res.end(JSON.stringify(toSend));
			});
		});
	});
});

//Adds messages to be sent to the list
app.post('/submitMessage/', (req, res) =>
{
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
		sender.uploadImage(path, req.cookies.token, (url) => {
			res.writeHead(200, { 'Content-Type': 'application/json' })
			res.end(JSON.stringify({ status: 'success', path: url }))
		})
	})
})

//Restores backup on start
scheduler.restoreBackup();

const server = app.listen(port, () => console.log(`Schmessage listening on port ${port}!`))
