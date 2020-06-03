var schedule = require('node-schedule');
var sender = require('./MessageSender');
var fs = require('fs');

class MessageScheduler
{
	constructor() {
		this.jobs = [];
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
		var j = schedule.scheduleJob(time, function(w, x, y, z, o, p, thisnt) {
			sender.sendMessage(w, x, y, z, o, p);
			thisnt.unscheduleMessage(w, x, y, z);
		}.bind(null, token, group, time, toSend, image, messageType, this));
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
		this.updateBackup();
	}

	unscheduleMessage(token, group, time, toSend) {
		for (var i = 0; i < this.jobs.length; ++i) {
			if (this.jobs[i].token == token &&
				this.jobs[i].group == group &&
				this.jobs[i].time.getTime() == time.getTime() &&
				this.jobs[i].toSend == toSend
			) {
				this.jobs[i].job.cancel();
				this.jobs.splice(i, 1);
				this.updateBackup();
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

	updateBackup() {
		fs.writeFile('./ScheduledMessages.json', JSON.stringify({jobs: this.jobs}, null, "\t"), (err) => {console.log(err)});
	}

	restoreBackup() {
		fs.readFile('./ScheduledMessages.json', (err, data) => {
			if (err) {
				console.log("Error reading backup file");
				return;
			}
			else {
				let jsonData = JSON.parse(data);
				for (var x in jsonData.jobs) {
					const date = new Date(jsonData.jobs[x].time);
					if (date > new Date()) {
						this.scheduleMessage(
							jsonData.jobs[x].token,
							jsonData.jobs[x].group,
							date,
							jsonData.jobs[x].toSend,
							jsonData.jobs[x].image,
							jsonData.jobs[x].messageType
						);
					}
				}
			}
		});
	}
}

function addTime(date) {
	return new Date(date.getTime() + 100);
}

module.exports = MessageScheduler;
