var chats = []
var DMs = []
var messages = []
var my_id = null

function updateBasedOnToken() {
	var token = getCookie("token")
	if (token == "" || token in window) {
		return;
	}
	$("#logOut").removeAttr("hidden")
	var request = new XMLHttpRequest();
	request.open("POST", "/getInfo/");
	request.setRequestHeader('Content-Type', 'application/json');
	request.send(JSON.stringify({token: token}));
	request.onload = () => {
		const data = JSON.parse(request.response);
		if (data.info.chats.length == 0) {
			showError("There was an error authenticating your account. Please try again.");
			return;
		}
		
		chats = data.info.chats		
		DMs = data.info.DMs
		messages = data.messages
		my_id = data.userId
		
		populateDropdowns()
		
		document.getElementById("completionLocation").innerHTML = "Authentication was a success! You can now schedule a message.";
		document.getElementById("date").disabled = false;
		document.getElementById("time").disabled = false;
		document.getElementById("toSend").disabled = false;
		document.getElementById("image").disabled = false;

		updateMessages();
	};
}

function populateDropdowns() {
	var dropdown = document.getElementById("Select");
	
	if (chats.length == 0) {
		var emptyChats = document.getElementById("placeholderOption");
		emptyDMs.text = "No chats found"
	}
	else {
		var emptyChats = document.getElementById("placeholderOption");
		dropdown.removeChild(emptyChats)
		dropdown.disabled = false;
	}
	
	for (var i = 0; i < chats.length; i++) {
		var option = document.createElement("option");
		option.text = chats[i][1];
		option.setAttribute("value", chats[i][0]);
		dropdown.add(option);
	}
	
	//Same as above but for DMs
	var dmdropdown = document.getElementById("dmSelect");
	
	if (DMs.length == 0) {
		var emptyDMs = document.getElementById("dmPlaceholderOption");
		emptyDMs.text = "No DMs found"
	}
	else {
		var emptyDMs = document.getElementById("dmPlaceholderOption");
		dmdropdown.removeChild(emptyDMs)
		dmdropdown.disabled = false;
	}
	
	for (var i = 0; i < DMs.length; i++) {
		var option = document.createElement("option");
		option.text = DMs[i][1];
		option.setAttribute("value", DMs[i][0]);
		dmdropdown.add(option);
	}
}

function submit() {
	completeCheck(function() {
		validCheck(function() {
			var token = getCookie("token")
			var dateVal = document.getElementById("date").value;
			var timeVal = document.getElementById("time").value;
			var datetime = dateFromStrings(dateVal, timeVal);
			var messageType = "chat";
			if (document.getElementsByName("messageType")[0].checked) {
				messageType = document.getElementsByName("messageType")[0].value;
			}
			if (document.getElementsByName("messageType")[1].checked) {
				messageType = document.getElementsByName("messageType")[1].value;
			}
			var chat = "default";
			var select = null;
			if (messageType == "dm") {
				select = document.getElementById("dmSelect");
			}
			else {
				select = document.getElementById("Select");
			}
			chat = select.options[select.selectedIndex].value
			var image = $("#image").data('path')
			var request = new XMLHttpRequest();
			request.open("POST", "/submitMessage/");
			request.setRequestHeader('Content-Type', 'application/json');
			const toSend = JSON.stringify({
				token: token,
				chat: chat,
				next: datetime.getTime(),
				toSend: document.getElementById("toSend").value,
				image: image,
				messageType: messageType
			})
			request.send(toSend);
			request.onload = () => {
				const data = JSON.parse(request.response);
				messages = data.messages
				updateMessages();
				showSuccess();
			}
		});
	});
}

function completeCheck(callback)
{
	if (document.getElementById("Select").value=="Invalid")
	{showError("Authentication is required. If you have logged in with GroupMe, make sure you have cookies enabled.")}
	else if (document.getElementById("date").value=="")
	{showError("Date is required")}
	else if (document.getElementById("time").value=="")
	{showError("Time is required")}
	else if (document.getElementById("toSend").value=="" && !$("#image").data('path'))
	{showError("Text is required")}
	else { callback() }
}

