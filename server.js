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

//Experimental website just gives normal screen but with hci stuff
app.get('/hci', (req, res) =>
{
	res.sendFile(path.join(__dirname + '/views/experimentView.html'))
});

//Text website just gives normal screen but with test
app.get('/test', (req, res) =>
{
	res.sendFile(path.join(__dirname + '/views/experimentView.html'))
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
app.get('/hci/authenticate/?', (req, res) =>
{
	res.cookie('token', req.query.access_token, {maxAge: 604800000});
	res.redirect("/hci/");
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

//Gets the chats from GroupMe
app.post('/getInfo/', (req, res) =>
{
	var info = "";
	req.on('data', (chunk) =>
	{
		info += chunk;
	});
	req.on('end', async () =>
	{
		try {
			//Parses info
			const infoJson = JSON.parse(info);
			//Gets messages
			let bio = await sender.getId(infoJson.token)
			const messages = scheduler.getMessages(bio.id, infoJson.token);
			//Gets chats
			let chats = await sender.getChats(infoJson.token)
			let dms = await sender.getDMs(infoJson.token)
			const toSend = {
				info: {
					chats: chats,
					DMs: dms
				},
				messages: messages,
				userId: bio.id,
				name: bio.name
			};
			res.end(JSON.stringify(toSend));
		} catch (err) {
			res.writeHead(400, { 'Content-Type': 'application/json' })
			res.end(JSON.stringify({status: 'error', message: err}))
		}
	});
});

//Adds messages to be sent to the list
app.post('/submitMessage/', (req, res) => {
	hits++;
	console.log(hits)
	var info = "";
	req.on('data', (chunk) => {
		info += chunk;
	});
	req.on('end', async () => {
		try {
			const infoJson = JSON.parse(info);
			console.log(infoJson);
			let bio = await sender.getId(infoJson.token);
			infoJson.job_id = (new Date()).getTime().toString() + bio.id
			infoJson.user_id = bio.id
			
			if (!infoJson.next) {
				infoJson.next = infoJson.time
			}
			if (infoJson.time) {
				delete infoJson.time
			}
			
			scheduler.scheduleMessage(infoJson);
			let messages = scheduler.getMessages(infoJson.user_id, infoJson.token);
			const toSend = {
				messages: messages
			};
			res.end(JSON.stringify(toSend));
		} catch (err) {
			console.error(err)
			res.writeHead(400, { 'Content-Type': 'application/json' })
			res.end(JSON.stringify({status: 'error', message: err}))
		}
	});
});

//Removes message from being sent
app.post('/deleteMessage/', (req, res) => {
	var info = "";
	req.on('data', (chunk) =>
	{
		info += chunk;
	});
	req.on('end', async () => {
		try {
			const infoJson = JSON.parse(info);
			scheduler.unschedule(infoJson.job_id);
			let messages = scheduler.getMessages(infoJson.user_id, infoJson.token);
			let toSend = {
				messages: messages
			};
			res.end(JSON.stringify(toSend));
		} catch (err) {
			console.error(err)
			res.writeHead(400, { 'Content-Type': 'application/json' })
			res.end(JSON.stringify({status: 'error', message: err}))
		}
	});
});

app.post('/uploadImage/?', (req, res) => {
	const fileName = Date.now().toString() + ".jpeg"
	const path = __dirname + '/images/' + fileName
	req.files.image.mv(path, async (error) => {
		if (error) {
			console.error(error)
			res.writeHead(500, { 'Content-Type': 'application/json' })
			res.end(JSON.stringify({ status: 'error', message: error }))
			return
		}
		try {
			let url = await sender.uploadImage(path, req.cookies.token)			
			res.writeHead(200, { 'Content-Type': 'application/json' })
			res.end(JSON.stringify({ status: 'success', path: url }))
		} catch (err) {
			console.error(err)
			res.writeHead(400, {'Content-Type': 'application.json' })
			res.end(JSON.stringify({ status: 'error', message: err}))
		}
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
