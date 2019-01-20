function updateBasedOnToken() {
	var cookie = document.cookie
	var token = cookie.split("token=")[1]
	if (token==""||token in window)
	{
		return;
	}
	var request = new XMLHttpRequest();
	request.open("POST", window.location.href + "getInfo/");
	request.setRequestHeader('Content-Type', 'application/json');
	request.send(JSON.stringify({token: token})); 
	request.onload = () => {
		const data = JSON.parse(request.response);
		var dropdown = document.getElementById("Select");
		if (data.chats.length == 0)
		{
			showError("There was an error authenticating your account. Please try again.");
			return;
		}
		for (var x in data.chats)
		{
			var option = document.createElement("option");
			option.text = data.chats[x];
			option.setAttribute("value",x);
			dropdown.add(option);
		}
		var toDelete = document.getElementById("placeholderOption");
		dropdown.removeChild(toDelete);
		
		dropdown.disabled = false;
		document.getElementById("completionLocation").innerHTML = "Authentication was a success! You can now schedule a message.";
		document.getElementById("date").disabled = false;
		document.getElementById("time").disabled = false;
		document.getElementById("toSend").disabled = false;
		
		
		updateMessages(data);
	};
}

function submit() {
	completeCheck(function()
	{
		validCheck(function()
		{
			var cookie = document.cookie
			var token = cookie.split("token=")[1]
			var dateVal = document.getElementById("date").value;
			var timeVal = document.getElementById("time").value;
			var datetime = new Date(dateVal + "T" + timeVal + ":00");
			var request = new XMLHttpRequest();
			request.open("POST", window.location.href + "submitMessage/");
			request.setRequestHeader('Content-Type', 'application/json');
			const toSend = JSON.stringify({
				token: token,
				chat: document.getElementById("Select").value,
				time: datetime.toISOString(),
				toSend: document.getElementById("toSend").value
			})
			request.send(toSend);
			request.onload = () => {
				const data = JSON.parse(request.response);
				updateMessages(data);
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
	else if (document.getElementById("toSend").value=="")
	{showError("Text is required")}
	else
	{callback()}
}

function validCheck(callback)
{
	if (document.getElementById("Select").value=="Invalid")
	{
		showError("Authentication failed. Make sure cookies are turned on.");
		return;
	}
	var dateVal = document.getElementById("date").value;
	var timeVal = document.getElementById("time").value;
	var datetime = new Date(dateVal + "T" + timeVal + ":00");
	if (datetime < new Date())
	{showError("Message cannot be scheduled for the past.")}
	else if (document.getElementById("toSend").value.length > 1000)
	{showError("Maximum length is 1000 characters.")}
	else {callback()}
}

function deleteMessage(button)
{
	var cookie = document.cookie;
	var token = cookie.split("token=")[1];
	var pList = button.parentElement.children;
	
	var groupID = 0;
	var options = document.getElementById("Select").children;
	const searchText = pList[0].innerText.split("Chat: ")[1];
	for (var choice = 0; choice < options.length; ++choice)
	{
		if (options[choice].innerText === searchText)
		{
			groupID = options[choice].value;
		}
	}
	if (groupID == 0)
	{
		console.log("Unable to find chat in list");
		console.log(searchText);
		console.log(options);
	}
	let dateData = new Date(pList[1].innerHTML.split("<b>Time: </b>")[1]);
	
	var request = new XMLHttpRequest();
	request.open("POST", window.location.href + "deleteMessage/");
	request.setRequestHeader('Content-Type', 'application/json');
	const toSend = JSON.stringify({
		token: token,
		chat: groupID,
		time: dateData.toISOString(),
		toSend: pList[2].innerHTML.split("<b>Message: </b>")[1]
	})
	request.send(toSend);
	request.onload = () => {
		const data = JSON.parse(request.response);
		updateMessages(data);
	}
}

function updateMessages(data)
{
	document.getElementById("scheduled").innerHTML = "";
	for (var x in data.messages)
	{
		var subDiv = document.createElement("div");
		subDiv.setAttribute("class", "subDiv");
		
		var groupText = document.createElement("p");
		groupText.setAttribute("class", "groupText");
		groupText.innerHTML = "<b>Chat: </b>" + data.chats[data.messages[x].group];
		subDiv.appendChild(groupText);
		
		var tempDate = new Date(data.messages[x].time);
		var timeText = document.createElement("p");
		timeText.setAttribute("class", "timeText");
		timeText.innerHTML = "<b>Time: </b>" + tempDate.toLocaleString();
		subDiv.appendChild(timeText);
		
		var textText = document.createElement("p");
		textText.setAttribute("class", "textText");
		textText.innerHTML = "<b>Message: </b>" + data.messages[x].toSend;
		subDiv.appendChild(textText);
		
		var cancelButton = document.createElement("button");
		cancelButton.setAttribute("onclick", "deleteMessage(this)");
		cancelButton.innerHTML = "Cancel message";
		
		subDiv.appendChild(cancelButton);
		
		document.getElementById("scheduled").appendChild(subDiv);
		
		document.getElementById("messagesLabel").hidden = false;
	}
}

function showError(toShow)
{
	document.getElementById("ErrorLocation").innerHTML = "ERROR: " + toShow;
	document.getElementById("SuccessLocation").innerHTML = "";
}

function showSuccess()
{
	document.getElementById("ErrorLocation").innerHTML = "";
	document.getElementById("SuccessLocation").innerHTML = "Success! Your message has been scheduled and you can view or cancel it below.";
	document.getElementById("This").value = "";
}

window.onload = updateBasedOnToken;
