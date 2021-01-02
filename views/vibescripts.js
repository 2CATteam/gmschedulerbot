//Holds message data, member data, and number of messages. Gets filled.
var aggregate = {agg: {}, members: {}, count: 0}

//Holds data to be displayed
var summary = {}

//Holds current running data. Has token, group_id, and last added to it. State is used to wait for an existing task to finish before continuing.
//When running, state = 1. To cancel it, set state = -1. State = 0 when idle.
var args = {state: 0}

function updateBasedOnToken() {
	//Grab token from cookie and store it
	var cookie = document.cookie
	var token = cookie.split("token=")[1]
	if (token==""||token in window) {
		return;
	}
	args.token = token
	//Download a list of user's chats from the server
	var request = new XMLHttpRequest();
	request.open("POST", "/getInfo/");
	request.setRequestHeader('Content-Type', 'application/json');
	request.send(JSON.stringify({token: token}));
	request.onload = () => {
		const data = JSON.parse(request.response);
		var dropdown = document.getElementById("Select");
		//Throw appropriate error
		if (data.info.chats.length == 0) {
			showError("There was an error authenticating your account. Please try again.");
			return;
		}
		//Add chats to dropdown
		for (var i = 0; i < data.info.chats.length; i++) {
			var option = document.createElement("option");
			option.text = data.info.chats[i][1];
			option.setAttribute("value", data.info.chats[i][0]);
			dropdown.add(option);
		}
		//Remove placeholder
		var toDelete = document.getElementById("placeholderOption");
		dropdown.removeChild(toDelete)

		args.user_id = data.userId
		args.name = data.name

		//Success!
		dropdown.disabled = false;
		document.getElementById("completionLocation").innerHTML = "Authentication was a success! You can now select a group.";

		$("button").prop("disabled", false);
	};
}

function showError(toShow) {
	$("#ErrorLocation").text(toShow)
}

function showProgress(toShow) {
	$("#ProgressLocation").text(toShow)
}

function fillTable() {
	$("td").remove()
	$(".tableGraph").remove()
	let order = Object.keys(summary)
	var sortBy = $("#SortBy").val()
	var direction = $("#Direction").val()
	if (sortBy == "name") {
		order.sort((a, b) => {
			if (summary[a][sortBy].toLowerCase() > summary[b][sortBy].toLowerCase()) {
				return direction
			} else {
				return direction * -1
			}
		});
	} else {
		order.sort((a, b) => {
			if (isNaN(summary[a][sortBy])) {
				return 1
			} else if (isNaN(summary[b][sortBy])) {
				return -1
			} else if (summary[a][sortBy] > summary[b][sortBy]) {
				return direction
			} else {
				return direction * -1
			}
		});
	}
	if (order.length > 0) { 
		var sent = 0
		var scores = 0
		var words = 0
		for (var i in order) {
			sent += summary[order[i]].sent
			scores += summary[order[i]].totalScore
			words += summary[order[i]].totalWords
		}
		let header = `<tr class="tableData3">
	<td class="topRow">Whole Chat</td>
	<td class="topRow">${sent}</td>
	<td class="topRow">${scores}</td>
	<td class="topRow">${Math.round(scores / words * 100) / 100}</td>
</tr>`
		let headElement = $(header)
		$("table").append(headElement)
	}
	for (var i in order) {
		let row = `<tr class="tableData${ i%2 == 0 ? 1 : 2}">
	<td>${summary[order[i]].name}</td>
	<td>${summary[order[i]].sent}</td>
	<td>${summary[order[i]].totalScore}</td>
	<td>${Math.round(summary[order[i]].totalScore / summary[order[i]].totalWords * 100) / 100}</td>
</tr>`
		let element = $(row)
		$("table").append(element)
		$(element).data("id", order[i])
	}
	$("td").click((event) => {
		showGraph(event)
	})
}

async function startAgg() {
	if (args.state != 0) {
		setTimeout(startAgg, 50)
		return
	}
	else {
		if ($("#chatButton").prop("checked")) {
			args.state = 1
			await getUsers()
			await mainLoop(false)
			showProgress(`Messages downloaded, parsing data...`)
			parseMessages()
			fillTable()
			showProgress("Done!")
			args.last = undefined
			args.state = 0
		} else {
			aggregate.members = {}
			aggregate[args.id] = args.name
			const numChats = $("#Select").children().length
			$("#Select").children().each(function() {
				args.group_id = this.value
				args.last = undefined
				await mainLoop()
			})
		}
	}
}

