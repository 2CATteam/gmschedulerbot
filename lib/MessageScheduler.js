var schedule = require('node-schedule');
var sender = require('./MessageSender');
var fs = require('fs');
var sqlite = require('sqlite3');

class MessageScheduler {
	constructor() {
		this.jobs = [];
		//Open SQLite db
		this.db = new sqlite.Database('./messages.db', sqlite.OPEN_READWRITE)
	}

	scheduleMessage(token, group, time, toSend, image, messageType) {
		for (var x in this.jobs) {
			if (
				this.jobs[x].group == group &&
				this.jobs[x].time.getTime() == time.getTime()
			) {
				time = addTime(time);
			}
		}
		var j = schedule.scheduleJob(time, function(w, x, y, z, o, p) {
			sender.sendMessage(w, x, y, z, o, p);
			this.unscheduleMessage(w, x, y, z);
		}.bind(this, token, group, time, toSend, image, messageType));
		var job = {
			token: token,
			group: group,
			time: time,
			toSend: toSend,
			image: image,
			messageType: messageType,
			job: j
		}
		this.jobs.push(job);
		//Run sqlite3 insert thing IF it doesn't exist already
		this.db.get('SELECT * FROM main WHERE token = ? AND chat = ? AND time = ? AND toSend = ?',
			token, group, time.getTime(), toSend, (err, row) => {
			if (err) throw err
			if (row) return
			this.db.run('INSERT INTO main (token, chat, time, toSend, image, messageType) VALUES (?, ?, ?, ?, ?, ?)',
				token, group, time.getTime(), toSend, image, messageType, (err) => { if (err) throw err})
		})
	}

	unscheduleMessage(token, group, time, toSend) {
		//Run sqlite3 cancel thing
		this.db.run('DELETE FROM main WHERE token = ? AND chat = ? AND time = ? AND toSend = ?',
			token, group, time.getTime(), toSend, (err) => {
			if (err) throw err
		})
		//Remove from memory
		for (var i = 0; i < this.jobs.length; ++i) {
			if (this.jobs[i].token == token &&
				this.jobs[i].group == group &&
				this.jobs[i].time.getTime() == time.getTime() &&
				this.jobs[i].toSend == toSend
			) {
				this.jobs[i].job.cancel();
				this.jobs.splice(i, 1);
				return;
			}
		}
	}

	getMessages(token) {
		var toReturn = [];
		for (var i in this.jobs) {
			if (this.jobs[i].token == token) {
				toReturn.push(this.jobs[i]);
			}
		}
		return toReturn;
	}

	/*//Remove this
	updateBackup() {
		fs.writeFile('./ScheduledMessages.json', JSON.stringify({jobs: this.jobs}, null, "\t"), (err) => {console.log(err)});
	}*/

	//Change all of this to a SELECT command
	restoreBackup() {
		this.db.each('SELECT * FROM main', (err, row) => {
			let date = new Date(parseInt(row.time))
			if (date > new Date()) {
				this.scheduleMessage(row.token, row.chat, date, row.toSend, row.image, row.messageType)
			} else {
				console.log('Found message scheduled for past')
				console.log(JSON.stringify(row))
				this.db.run('DELETE FROM main WHERE token = ? AND chat = ? AND time = ? AND toSend = ?',
		                        row.token, row.chat, row.time, row.toSend, (err) => {
                		        if (err) throw err
				})
			}
		}, (err, num) => {
			if (err) throw err
			console.log('Successfully restored or got rid of', num, 'messages.')
		})
	}

	//Close the database when done
	closeDB(cb) {
		this.db.close((err) => {
			if (err) cb(err)
			else cb()
		})
		return;
	}
}

function addTime(date) {
	return new Date(date.getTime() + 100);
}

module.exports = MessageScheduler;
