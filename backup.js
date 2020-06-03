//This file should be run hourly if possible. Put it in crontab.
var sqlite = require('sqlite3');
const https = require('https')

var db = new sqlite.Database('./messages.db', sqlite.OPEN_READWRITE, toss)
var backup = new sqlite.Database('./backup.db', sqlite.OPEN_READWRITE, toss)

db.all('SELECT * FROM main', (err, rows) => {
	if (rows.length == 0) {
		console.log('Oh no oh no oh no')
		console.log('Uhhhh this is fine uhhh')
		console.log('This is why we have backups, right?')
		console.log('Oh no this is bad')
		console.log('This should never ever ever happen and something has gone wrong')
		console.log('HECK')
		console.log("No, it's fine, we're fine, everything's fine, it's fine, we're fine, everything's fine")
		console.log('I can fix this')
		console.log("Okay, BUSter, we fix this by reporting it. Yeah, that's what I'll do.") //Ugh, if this code line ever fires in production, I'm going to have to do something
		send("Bro you gotta come check this out right now, everything is broken and all the data is gone and I don't know what to do")
	} else {
		console.log('Ugh, another routine backup')
		console.log('I hate my job') //Note: This is the script talking, not the programmer. The programmer is having a lot of fun writing this.
		console.log('When have we even needed this backup? Stupid waste of time...') //The script doesn't get the point of a backup
		db.each('SELECT * FROM main', (err, row) => {
			backup.run('INSERT INTO main (token, chat, time, toSend, image, messageType) VALUES (?, ?, ?, ?, ?, ?)',
				row.token, row.chat, row.time, row.toSend, row.image, row.messageType, (err) => {
				toss(err)
			})
		}, (err, num) => {
			toss(err)
			console.log('Aight, Imma go home now. See ya next time I have to do this thing...')
		})
	}
})

function toss(err) {
	if (err) {
		send(err.toString())
		throw err
	}
}

function send(messageText) {
        if (messageText.length > 1000) {
                send(messageText.substring(0, 1000))
                send(messageText.substring(1000, messageText.length))
                return;
        }
        const botId = '';

        const options = {
                hostname: 'api.groupme.com',
                path: '/v3/bots/post',
                method: 'POST'
        };

        const body = {
                bot_id: botId,
                text: messageText
        };


        const botRequest = https.request(options, function(response) {
                if (response.statusCode !== 202) {
                        console.log('Bad status ' + response.statusCode);
                }
        });

        botRequest.on('error', function(error) {
                console.log(JSON.stringify(error));
        });

        botRequest.on('timeout', function(error) {
                console.log('Timeout ' + JSON.stringify(error));
        });
        botRequest.end(JSON.stringify(body));
};