function validCheck(callback) {
	if (document.getElementById("Select").value=="Invalid") {
		showError("Authentication failed. Make sure cookies are turned on.");
		return;
	}
	var dateVal = document.getElementById("date").value;
	var timeVal = document.getElementById("time").value;
	var datetime = dateFromStrings(dateVal, timeVal);
	if (!datetime)
		{showError("Date could not be read. Please check your formatting.")}
	if (datetime < new Date())
		{showError("Message cannot be scheduled for the past.")}
	else if (document.getElementById("toSend").value.length > 1000)
		{showError("Maximum length is 1000 characters.")}
	else {callback()}
}

function deleteMessage(button) {
	var token = getCookie("token")
	var parent = $(button.parentElement);

	var request = new XMLHttpRequest();
	request.open("POST", "/deleteMessage/");
	request.setRequestHeader('Content-Type', 'application/json');
	const toSend = JSON.stringify({
		token: getCookie("token"),
		job_id: parent.data("job_id"),
		user_id: my_id
	})
	request.send(toSend);
	request.onload = () => {
		const data = JSON.parse(request.response);
		messages = data.messages
		updateMessages();
	}
}

function updateMessages() {
	document.getElementById("scheduled").innerHTML = "";
	if (messages.length < 1) {
		document.getElementById("messagesLabel").hidden = true;
		return
	}
	for (var x in messages) {
		var subDiv = document.createElement("div");
		subDiv.setAttribute("class", "subDiv");
		$(subDiv).data("job_id", messages[x].job_id)

		var groupText = document.createElement("p");
		groupText.setAttribute("class", "groupText");
		groupText.innerHTML = "<b>Chat: </b>" + groupNameFromMessage(x);
		$(subDiv).data("chat", messages[x].chat)
		subDiv.appendChild(groupText);

		var tempDate = new Date(messages[x].next);
		var timeText = document.createElement("p");
		timeText.setAttribute("class", "timeText");
		timeText.innerHTML = "<b>Time: </b>" + tempDate.toLocaleString();
		$(subDiv).data("time", tempDate);
		subDiv.appendChild(timeText);

		var textText = document.createElement("p");
		textText.setAttribute("class", "textText");
		textText.innerHTML = "<b>Message: </b>" + messages[x].toSend;
		$(subDiv).data("text", messages[x].toSend);
		subDiv.appendChild(textText);

		if (messages[x].image) {
			var imageText = document.createElement("p");
			imageText.setAttribute("class", "textText");
			imageText.innerHTML = "<b>Image URL: </b>" + messages[x].image
			$(subDiv).data("image", messages[x].image)
			subDiv.appendChild(imageText)
		}
		var cancelButton = document.createElement("button");
		cancelButton.setAttribute("onclick", "deleteMessage(this)");
		cancelButton.innerHTML = "Cancel message";

		subDiv.appendChild(cancelButton);

		document.getElementById("scheduled").appendChild(subDiv);

		document.getElementById("messagesLabel").hidden = false;
	}
}

function groupNameFromMessage(x) {
	if (messages[x].messageType == "chat") {
		for (var i = 0; i < chats.length; i++) {
			if (chats[i][0] == messages[x].chat) {
				return chats[i][1];
			}
		}
		console.log(chats)
	} else {
		for (var i = 0; i < DMs.length; i++) {
			if (DMs[i][0] == messages[x].chat) {
				return DMs[i][1] + "'s DMs"
			}
		}
		console.log(DMs)
	}
	console.log(x)
	return "Unknown chat";
}

function groupIdFromName(name) {
	var groupID = 0
	const options = document.getElementById("Select").children
	for (var choice = 0; choice < options.length; ++choice) {
		if (options[choice].innerText == name) {
			groupID = options[choice].value;
		}
	}
	const dmoptions = document.getElementById("dmSelect").children
	for (var choice = 0; choice < dmoptions.length; ++choice) {
		if (dmoptions[choice].innerText + "'s DMs" == name) {
			groupID = dmoptions[choice].value;
		}
	}
	return groupID
}

function dateFromStrings(date, time) {
	if (!date.match(/\d{4}-\d{1,2}-\d{1,2}/i)) { return }
	if (!time.match(/\d{1,2}:\d{1,2}/i)) { return }
	let dateSplit = date.split("-");
	let timeSplit = time.split(":");
	let ints = [
		parseInt(dateSplit[0]),
		parseInt(dateSplit[1]),
		parseInt(dateSplit[2]),
		parseInt(timeSplit[0]),
		parseInt(timeSplit[1])
	];
	if (timeSplit.length > 2) {
		ints.push(parseInt(timeSplit[2]))
	}
	var toReturn = new Date(ints[0], ints[1]-1, ints[2], ints[3], ints[4], ints[5] ? ints[5] : null);
	return toReturn;
}

