var sqlite = require('sqlite3')
let newdb = new sqlite.Database('./new_messages_database.db', sqlite.OPEN_WRITE | sqlite.OPEN_CREATE)
let olddb = new sqlite.Database('./messages.db', sqlite.OPEN_READ)

let i = 0

old.each("SELECT * FROM main;", async (err, row) => {
	i++
	if (err) throw err
	let id = await getId(row.token).ids
	newdb.run('INSERT INTO main (job_id, user_id, token, chat, next, toSend, image, messageType) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
		i, id, row.token, row.chat, parseInt(row.time), row.toSend, row.image, row.messageType, (err) => { if (err) throw err })
	}
}, (err, num) => {
	console.log(`Attempted to transfer ${num} items`)
})

async function getId(token) {
	return new Promise((resolve, reject) => {
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
			if (response.statusCode > 399) reject(`Status: ${response.statusCode}`);
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
				resolve({"id": info.response.id, "name": info.response.name});
			})
		});
		//Logs errors and sends the request
		req.on('error', (e) => {
			console.error(`Problem: ${e.message}`)
			reject(e)
		});
		req.end();
	})
}