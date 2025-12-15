var schedule = require('node-schedule');
var sender = require('./MessageSender');
var sqlite = require('sqlite3');
var moment = require('moment-timezone')

class MessageScheduler {
	constructor() {
		this.jobs = [];
		//Open SQLite db
		this.db = new sqlite.Database('./messages.db', sqlite.OPEN_READWRITE)
	}

	scheduleMessage(info) {
		for (var x in this.jobs) {
			if (this.jobs[x].data.chat == info.chat && this.jobs[x].data.next == info.next) {
				info.next += 100;
			}
		}
		var j = schedule.scheduleJob(new Date(info.next), function(info) {
			try {
				sender.sendMessage(info.token, info.chat, info.toSend, info.image, info.messageType);
			} catch (e) {
				console.error("Error sending scheduled message:")
				console.error(e)
			}
			this.iterate(info)
		}.bind(this, info));

		if (j == null) {
			throw 'Cannot schedule a message for the past!'
		}
		var job = {
			data: info,
			job: j
		}
		this.jobs.push(job);
		//Run sqlite3 insert thing IF it doesn't exist already
		this.db.get('SELECT * FROM main WHERE job_id = ?',
			info.job_id, (err, row) => {
			if (err) throw err;
			if (row) return;
			this.db.run('INSERT INTO main (job_id, user_id, token, chat, next, toSend, image, messageType) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
				info.job_id, info.user_id, info.token, info.chat, info.next, info.toSend, info.image, info.messageType, (err) => { if (err) throw err })
			for (var i in info.times) {
				this.db.run('INSERT INTO dates (job_id, time) VALUES (?, ?);', info.job_id, info.times[i])
			}
		})
	}
	
	iterate(info) {
		if (!info.times) {
			this.unschedule(info.job_id)
			return
		}
		var toRemove = info.times.shift()
		if (info.times.length > 0) {
			info.next = info.times[0]
			this.db.run('DELETE FROM dates WHERE job_id = ? AND time = ?;', info.job_id, toRemove, (err) => { if (err) throw err })
			
			var j = schedule.scheduleJob(new Date(info.next), function(info) {
				try {
					sender.sendMessage(info.token, info.chat, info.toSend, info.image, info.messageType);
				} catch (e) {
					console.error("Error sending scheduled message:")
					console.error(e)
				}
				this.iterate(info)
			}.bind(this, info));
			
			for (var i in this.jobs) {
				if (this.jobs[i].data.job_id == info.job_id) {
					this.jobs[i].job = j
					return
				}
			}
		} else {
			this.unschedule(info.job_id)
		}
	}

	unschedule(job_id) {
		//Run sqlite3 cancel thing
		this.db.run('DELETE FROM main WHERE job_id = ?;',
			job_id, (err) => {
			if (err) throw err
		})
		this.db.run('DELETE FROM dates WHERE job_id = ?;',
			job_id, (err) => {
			if (err) throw err
		})
		//Remove from memory
		for (var i = 0; i < this.jobs.length; ++i) {
			if (this.jobs[i].data.job_id === job_id) {
				if (this.jobs[i].job === null) {
					console.error("Found job with no associated thread")
					console.error(this.jobs[i])
					this.jobs.splice(i, 1);
					return
				}
				this.jobs[i].job.cancel();
				this.jobs.splice(i, 1);
				return;
			}
		}
	}

	getMessages(user_id, token) {
		var toReturn = [];
		for (var i in this.jobs) {
			if (this.jobs[i].data.user_id == user_id || this.jobs[i].data.token == token) {
				if (this.jobs[i].data.token != token) {
					console.log(`Fixing token mismatch for scheduled message ${JSON.stringify(this.jobs[i].data)}`)
					this.jobs[i].data.token = token
					this.db.run('UPDATE main SET token = ? WHERE job_id = ?;', token, this.jobs[i].data.job_id, (err) => { if (err) throw err })
				}
				toReturn.push(this.jobs[i].data);
			}
		}
		return toReturn;
	}

	restoreBackup() {
		this.db.each('SELECT * FROM main;', (err, row) => {
			row.next = parseInt(row.next)
			let date = new Date(row.next)
			if (date > new Date()) {
				this.db.each('SELECT * FROM dates WHERE job_id = ?;', row.job_id, (err, row2) => {
					if (err) throw err
					if (!row.times) { row.times = [] }
					row.times.push(parseInt(row2.time))
				}, (err, num) => {
					if (err) throw err
					this.scheduleMessage(row)
				})
			} else {
				console.log('Found message scheduled for past, checking if deleting is necessary')
				console.log(JSON.stringify(row, null, "\t"))
				this.db.each('SELECT * FROM dates WHERE job_id = ?;', row.job_id, (err, row2) => {
					if (err) throw err
					if (!row.times) { row.times = [] }
					row.times.push(parseInt(row2.time))
				}, (err, num) => {
					console.log(row)
					if (err) throw err
					if (!row.times || num === 0) {
						this.db.run('DELETE FROM main WHERE job_id = ?;', row.job_id, (err) => { if (err) throw err })
						return
					}
					if (row.next < new Date()) {
						while (row.times[0] < new Date()) {
							let toRemove = row.times.shift()
							console.log(`Clearing date instance for job_id ${row.job_id} where time is ${toRemove}`)
							this.db.run('DELETE FROM dates WHERE job_id = ? AND time = ?', row.job_id, toRemove, (err) => { if (err) throw err })
						}
						if (row.times.length > 0) {
							row.next = row.times[0]
							if (row.next > new Date()) {
								this.db.run('UPDATE main SET next = ? WHERE job_id = ?', row.times[0], row.job_id, (err) => { if (err) throw err })
								this.scheduleMessage(row)
							}
						}
						else {
							this.db.run('DELETE FROM main WHERE job_id = ?', row.job_id, (err) => { if (err) throw err })
						}
					}
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

module.exports = MessageScheduler;