function showError(toShow) {
	document.getElementById("ErrorLocation").innerHTML = "ERROR: " + toShow;
	document.getElementById("SuccessLocation").innerHTML = "";
}

function showSuccess() {
	document.getElementById("ErrorLocation").innerHTML = "";
	document.getElementById("SuccessLocation").innerHTML = "Success! Your message has been scheduled and you can view or cancel it below.";
	if ($('#shouldClear:checked').length > 0) {
		document.getElementById("toSend").value = "";
	}
}

function debug() {
	var debugString = "";
	debugString += document.cookie;
	debugString += "\n \n";
	if (document.getElementById("date").value && document.getElementById("time").value)
	{
		debugString += document.getElementById("date").value;
		debugString += "\n";
		debugString += document.getElementById("time").value;
		debugString += "\n";
		debugString += "Date currently: ";
		let toCompareDate = new Date();
		debugString += toCompareDate.toISOString();
		debugString += "\n Form of existing is as follows: ";
		let debugDate = dateFromStrings(document.getElementById("date").value, document.getElementById("time").value);
		debugString += debugDate.toISOString();
		debugString += "\n";
		debugString += "Compare current, ";
		debugString += toCompareDate.getTime();
		debugString += "To parsed value from fields, ";
		debugString += debugDate.getTime();
	}
	debugString += "\n \n";
	debugString += document.getElementById("Select").innerHTML;
	debugString += "\n \n";
	debugString += document.getElementById("toSend").value;
	document.getElementById("ErrorLocation").innerHTML = debugString;
}

function imageUpload(event) {
	document.getElementById("ErrorLocation").innerHTML = "";
	const files = event.target.files
	$("#image").removeData('path');
	if (files.length < 1) {
		$("#SubmitButton").prop("disabled", false);
		return;
	}
	$("#SubmitButton").prop("disabled", true);
	const data = new FormData()
	data.append('image', files[0])
	var token = getCookie("token");
	data.append('token', token)

	var request = new XMLHttpRequest();
	request.open("POST", "/uploadImage/");
	request.send(data);
	request.onload = () => {
		if (request.status > 399) {
			if (request.status == 413) {
				showError("Your file was too large! The max size is 8MB.")
				return
			}
			try {
				let data = JSON.parse(request.response)
				showError("Upload failed with the following error: " + data.message)
			} catch(err) {
				showError("Something went wrong with your image upload. Please try again, or if this error persists, try with a different file.")
			}
			$("#SubmitButton").prop("disabled", false);
			return;
		}
		const data = JSON.parse(request.response);
		$("#image").data('path', data.path);
		$("#SubmitButton").prop("disabled", false);
	}
	request.onerror = () => {
		showError("Something went wrong with your image upload. Please try again, or if this error persists, try with a different file.")
		$("#SubmitButton").prop("disabled", false);
	}
}

function anonSend() {
	const toSendText = document.getElementById("toSend").value;
	const address = "https://api.groupme.com/v3/bots/post";
	var request = new XMLHttpRequest();
	request.open("POST", address);
	request.setRequestHeader('Content-Type', 'application/json');
	const toSend = JSON.stringify({
		bot_id: "ffb4d00d6cbebbda610d4751f4",
		text: toSendText
	});
	request.send(toSend);
}

function getCookie(key) {
	obj = {}
	list = document.cookie.split(";")
	for (x in list) {
		if (list[x]) {
			pair = list[x].split("=", 2)
			obj[pair[0].trim()] = pair[1].trim()
		}
	}
	return obj[key]
}

function setCookie(key, value) {
	document.cookie = `${key}=${value}`
}

$(document).ready(() => {
	updateBasedOnToken()
	$("#image").change((event) => {
		imageUpload(event)
	})
	$("input[type='radio']").change(function() {
		if (this.value == "dm") {
			$('#image').prop('disabled', true)
			$("#image").removeData('path');
		} else {
			$('#image').prop('disabled', false)
		}
	})
	$("#logOut").click(() => {
		document.cookie = "token="
		location.reload()
	})
})
