//Holds message data, member data, and number of messages. Gets filled.
var aggregate = {agg: {}, members: {}, chatNames: [], count: 0}

//Holds data to be displayed
var summary = {}

//Holds current running data. Has token, group_id, and last added to it. State is used to wait for an existing task to finish before continuing. When running, state = 1. To cancel it, set state = -1. State = 0 when idle.
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

		//Success!
		dropdown.disabled = false;
		document.getElementById("completionLocation").innerHTML = "Authentication was a success! You can now select a group.";

		$("button").prop("disabled", false);
	};
}

function showError(toShow) {
	document.getElementById("ErrorLocation").innerHTML = toShow;
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
	if (sortBy == "textLength") {
		order.sort((a, b) => {
			if (summary[b].sent == 0) return -1
			if (summary[a].sent == 0) return 1
			if ((summary[a].textLength / summary[a].sent) > (summary[b].textLength / summary[b].sent)) {
				return direction
			} else {
				return direction * -1
			}
		});
	} else if (sortBy == "avgLikes") {
		order.sort((a,b) => {
			if (summary[b].sent == 0) return -1
                        if (summary[a].sent == 0) return 1
                        if ((summary[a].likes / summary[a].sent) > (summary[b].likes / summary[b].sent)) {
                                return direction
                        } else {
                                return direction * -1
                        }
		});
	} else if (sortBy == "name") {
		order.sort((a, b) => {
			if (summary[a][sortBy].toLowerCase() > summary[b][sortBy].toLowerCase()) {
				return direction
			} else {
				return direction * -1
			}
		});
	} else {
		order.sort((a, b) => {
			if (summary[a][sortBy] > summary[b][sortBy]) {
				return direction
			} else {
				return direction * -1
			}
		});
	}
	if (order.length > 0) { 
		var sent = 0
		var att = 0
		var likes = 0
		var liked = 0
		var length = 0
		for (var i in order) {
			sent += summary[order[i]].sent
			att += summary[order[i]].attachments
			likes += summary[order[i]].likes
			liked += summary[order[i]].liked
			length += summary[order[i]].textLength
		}
		let header = `<tr class="tableData3">
	<td class="topRow">Whole Chat</td>
	<td class="topRow">${sent}</td>
	<td class="topRow">${att}</td>
	<td class="topRow">${likes}</td>
	<td class="topRow">${liked}</td>
	<td class="topRow">${sent ? Math.round(length / sent * 10) / 10 : "N/A"}</td>
	<td class="topRow">${sent ? Math.round(likes / sent * 100) / 100 : "N/A"}</td>
</tr>`
		let headElement = $(header)
		$("table").append(headElement)
		$(headElement).data("id", "WHOLECHAT")
	}
	for (var i in order) {
		let row = `<tr class="tableData${ i%2 == 0 ? 1 : 2}">
	<td>${summary[order[i]].name}</td>
	<td>${summary[order[i]].sent}</td>
	<td>${summary[order[i]].attachments}</td>
	<td>${summary[order[i]].likes}</td>
	<td>${summary[order[i]].liked}</td>
	<td>${summary[order[i]].sent ? Math.round((summary[order[i]].textLength) / (summary[order[i]].sent) * 10) / 10 : "N/A"}</td>
	<td>${summary[order[i]].sent ? Math.round(summary[order[i]].likes/summary[order[i]].sent * 100) / 100 : "N/A"}</td>
</tr>`
		let element = $(row)
		$("table").append(element)
		$(element).data("id", order[i])
	}
	$("td").click((event) => {
		showGraph(event)
	})
}

function startAgg() {
	if (args.state != 0) {
		setTimeout(startAgg, 50)
		return
	}
	else {
		args.state = 1
		getUsers(args, aggregate).then(() => { getMessages(args, aggregate).then(beginningCallback) })
	}
}

function beginningCallback(res) {
	if (args.state == -1) {
		args.state = 0;
		args.last = undefined;
		aggregate = {agg: {}, members: {}, count: 0}
		summary = {}
		return;
	}
	if (res) {
		showProgress(`${Object.keys(aggregate.agg).length}/${aggregate.count} messages downloaded`)
		getMessages(args, aggregate).then(beginningCallback)
	} else {
		showProgress(`Messages downloaded, parsing data...`)
		summary = parseMessages(aggregate)
		fillTable()
		showProgress("Done!")
		args.last = undefined
		args.state = 0
	}
}

function showGraph(event) {
	if ($(".tableGraph").data("id") == $(event.target).parent().data("id") || $(event.target).parent().data("id") == undefined) {
		$(".tableGraph").remove()
		return
	} else {
		$(".tableGraph").remove()
	}
	let data = []
	let nickString = ""
	if ($(event.target).parent().data("id") === "WHOLECHAT") {
		$(event.target).parent().after('<tr class="tableGraph"><td colspan=7><div id="GraphDiv"><p id="Nicknames"></p><canvas id="Graph"></canvas></div></td></tr>')
		nickString = aggregate.chatNames.toString().replace(/,/g, ", ")
		if (nickString != "") {
				$("#Nicknames").text("Chat names: " + nickString)
		}
		for (var j in summary) {
			let times = summary[j].times
			for (var i in times) {
				data.push({ t: moment(new Date(times[i]*1000)), y: times.length-parseInt(i) })
			}
		}
		data.sort((a, b) => {
			return a.t.unix() - b.t.unix()
		})
		let y = 0
		for (var i in data) {
			data[i].y = y
			y++
		}
		console.log(data)
	} else {
		$(event.target).parent().after('<tr class="tableGraph"><td colspan=7><div id="GraphDiv"><p id="Nicknames"></p><canvas id="Graph"></canvas></div></td></tr>')
		nickString = summary[$(event.target).parent().data("id")].names.toString().replace(/,/g, ", ")
		if (nickString == "") { nickString = "None" }
		$("#Nicknames").text("Names used: " + nickString)
		let times = summary[$(event.target).parent().data("id")].times
		for (var i in times) {
			data.push({ t: moment(new Date(times[i]*1000)), y: times.length-parseInt(i) })
		}
	}
	let ctx = $("#Graph");
	var graph = new Chart(ctx, {
		type: 'line',
		data: {
			datasets: [{
				type: 'line',
				label: 'Messages sent',
				pointRadius: 1,
				borderWidth: 3,
				steppedLine: 'after',
				fill: false,
				data: data,
				borderColor: '#00ADFF'
			}]
		},
		options: {
			title: {
				display: false,
				text: "Messages sent over time"
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
						labelString: "Messages sent"
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

$(document).ready(() => {
	updateBasedOnToken()
	$("#Select").change(() => {
		//Clear saved data and refreshes table, then cancels job.
		aggregate = {agg: {}, members: {}, chatNames: [], count: 0}
		summary = {}
		fillTable()
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

