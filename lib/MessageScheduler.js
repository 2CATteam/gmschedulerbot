var schedule = require('node-schedule');
var sender = require('./MessageSender');

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
}

module.exports = MessageScheduler;