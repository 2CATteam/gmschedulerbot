var sqlite = require('sqlite3')
let db = new sqlite.Database('./new_messages_database.db', sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE)
db.run("CREATE TABLE main (job_id TEXT NOT NULL, user_id TEXT NOT NULL, token TEXT NOT NULL, chat TEXT NOT NULL, next INTEGER NOT NULL, toSend TEXT, image TEXT, messageType TEXT NOT NULL);", (err) => {
	if (err) throw err
})
db.run("CREATE TABLE dates (job_id TEXT NOT NULL, time INTEGER NOT NULL);", (err) => {
	if (err) throw err
})