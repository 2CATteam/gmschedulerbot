var fs = require('fs');

fs.readFile('ScheduledMessages.json', (err, data) => {
	if (err) throw err;
	const json = JSON.parse(data);
	console.log(json);
	console.log(json.jobs.length);
});
