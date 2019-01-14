'use strict'

const https = require('https');

class MessageSender
{
	static sendMessage(token, group, time, toSend)
	{
		const options = {
			hostname: 'api.groupme.com',
			path: `/v3/groups/${group}/messages?token=${token}`,
			method: 'POST',
			headers: {
				'Content-Type': "application/json"
			}
		}
		const body = {
			"message": {
				"source_guid": time.getTime(),
				"text": toSend,
				"attachments": []
			}
		}
		
		let req = https.request(options,  (response) => {
			console.log(`Status: ${response.statusCode}`);
			response.setEncoding('utf8');
			response.on('data', (chunk) => {
				console.log(`Body: ${chunk}`);
			})
			response.on('end', () => {
				console.log("End of conversation.");
			})
		});
		req.on('error', (e) => {console.error(`Problem: ${e.message}`)});
		req.end(JSON.stringify(body));
	}
	
	static getChats(token, callback)
	{
		const options = {
			hostname: 'api.groupme.com',
			path: `/v3/groups?token=${token}&per_page=100`,
			method: 'GET',
			headers: {
				'Content-Type': "application/json"
			}
		}
		
		let req = https.request(options,  (response) => {
			console.log(`Status: ${response.statusCode}`);
			response.setEncoding('utf8');
			var toReturn = "";
			response.on('data', (chunk) => {
				toReturn += chunk;
			})
			response.on('end', () => {
				var chatsJson = JSON.parse(toReturn);
				var toReturnJson = {};
				for (var chat in chatsJson.response)
				{
					toReturnJson[chatsJson.response[chat].id] = chatsJson.response[chat].name;
				}
				callback(toReturnJson);
			})
		});
		req.on('error', (e) => {console.error(`Problem: ${e.message}`)});
		req.end();
	}
}

module.exports = MessageSender;