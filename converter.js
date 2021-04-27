var sqlite = require('sqlite3')
let newdb = new sqlite.Database('./new_messages_database.db', sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE)
let olddb = new sqlite.Database('./messages.db', sqlite.OPEN_READ)

let i = 0

olddb.each("SELECT * FROM main;", (err, row) => {
	i++
	if (err) throw err
	newdb.run('INSERT INTO main (job_id, user_id, token, chat, next, toSend, image, messageType) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
		i, i, row.token, row.chat, parseInt(row.time), row.toSend, row.image, row.messageType, (err) => { if (err) throw err })
}, (err, num) => {
	console.log(`Attempted to transfer ${num} items`)
})

