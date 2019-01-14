'use strict'

const https = require('https')

console.log("Hello, world!")

const token = "cXojGY947qrZhTXiPxLGBqnalisd5aJxdOHYnjF9"
const testGroupID = "14538582"
const testMessageID = "154710840693462940"
const path = `/v3/messages/${testGroupID}/${testMessageID}/like?token=${token}`;

const options = {
    hostname: 'api.groupme.com',
    path: path,
    method: 'POST',
	headers: {
		'Content-Type': "application/json"
	}
}
	
const body = {
  "message": {
    "source_guid": "GUIREEEEEEE",
    "text": "Hello world",
	"attachments": []
  }
}

let req = https.request(options,  (response) => {
    console.log(`Status: ${response.statusCode}`);
	response.setEncoding('utf8');
	let ject = "";
	response.on('data', (chunk) => {
		console.log(`Body: ${chunk}`);
		ject += chunk;
	})
	response.on('end', () => {
		console.log("End of conversation.");
		let newJect = JSON.parse(ject)
		console.log(JSON.stringify(newJect));
	})
});

req.on('error', (e) => {console.error(`Problem: ${e.message}`)});

//req.end(JSON.stringify(body));
req.end();