async function mainLoop(all, progress, numChats) {
	var loop = true
	while (loop) {
		if (args.state == -1) {
			args.state = 0;
			args.last = undefined;
			aggregate = {agg: {}, members: {}, count: 0}
			summary = {}
			return;
		}
		showProgress(`${all ? "Chat " + progress + "/" + numChats + ": ": ""}${Object.keys(aggregate.agg).length}/${aggregate.count} messages downloaded`)
		loop = await getMessages(all)
	}
}

function sum(arr) {
	var sum = 0
	for (var i in arr) {
		sum += arr[i]
	}
	return sum
}

function showGraph(event) {
	if ($(".tableGraph").data("id") == $(event.target).parent().data("id") || $(event.target).parent().data("id") == undefined) {
		$(".tableGraph").remove()
		return
	} else {
		$(".tableGraph").remove()
	}
	$(event.target).parent().after('<tr class="tableGraph"><td colspan=4><div id="GraphDiv"><p id="Nicknames"></p><canvas id="Graph"></canvas></div></td></tr>')
	let nickString = summary[$(event.target).parent().data("id")].names.toString().replace(/,/g, ", ")
	if (nickString == "") { nickString = "None" }
	$("#Nicknames").text("Names used: " + nickString)
	let data = []
	let key = $(event.target).parent().data("id")
	let scoreQueue = []
	let wordsQueue = []
	for (var i = summary[key].times.length - 1; i >= 0; i--) {
		scoreQueue.push(summary[key].scores[i])
		if (scoreQueue.length > Math.round(summary[key].times.length / 8)) {
			scoreQueue.shift()
		}
		wordsQueue.push(summary[key].words[i])
		if (wordsQueue.length > Math.round(summary[key].times.length / 8)) {
			wordsQueue.shift()
		}
		data.push({ t: moment(new Date(summary[key].times[i]*1000)), y: (sum(scoreQueue) / sum(wordsQueue)) })
	}
	let ctx = $("#Graph");
	var graph = new Chart(ctx, {
		type: 'line',
		data: {
			datasets: [{
				type: 'line',
				label: 'Positivity (rolling average)',
				pointRadius: 1,
				borderWidth: 3,
				fill: false,
				data: data,
				cubicInterpolationMode: 'monotone',
				borderColor: '#00ADFF'
			}]
		},
		options: {
			title: {
				display: false,
				text: "Positivity for user over time"
			},
			scales: {
				xAxes: [{
					type: 'time',
					distribution: 'linear',
					ticks: {
						source: 'auto',
						major: {
							enabled: true,
							fontStyle: 'bold',
						},
						autoSkip: true,
						autoSkipPadding: 1000,
						maxRotation: 45,
						minRotation: 0,
						sampleSize: 10,
						maxTicksLimit: 20
					},
					time: {
						unit: 'day',
						displayFormats: {
							day: 'MMM D'
						},
					}
				}],
				yAxes: [{
					gridLines: {
						drawBorder: false
					},
					scaleLabel: {
						display: true,
						labelString: "Positivity (rolling average)"
					}
				}]
			},
			legend: {
				display: false
			},
			tooltips: {
				callbacks: {
					label: function(tooltipItem) {
						return tooltipItem.yLabel;
					}
				}
			},
			layout: {
				padding: {
					bottom: 10
				}
			}
		}
	});
	$(".tableGraph").data("id", $(event.target).parent().data("id"))
}

//Analyze string and assign it values using AFINN
function analyze(string) {
	//Initialize cumulative score
	var scoreSum = 0
	//Remove all punctuation
	string = string.replace(/\W/g, " ").replace(/\s+/g, " ")
	//Split into words
	var arr = string.toLowerCase().split(/\s/)
	//Look at each word in array
	for (var i = 0; i < arr.length; i++) {
		//If special case where we need to look ahead
		if (afinn["lookahead"][arr[i]]) {
			//If we can look ahead and we see one of the special words
			if (i + 1 < arr.length && afinn["lookahead"][arr[i]][arr[i + 1]]) {
				//If we can look ahead and there's a third word
				if (i + 2 < arr.length && afinn["lookahead"][arr[i]][arr[i + 1]]["then"]) {
					//If the third word is right
					if (afinn["lookahead"][arr[i]][arr[i + 1]]["then"] == arr[i + 2]) {
						//Add the correct value
						scoreSum += afinn["lookahead"][arr[i]][arr[i + 1]]["value"]
						//Skip the two words we just looked at
						i++
						i++
					}
				//If there isn't a third word
				} else {
					//Add the correct value
					scoreSum += afinn["lookahead"][arr[i]][arr[i + 1]]["value"]
					//Skip the word we just looked at
					i++
				}
			//If we don't see the word we're looking ahead for, fall back to simple check below.
			} else if (afinn["simple"][arr[i]]) {
				scoreSum += afinn["simple"][arr[i]]
			}
		//If this word is in the list, add the associated value
		} else if (afinn["simple"][arr[i]]) {
			scoreSum += afinn["simple"][arr[i]]
		}
	}
	//Return proper values
	return {"sum": scoreSum, "words": arr.length}
}

