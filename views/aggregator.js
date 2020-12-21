async function getUsers(args, object) {
	return new Promise((res,rej) => {
		let url = `https://api.groupme.com/v3/groups/${args.group_id}?token=${args.token}`;
		$.get(url, (chat) => {
			object.members = {}
			for (var i in chat.response.members) {
				object.members[chat.response.members[i].user_id] = chat.response.members[i].nickname;
			}
			res();
		});
	});
}

async function getMessages(args, object) {
	return new Promise((resolve, reject) => {
		//Create proper URL
		let url = `https://api.groupme.com/v3/groups/${args.group_id}/messages?token=${args.token}&before_id=${args.last}&limit=100`
		if (args.last == undefined) {
			url = `https://api.groupme.com/v3/groups/${args.group_id}/messages?token=${args.token}&limit=100`
		}
		$.get(url, (chats, status) => {
			if (status != "success") {
				if (status == 'notmodified') { resolve(true) }
				reject("Incorrect status '" + status + "'")
				return
			}
			//Save object count
			object["count"] = chats.response.count
			//Initialize size of current operation to 0
			let size = 0
			//For each message, add its info to object
			for (var i in chats.response.messages) {
				//if (chats.response.messages[i].sender_id == "Target ID") {
				//$.post(`https://api.groupme.com/v3/messages/${args.group_id}/${chats.response.messages[i].id}/unlike?token=${args.token}`, {}, console.log('Success!'))
				//$.post(`https://api.groupme.com/v3/messages/${args.group_id}/${chats.response.messages[i].id}/like?token=${args.token}`, {}, console.log('Success!'))
				//}
				//console.log(chats.response.messages[i].id)
				//Update size and last read message
				size++
				args.last = chats.response.messages[i].id
				//COunt number of attachments
				var attNum = 0;
				for (var j in chats.response.messages[i].attachments) {
					if (chats.response.messages[i].attachments[j].type == "image") {
						attNum++
					}
				}
				var textLength = 0;
				if (chats.response.messages[i].text) { textLength = chats.response.messages[i].text.length }
				//Save required information
				object.agg[chats.response.messages[i].id] = {
					sender: chats.response.messages[i].sender_id,
					name: chats.response.messages[i].name,
					attachments: attNum,
					likes: chats.response.messages[i].favorited_by,
					textLength: textLength,
					time: chats.response.messages[i].created_at,
					system: chats.response.messages[i].system
				}
			}
			if (size >= 100) {
				//Resolve with more to do
				resolve(true);
			}
			else {
				//Resolve with a finished state
				resolve(false);
			}
		})
	})
}

function parseMessages(source) {
	//Initialize return object
	var toReturn = {};
	for (var i in source.members) {
		toReturn[i] = {
			sent: 0,
			name: "User left chat",
			names: [],
			attachments: 0,
			likes: 0,
			liked: 0,
			textLength: 0,
			times: []
		};
	}
	//Create all senders as needed in the object
	for (var i in source.agg) {
		if (toReturn[source.agg[i].sender] == undefined && !source.agg[i].system) {
			//Default values (before adding anything): No text or images sent, no likes given or received, and a name that assumes we cannot fetch their name.
			toReturn[source.agg[i].sender] = {
				sent: 0,
				name: "User left chat",
				names: [],
				attachments: 0,
				likes: 0,
				liked: 0,
				textLength: 0,
				times: []
			};
		}
		//Initialize data for everyone who has liked this message
		for (var j in source.agg[i].likes) {
			if (toReturn[source.agg[i].likes[j]] == undefined) {
				toReturn[source.agg[i].likes[j]] = {
					sent: 0,
					name: "User left chat",
					names: [],
					attachments: 0,
					likes: 0,
					liked: 0,
					textLength: 0,
					times: []
				};

			}
		}
	}
	//Tally up sender stats
	for (var i in source.agg) {
		//We only care about users
		if (source.agg[i].system) continue;
		//Self-explanatory stuff
		toReturn[source.agg[i].sender].sent++;
		toReturn[source.agg[i].sender].attachments += source.agg[i].attachments;
		toReturn[source.agg[i].sender].textLength += source.agg[i].textLength;
		//Add the time the message to the array for the graph
		toReturn[source.agg[i].sender].times.push(source.agg[i].time);
		//Add names if they're new
		if (!toReturn[source.agg[i].sender].names.includes(source.agg[i].name)) {
			toReturn[source.agg[i].sender].names.push(source.agg[i].name);
		}
		//Count likes received and note who gave likes
		toReturn[source.agg[i].sender].likes += source.agg[i].likes.length;
		for (var j in source.agg[i].likes) {
			toReturn[source.agg[i].likes[j]].liked++;
		}
	}
	//Fill in sender names
	for (var i in toReturn) {
		//Look for name in source
		if (source.members[i] != undefined) {
			toReturn[i].name = source.members[i]
		} else if (toReturn[i].names.length > 0) {
			//Else use most recent nickname
			toReturn[i].name = toReturn[i].names[0]
		}
	}
	//Done
	return toReturn;
}
