'use strict';

//Most of this code is the existing codebase for my website. Don't grade this, it's not the project.

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

let hits = 0;
let hitsCounter = new Date().valueOf();

app.use(cookieParser());
app.use(express.static(__dirname + '/views'));
app.use(favicon(__dirname + '/views/favicon.ico'));
app.use(fileupload());

//Normal website just gives normal screen
app.get('/', (req, res) =>
{
	hits++;
	console.log("Hits:", hits)
	console.log("Hits/day:", hits / ((new Date().valueOf() - hitsCounter) / 1000 / 86400))
	res.sendFile(path.join(__dirname + '/views/mainView.html'))
});

//HCI redirects to beta, because I made the mistake of naming the beta page HCI at first
app.get('/hci', (req, res) =>
{
	hits++;
	console.log("Hits:", hits)
	console.log("Hits/day:", hits / ((new Date().valueOf() - hitsCounter) / 1000 / 86400))
	res.redirect("/");
});

//Beta website gives new beta page!
app.get('/beta', (req, res) =>
{
	hits++;
	console.log("Hits:", hits)
	console.log("Hits/day:", hits / ((new Date().valueOf() - hitsCounter) / 1000 / 86400))
	res.redirect("/");
});

//Fallback website just gives fallback screen
app.get('/fallback', (req, res) =>
{
	hits++;
	console.log("Hits:", hits)
	console.log("Hits/day:", hits / ((new Date().valueOf() - hitsCounter) / 1000 / 86400))
	res.sendFile(path.join(__dirname + '/views/fallbackView.html'))
});

//Legacy view
app.get('/legacy', (req, res) =>
{
	hits++;
	console.log("Hits:", hits)
	console.log("Hits/day:", hits / ((new Date().valueOf() - hitsCounter) / 1000 / 86400))
	res.sendFile(path.join(__dirname + '/views/legacyView.html'))
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
	console.log("Hits:", hits)
	console.log("Hits/day:", hits / ((new Date().valueOf() - hitsCounter) / 1000 / 86400))
	res.sendFile(path.join(__dirname + '/views/summaryView.html'))
});

//Summary website just gives summary screen
app.get('/vibecheck/?', (req, res) =>
{
	console.log("Hits:", hits)
	console.log("Hits/day:", hits / ((new Date().valueOf() - hitsCounter) / 1000 / 86400))
	res.sendFile(path.join(__dirname + '/views/vibeView.html'))
});

//ID website just gives ID screen
app.get('/IDFinder/?', (req, res) =>
{
	console.log("Hits:", hits)
	console.log("Hits/day:", hits / ((new Date().valueOf() - hitsCounter) / 1000 / 86400))
	res.sendFile(path.join(__dirname + '/views/devView.html'))
});

app.get('/list/?', (req, res) => {
	console.log("Hits:", hits)
	console.log("Hits/day:", hits / ((new Date().valueOf() - hitsCounter) / 1000 / 86400))
	res.sendFile(path.join(__dirname + '/views/tools.html'))
});

//Authentication just adds a cookie and then redirects
app.get('/summary/authenticate/?', (req, res) =>
{
	res.cookie('token', req.query.access_token, {maxAge: 604800000});
	res.redirect("/summary/");
});

//Authentication just adds a cookie and then redirects
app.get('/legacy/authenticate/?', (req, res) =>
{
	res.cookie('token', req.query.access_token, {maxAge: 604800000});
	res.redirect("/legacy/");
});

//Authentication just adds a cookie and then redirects
app.get('/vibecheck/authenticate/?', (req, res) =>
{
	res.cookie('token', req.query.access_token, {maxAge: 604800000});
	res.redirect("/vibecheck/");
});

//Authentication just adds a cookie and then redirects
app.get('/IDFinder/authenticate/?', (req, res) =>
{
	res.cookie('token', req.query.access_token, {maxAge: 604800000});
	res.redirect("/IDFinder/");
});

//FAQ view
app.get('/faq/', (req, res) =>
{
	res.sendFile(path.join(__dirname + '/views/faqView.html'))
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