async function getUsers() {
	return new Promise((res,rej) => {
		let url = `https://api.groupme.com/v3/groups/${args.group_id}?token=${args.token}`;
		$.get(url, (chat) => {
			aggregate.members = {}
			for (var i in chat.response.members) {
				aggregate.members[chat.response.members[i].user_id] = chat.response.members[i].nickname;
			}
			res();
		});
	});
}

async function getMessages(all) {
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
			aggregate["count"] = chats.response.count
			//Initialize size of current operation to 0
			let size = 0
			//For each message, add its info to object
			for (var i in chats.response.messages) {
				//Update size and last read message
				size++
				args.last = chats.response.messages[i].id

				var score = {"sum": 0, "words": 0};
				if (chats.response.messages[i].text) {
					score = analyze(chats.response.messages[i].text)
				}
				//Save required information
				aggregate.agg[chats.response.messages[i].id] = {
					sender: chats.response.messages[i].sender_id,
					name: chats.response.messages[i].name,
					score: score.sum,
					words: score.words,
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

function parseMessages() {
	//Initialize summary object
	summary = {};
	for (var i in aggregate.members) {
		summary[i] = {
			sent: 0,
			name: "User left chat",
			names: [],
			scores: [],
			totalScore: 0,
			words: [],
			totalWords: 0,
			times: []
		};
	}
	//Create all senders as needed in the object
	for (var i in aggregate.agg) {
		//We only care about users
		if (aggregate.agg[i].system) continue;

		//Initialize this user if needed
		if (summary[aggregate.agg[i].sender] == undefined) {
			//Default values (before adding anything): No score or words sent, and a name that assumes we cannot fetch their name.
			summary[aggregate.agg[i].sender] = {
				sent: 0,
				name: "User left chat",
				names: [],
				scores: [],
				totalScore: 0,
				words: [],
				totalWords: 0,
				times: []
			};
		}

		//Self-explanatory stuff
		summary[aggregate.agg[i].sender].sent++;
		summary[aggregate.agg[i].sender].totalScore += aggregate.agg[i].score;
		summary[aggregate.agg[i].sender].totalWords += aggregate.agg[i].words;
		//Add the values to the arrays for the graph
		if (aggregate.agg[i].words > 0) {
			summary[aggregate.agg[i].sender].scores.push(aggregate.agg[i].score);
			summary[aggregate.agg[i].sender].words.push(aggregate.agg[i].words);
			summary[aggregate.agg[i].sender].times.push(aggregate.agg[i].time);
		}
		//Add names if they're new
		if (!summary[aggregate.agg[i].sender].names.includes(aggregate.agg[i].name)) {
			summary[aggregate.agg[i].sender].names.push(aggregate.agg[i].name);
		}
	}
	//Fill in sender names and finalize score
	for (var i in summary) {
		//Look for name in source
		if (aggregate.members[i] != undefined) {
			summary[i].name = aggregate.members[i]
		} else if (summary[i].names.length > 0) {
			//Else use most recent nickname
			summary[i].name = summary[i].names[summary[i].names.length - 1]
		}
		//Finalize score
		summary[i].final = summary[i].totalScore / summary[i].totalWords
	}
}

$(document).ready(() => {
	updateBasedOnToken()
	$("#Select").change(() => {
		$("#chatButton").prop("checked", true)
		//Clear saved data and refreshes table, then cancels job.
		aggregate = {agg: {}, members: {}, count: 0}
		summary = {}
		fillTable()
		if (args.state != 0) {
			args.state = -1
		}
	})
	//When changing which data analyzed, cancel job
	$("input[type='radio']").change(function() {
		if (args.state != 0) {
			args.state = -1
		}
	})
	//Re-sorts table when order is changed
	$("#SortBy").change(() => { fillTable() })
	$("#Direction").change(() => { fillTable() })
	//Starts collection when submit button is pressed
	$("#Submit").click(() => {
		args.group_id = $("#Select").val()
		startAgg()
	})
})