var chats = []
var DMs = []
var messages = []
var my_name = null
var my_id = null
var lastMessageId = null

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
		my_name = data.name

		$("#selfIdPlace").text(my_id)
		
		populateDropdowns()
		slashMe()
		
		document.getElementById("completionLocation").innerHTML = "Authentication was a success! You can now select a chat or DM.";
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

	$("#Select").change()
	$("#dmSelect").change()
}

function showError(toShow) {
	console.error(toShow)
	document.getElementById("ErrorLocation").innerHTML = toShow;
}

function getNextMessages() {
	return new Promise((resolve, reject) => {
		if ($("#chatButton:checked").val()) {
			$.get(`https://api.groupme.com/v3/groups/${$("#Select").val()}/messages?token=${getCookie("token")}${lastMessageId ? "&before_id=" + lastMessageId : ""}`)
				.done((data, status, xhr) => {
					console.log(data.response)
					console.log(xhr)
					if (xhr.status != 200) {
						console.error(xhr)
						reject(status)
					}
					resolve(data.response.messages)
				})
		} else {
			$.get(`https://api.groupme.com/v3/direct_messages?other_user_id=${$("#dmSelect").val()}&token=${getCookie("token")}${lastMessageId ? "&before_id=" + lastMessageId : ""}`)
				.done((data, status, xhr) => {
					console.log(data.response)
					if (xhr.status != 200) {
						console.error(xhr)
						reject(status)
					}
					resolve(data.response.direct_messages)
				})
		}
	})
}

function getMembers() {
	return new Promise((resolve, reject) => {
		if ($("#chatButton:checked").val()) {
			$.get(`https://api.groupme.com/v3/groups/${$("#Select").val()}?token=${getCookie("token")}`)
				.done((data, status, xhr) => {
					if (xhr.status != 200) {
						console.error(xhr)
						reject(status)
					}
					resolve(data.response.members)
				})
		} else {
			$.get(`https://api.groupme.com/v3/chats?per_page=100&token=${getCookie("token")}`)
				.done((data, status, xhr) => {
					if (xhr.status != 200) {
						console.error(xhr)
						reject(status)
					}
					let other_user_id = $("#dmSelect").val()
					console.error(other_user_id)
					for (let i in data.response) {
						console.log(data.response[i].other_user.id)
						if (data.response[i].other_user.id == other_user_id) {
							resolve([data.response[i].other_user, {name: my_name, id: my_id}])
						}
					}
					reject("Could not find DM")
				})
		}
	})
}

function startTable() {
	$("table tr:not(:first-child)").remove()
	getMembers().then((data) => {
		data.sort((a, b) => (a.nickname ?? a.name)?.localeCompare(b.nickname ?? b.name))
		for (let i in data) {
			let html = `<tr>
				<td>${data[i].nickname ?? data[i].name}</td>
				<td>${data[i].id}</td>
			</tr>`
			$("#membersTable").append(html)
		}
	}).catch(showError)
	getNextMessages().then((data) => {
		for (let i in data) {
			let text = data[i].text
			for (let j in data[i].attachments) {
				if (data[i].attachments[j].type === "image") {
					text += "\n\n"
					text += data[i].attachments[j].image_url
				}
			}
			let date = new Date(data[i].created_at * 1000) 
			let html = `<tr>
				<td>${date.toLocaleDateString()} ${date.toLocaleTimeString()}</td>
				<td>${data[i].name}</td>
				<td style="white-space: pre-wrap;">${text}</td>
				<td>${data[i].id}</td>
				<td>${data[i].user_id}</td>
			</tr>`
			$("#messagesTable tr").eq(0).after(html)
		}
	})
}

function slashMe() {
	$.get(`https://api.groupme.com/v3/users/me?token=${getCookie("token")}`)
		.done((data, status, xhr) => {
			if (xhr.status != 200) {
				console.error(xhr)
				reject(status)
			}
			$("#codeBlock").text(JSON.stringify(data.response, null, "\t"))
		})
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
	$("#Select").change(() => {
		if ($("#chatButton:checked").val()) {
			startTable()
			$("#chatIdPlace").text($("#Select").val())
		}
	})
	$("#dmSelect").change(() => {
		if ($("#dmButton:checked").val()) {
			startTable()
			$("#chatIdPlace").text($("#dmSelect").val())
		}
	})
	$(".form-check-input").change(() => {
		$("#Select").change()
		$("#dmSelect").change()
	})
})

