//Holds message data, member data, and number of messages. Gets filled.
var aggregate = {agg: {}, members: {}, count: 0}

//Holds data to be displayed
var summary = {}

//Holds current running data. Has token, group_id, and last added to it. State is used to wait for an existing task to finish before continuing. When running, state = 1. To cancel it, set state = -1. State = 0 when idle.
var args = {state = 0}

function updateBasedOnToken() {
	var cookie = document.cookie
	var token = cookie.split("token=")[1]
	if (token==""||token in window) {
		return;
	}
	args.token = token
	var request = new XMLHttpRequest();
	request.open("POST", "https://www.schmessage.com/getInfo/");
	request.setRequestHeader('Content-Type', 'application/json');
	request.send(JSON.stringify({token: token}));
	request.onload = () => {
		const data = JSON.parse(request.response);
		var dropdown = document.getElementById("Select");
		if (data.info.chats.length == 0) {
			showError("There was an error authenticating your account. Please try again.");
			return;
		}
		for (var i = 0; i < data.info.chats.length; i++) {
			var option = document.createElement("option");
			option.text = data.info.chats[i][1];
			option.setAttribute("value", data.info.chats[i][0]);
			dropdown.add(option);
		}
		var toDelete = document.getElementById("placeholderOption");
		dropdown.removeChild(toDelete)

		dropdown.disabled = false;
		document.getElementById("completionLocation").innerHTML = "Authentication was a success! You can now select a group.";
	};
}

function groupIdFromName(name) {
	var groupID = 0
	const options = document.getElementById("Select").children
	for (var choice = 0; choice < options.length; ++choice) {
		if (options[choice].innerText == name) {
			groupID = options[choice].value;
		}
	}
	return groupID
}

function showError(toShow) {
	document.getElementById("ErrorLocation").innerHTML = toShow;
}

function showProgress(toShow) {
	$("#ProgressLocation").text(toShow)
}

function fillTable() {
	$(".tableData").remove()
	$(".tableGraph").remove()
	for (var i in summary) {
		let row = `<tr class="tableData">
	<td>${summary[i].name}</td>
	<td>${summary[i].sent}</td>
	<td>${summary[i].attachments}</td>
	<td>${summary[i].likes}</td>
	<td>${summary[i].liked}</td>
	<td>${Math.round((summary[i].textLength) / (summary[i].sent) * 10) / 10}</td>
</tr>`
		${"table").append(row)
	}
}

function startAgg() {
	if (args.state != 0) {
		setTimeout(startAgg(), 50)
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
		aggregate = {}
		summary = {}
		return;
	}
	if (res) {
		getMessages(args, aggregate).then(beginningCallback)
	} else {
		summary = parseMessages(aggregate)
		fillTable()
		args.state = 0
	}
}

$(document).ready(() => {
	updateBasedOnToken()
	$("#Select").change(() => {
		//Clear saved data and refreshes table, then cancels job.
		aggregate = {}
		summary = {}
		fillTable()
		if (args.state != 0) {
			args.state = -1
		}
		args.group_id = $("options:selected").val()
	})
	$("#Submit").click(() => {
		startAgg()
	})
})