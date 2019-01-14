function updateBasedOnToken() {
	var request = new XMLHttpRequest();
	request.open("POST", window.location.href + "getInfo/");
	request.setRequestHeader('Content-Type', 'application/json');
	request.send(JSON.stringify({token: document.getElementById("tokenBox").value})); 
	request.onload = () => {
		const data = JSON.parse(request.response);
		var dropdown = document.getElementById("Select");
		for (var x in data.chats)
		{
			var option = document.createElement("option");
			option.text = data.chats[x];
			option.setAttribute("value",x);
			dropdown.add(option);
		}
		var toDelete = document.getElementById("placeholderOption");
		dropdown.removeChild(toDelete);
	};
}