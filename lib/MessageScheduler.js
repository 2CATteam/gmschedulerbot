var schedule = require('node-schedule');
var sender = require('./MessageSender');
var fs = require('fs');

class MessageScheduler
{	
	constructor()
	{
		this.jobs = [];
	}
	
	scheduleMessage(token, group, time, toSend)
	{
		var j = schedule.scheduleJob(time, function(w, x, y, z, thisnt) {
			sender.sendMessage(w, x, y, z);
			thisnt.unscheduleMessage(w, x, y, z);
		}.bind(null, token, group, time, toSend, this));
		if (j == null)
		{
			sender.sendMessage(token, group, time, toSend);
			return;
		}
		var job = {
			token: token,
			group: group,
			time: time,
			toSend: toSend,
			job: j
		}
		this.jobs.push(job);
		this.updateBackup();
	}
	
	unscheduleMessage(token, group, time, toSend)
	{
		for (var i = 0; i < this.jobs.length; ++i)
		{
			if (this.jobs[i].token == token && 
				this.jobs[i].group == group && 
				this.jobs[i].time.getTime() == time.getTime() && 
				this.jobs[i].toSend == toSend)
			{
				this.jobs[i].job.cancel();
				this.jobs.splice(i, 1);
				console.log("Removing message, this is left:");
				console.log(this.jobs);
				this.updateBackup();
				return;
			}
			else
			{
				console.log(this.jobs[i].token);console.log(token);
				console.log(this.jobs[i].group);console.log(group);
				console.log(this.jobs[i].time.getTime());console.log(time.getTime());
				console.log(this.jobs[i].toSend);console.log(toSend);
			}
		}
	}
	
	getMessages(token)
	{
		var toReturn = [];
		for (var i in this.jobs)
		{
			if (this.jobs[i].token == token)
			{
				toReturn.push(this.jobs[i]);
			}
		}
		return toReturn;
	}
	
	updateBackup()
	{
		fs.writeFile('./ScheduledMessages.json', JSON.stringify({jobs: this.jobs}), (err) => {console.log(err)});
	}
	
	restoreBackup()
	{
		fs.readFile('./ScheduledMessages.json', (err, data) =>
		{
			if (err)
			{
				console.log("Error reading backup file");
				return;
			}
			else
			{
				let jsonData = JSON.parse(data);
				for (var x in jsonData.jobs)
				{
					const date = new Date(jsonData.jobs[x].time);
					this.scheduleMessage(
						jsonData.jobs[x].token,
						jsonData.jobs[x].group,
						date,
						jsonData.jobs[x].toSend
					);
				}
			}
		});
	}
}

module.exports = MessageScheduler;