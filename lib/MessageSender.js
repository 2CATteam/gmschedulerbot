'use strict'
const mime = require('mime');
const fs = require('fs');
const https = require('https');

//Class for sending messages
class MessageSender
{
	//Sends a message from a user token, a group to send, the time to send, and the message
	static sendMessage(token, group, time, toSend, image, messageType)
	{
		//Creates some options to let the message be sent with the GroupMe API
		var options = {
			hostname: 'api.groupme.com',
			path: `/v3/groups/${group}/messages?token=${token}`,
			method: 'POST',
			headers: {
				'Content-Type': "application/json"
			}
		}
		const guid = time.getTime().toString() + group.toString() + token.toString().substring(0, 5)
		var body = {
			"message": {
				"source_guid": guid,
				"text": toSend,
				"attachments": image ? [{"type": "image", "url": image}] : []
			}
		}
		if (messageType == "dm") {
			options = {
				hostname: 'api.groupme.com',
				path: `/v3/direct_messages?token=${token}`,
				method: 'POST',
				headers: {
					'Content-Type': "application/json"
				}
			}
			body = {
				"message": {
					"source_guid": guid,
					"text": toSend,
					"recipient_id": group,
					"attachments": image ? [{"type": "image", "url": image}] : []
				}
			}
		}
		//Creates the request to send the request
		let req = https.request(options,  (response) => {
			console.log(`Status: ${response.statusCode}`);
			if (response.statusCode > 399) return;
			response.setEncoding('utf8');
			/*response.on('data', (chunk) => {
				console.log(`Body: ${chunk}`);
			})
			response.on('end', () => {
				console.log("End of conversation.");
			})*/
		});
		//Logs errors and sends the request
		req.on('error', (e) => {console.error(`Problem: ${e.message}`)});
		req.end(JSON.stringify(body));
	}

	//Gets chat list from the GroupMe API
	static getChats(token, callback)
	{
		//Creates the options for the GroupMe API
		const options = {
			hostname: 'api.groupme.com',
			path: `/v3/groups?token=${token}&per_page=100`,
			method: 'GET',
			headers: {
				'Content-Type': "application/json"
			}
		}
		//Creates the request for the chats
		let req = https.request(options,  (response) => {
			console.log(`Status: ${response.statusCode}`);
			if (response.statusCode > 399) return;
			response.setEncoding('utf8');
			//Reads data
			var toReturn = "";
			response.on('data', (chunk) => {
				toReturn += chunk;
			})
			//Returns data
			response.on('end', () => {
				var chatsJson = JSON.parse(toReturn);
				var toReturnJson = {"chats": []};
				for (var i = 0; i < chatsJson.response.length; i++)
				{
					toReturnJson["chats"].push([chatsJson.response[i].id, chatsJson.response[i].name]);
				}
				callback(toReturnJson);
			})
		});
		//Logs errors and sends the request
		req.on('error', (e) => {console.error(`Problem: ${e.message}`)});
		req.end();
	}

	static getDMs(token, callback)
	{
		//Creates the options for the GroupMe API
		const options = {
			hostname: 'api.groupme.com',
			path: `/v3/chats?token=${token}&per_page=100`,
			method: 'GET',
			headers: {
				'Content-Type': "application/json"
			}
		}
		//Creates the request for the chats
		let req = https.request(options, (response) => {
			console.log(`Status: ${response.statusCode}`);
			if (response.statusCode > 399) return;
			response.setEncoding('utf8');
			//Reads data
			var toReturn = "";
			response.on('data', (chunk) => {
				toReturn += chunk;
			})
			//Returns data
			response.on('end', () => {
				var DMsJson = JSON.parse(toReturn);
				if (DMsJson.response == null)
				{
					console.log(DMsJson);
				}
				var toReturnJson = {"DMs": []};
				for (var i = 0; i < DMsJson.response.length; i++)
				{
					toReturnJson["DMs"].push([DMsJson.response[i].other_user.id, DMsJson.response[i].other_user.name]);
				}
				callback(toReturnJson);
			})
		});
		//Logs errors and sends the request
		req.on('error', (e) => {console.error(`Problem: ${e.message}`)});
		req.end();

	}
	
	static getId(token, callback) {
		//Creates the options for the GroupMe API
		const options = {
			hostname: 'api.groupme.com',
			path: `/v3/users/me?token=${token}&per_page=100`,
			method: 'GET',
			headers: {
				'Content-Type': "application/json"
			}
		}
		//Creates the request for the chats
		let req = https.request(options,  (response) => {
			console.log(`Status: ${response.statusCode}`);
			if (response.statusCode > 399) return;
			response.setEncoding('utf8');
			//Reads data
			var toReturn = "";
			response.on('data', (chunk) => {
				toReturn += chunk;
			})
			//Returns data
			response.on('end', () => {
				var info = JSON.parse(toReturn);
				if (info.response == null) {
					console.log(info);
				}
				callback(info.response.id, info.response.name);
			})
		});
		//Logs errors and sends the request
		req.on('error', (e) => {console.error(`Problem: ${e.message}`)});
		req.end();
	}

	static uploadImage(file, token, callback) {
		const stat = fs.statSync(file)
		//Creates some options to let the message be sent with the GroupMe API
		var options = {
			host: "image.groupme.com",
			path: "/pictures",
			method: "POST",
			headers: {
				'Content-Type': mime.lookup(file),
				'Content-Length': stat.size
			}
		}
		var req = https.request(options,  (response) => {
			console.log(`Status: ${response.statusCode}`);
			response.setEncoding('utf8');
			//Reads data
			var toReturn = "";
			response.on('data', (chunk) => {
				toReturn += chunk;
			})
			//Returns data
			response.on('end', () => {
				fs.unlinkSync(file)
				try {
					callback(JSON.parse(toReturn).payload.url);
				} catch(err) {
					console.error(toReturn)
					console.error(err)
					console.error("The previous error was likely not breaking")
					console.log("Handling error")
					try {
						callback(null, JSON.parse(toReturn).errors[0])
					} catch(err2) {
						console.log("Could not handle error")
					}
				}
			})
		});
		req.setHeader("Content-Type", "image/jpeg")
		req.setHeader("X-Access-Token", token)
		//Logs errors and sends the request
		req.on('error', (e) => {console.error(`Problem: ${e.message}`)});
		var fileData = fs.createReadStream(file)
		fileData.on('open', () => {
			console.log('Piping')
			fileData.pipe(req)
		})
		fileData.on('data', (chunk) => {})
		fileData.on('error', () => {
			console.error('Problem!')
			req.end()
		})
	}
}

module.exports = MessageSender;

