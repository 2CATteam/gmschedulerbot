//Most of this code is the existing codebase for my website. Don't grade this, it's not the project.
//Same for experimentView.html and experimentStyles.css, though the former does have some sick Bootstrap action we added in this project.

var chats = []
var DMs = []
var messages = []
var my_id = null
var picker = null

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
			
			let times = picker.getTimes()
			if (times.length == 0) {
				showError("You must select at least one date, and the last date for repeating messages must be after the first date")
				return
			}
			
			times.sort(function(a, b) {
				return a - b;
			})
			
			let first = times[0];
			
			if (first < (new Date()).getTime()) {
				showError("Message cannot be scheduled for the past.\n" + first.toLocaleString())
				return
			}
			
			var request = new XMLHttpRequest();
			request.open("POST", "/submitMessage/");
			request.setRequestHeader('Content-Type', 'application/json');
			const toSend = JSON.stringify({
				token: token,
				chat: chat,
				next: first,
				times: times,
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
	else if (document.getElementById("toSend").value=="" && !$("#image").data('path'))
	{showError("Text or image is required")}
	else { callback() }
}

function validCheck(callback) {
	if (document.getElementById("Select").value=="Invalid") {
		showError("Authentication failed. Make sure cookies are turned on.");
		return;
	}
	if (picker.getFirst() < new Date())
		{showError("Message cannot be scheduled for the past.\n" + picker.getFirst().toLocaleString())}
	else if (document.getElementById("toSend").value.length > 1000)
		{showError("Maximum message length is 1000 characters.")}
	else {callback()}
}

function deleteMessage(button) {
	var token = getCookie("token")
	var parent = $(button).closest(".subDiv");

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
		let tempDate = new Date(messages[x].next)
		let element = `<div class="card container-fluid subDiv py-3 mt-4">
			<div class="py-3 row gy-4">
				<div class="col-md">
					<p class="text-center"><b>Chat: </b></p>
					<p>${groupNameFromMessage(x)}</p>
					<p class="text-center" ${messages[x].toSend ? "" : 'style="display: none;"'}><strong>Message:</strong></p>
					<p style="white-space: pre-wrap; ${messages[x].toSend ? "" : "display: none;"}">${messages[x].toSend}</p>
					${messages[x].image ? '<p class="text-center"><strong>Image: </strong></p><img src="' + messages[x].image + '" alt="' + messages[x].image + '">' : ""}
				</div>
				<div class="col-md">
					<p class="text-left text-md-center"><strong>Date(s):</strong></p>
					<div class="calendarContainer container-md">
						<div class="calendarDisplay my-3"></div>
					</div>
					<p class="text-left text-md-center"><strong>Time: </strong><br/>${tempDate.toLocaleTimeString()}</p>
				</div>
			</div>
			<div class="row justify-content-around g-3 gx-5">
				<!--<div class="buttonContainer col-sm">
					<button class="btn btn-primary w-100" onclick="editMessage(this)">Edit Message</button>
				</div>-->
				<div class="buttonContainer col-sm">
					<button class="btn btn-danger" onclick="deleteMessage(this)">Cancel Message</button>
				</div>
			</row>
		</div>`
		
		let dom = $(element)
		let dateDisplay = new calendar(dom.find(".calendarDisplay"), false, messages[x].next, "multiple", false)
		for (let y of messages[x].times) {
			let toAdd = moment(y)
			toAdd.milliseconds(0)
			toAdd.seconds(0)
			toAdd.minutes(0)
			toAdd.hours(0)
			dateDisplay.addDate(toAdd)
		}
		for (let y in messages[x]) {
			dom.data(y, messages[x][y])
		}
		dom.data("info", messages[x])
		$("#scheduled").append(dom)

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
				return "DM to " + DMs[i][1]
			}
		}
		console.log(DMs)
	}
	console.log(x)
	return "Unknown chat";
}

function showError(toShow) {
	document.getElementById("ErrorLocation").innerHTML = "ERROR: " + toShow;
	document.getElementById("SuccessLocation").innerHTML = "";
}

function showSuccess() {
	document.getElementById("ErrorLocation").innerHTML = "";
	document.getElementById("SuccessLocation").innerHTML = "Success! Your message has been scheduled and you can view or cancel it below.";
	document.getElementById("toSend").value = "";
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
	picker = new dateTimePicker("#dateSelectorContainer", false)
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
