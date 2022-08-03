//Class for entire element
class dateTimePicker {
	//Stores element to attach itself to, and loads the HTML file containing its layout
	constructor(parent) {
		this.parent = $(parent)
		$(parent).load("/datetimePicker.html", this.load.bind(this))
	}
	
	//On load, begins manipulating elements
	load() {
		//Set current calendar text input to the current day in the local format
		//this.parent.find(".dateStringInput").first().val(moment().format('L'))
		//Attaches calendar to the relevant DOM element
		this.firstCalendar = new calendar(this.parent.find(".calendarColumn"), true)
		//Same for clock
		this.time = new clock(this.parent.find(".timeColumn"))
		//Seame for second calendar
		this.secondCalendar = new calendar(this.parent.find(".calendarColumn2"), true)
		
		//Set mode to single and tells the Select to set the UI's mode when the user changes the Select
		this.setMode("single")
		this.parent.find(".repeatTypeSelect").change({parent: this}, function(evt) {
			evt.data.parent.setMode($(this).val())
		})

		//Tells the interval settings to update the second calendar when changed
		this.parent.find(".intervalSettings .intervalNumber").change(function() {
			this.secondCalendar.setNumbers()
		}.bind(this))
		this.parent.find(".intervalSettings .intervalUnit").change(function() {
			this.secondCalendar.setNumbers()
		}.bind(this))

		//Same, but for the Days settings
		this.parent.find(".daysSettings label input").click(function() {
			this.secondCalendar.setNumbers()
		}.bind(this))
		this.parent.find(".daysSettings select").change(function() {
			this.secondCalendar.setNumbers()
		}.bind(this))
		
		//Initializes the ability to show or hide the repeat settings
		this.showRepeat = false

		//When the toggle button is clicked
		this.parent.find(".showHideRepeat").click(() => {
			//If currently not showing
			if (!this.showRepeat) {
				//Show repeat select and the lower row
				this.parent.find(".repeatSelect").slideDown()
				this.parent.find(".settingsColumn").slideDown()
				
				//Store the state
				this.showRepeat = true
				//Update button text and positioning
				this.parent.find(".showHideRepeat").text("Hide repeat options")
				this.parent.find(".showHideRepeat").removeClass("animationFixer")
			} else {
				//If currently showing, hide the repeat select and settings
				this.parent.find(".repeatSelect").slideUp(function() {}) //Afraid to remove this function, it breaks things
				this.parent.find(".settingsColumn").slideUp(function() {
					//Update button positioning when done
					$(this).parent().find(".showHideRepeat").addClass("animationFixer")
				})
				
				//Store the state and set button text
				this.showRepeat = false
				this.parent.find(".showHideRepeat").text("Show repeat options")
			}
		})

		//Check when resizing
		$(window).resize(() => {
			//Show either the mobile time picker or the clock view based on whether this is mobile and portrait
			if (this.mobile()) {
				this.parent.find(".mobileTime").removeClass("hidden")
				this.parent.find(".timeColumn").addClass("hidden")
			} else {
				this.parent.find(".mobileTime").addClass("hidden")
				this.parent.find(".timeColumn").removeClass("hidden")
			}
		})
		
		//Initially show correct mobile element
		if (this.mobile()) {
			this.parent.find(".mobileTime").removeClass("hidden")
			this.parent.find(".timeColumn").addClass("hidden")
		} else {
			this.parent.find(".mobileTime").addClass("hidden")
			this.parent.find(".timeColumn").removeClass("hidden")
		}

		//Set the current value of the mobile time picker to right now
		this.parent.find(".mobileTimePicker").val(moment().format("HH:mm"))
		//When that value is changed...
		this.parent.find(".mobileTimePicker").change(() => {
			//If it's valid...
			if (this.parent.find(".mobileTimePicker").val().match(/\d+:\d+/)) {
				//Get the numbers and set them in the JS object
				let nums = this.parent.find(".mobileTimePicker").val().split(":")
				this.time.hours = parseInt(nums[0])
				this.time.minutes = parseInt(nums[1])
				//Render new view
				this.time.showTime()
			} else {
				//Set the numbers to 0:00 (Midnight)
				this.time.hours = 0
				this.time.minutes = 0
			}
		})
	}
	
	//I stole this function from http://detectmobilebrowsers.com/
	//FAT regex on the user agent from them, plus I added an additional check for if it's in portrait mode
	//Returns true if in mobile browser in portrait mode, false otherwise
	mobile() {
		if(screen.availHeight <= screen.availWidth){
			return false
		} else {
			return (function(a,b){
				if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)
				||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) {return true}return false})(navigator.userAgent||navigator.vendor||window.opera)
		}
		return true
	}
	
	//Gets the array of available times
	getTimes() {
		//Initialize array and initial settings
		let datesArray = []
		let toAdd = moment(this.firstCalendar.date)
		let toCompare = moment(this.secondCalendar.date)
		
		switch (this.mode) {
			case "single":
				//If in single, copy the first date, set the minutes and hours, and return just that
				let toReturn = moment(this.firstCalendar.date)
				toReturn.minutes(this.time.minutes)
				toReturn.hours(this.time.hours)
				return [toReturn.valueOf()]
			case "interval":
				//If in interval, set minutes and hours first
				toAdd.minutes(this.time.minutes)
				toAdd.hours(this.time.hours)

				//Check if number is valid, if not throw
				let num = parseFloat(this.parent.find(".intervalNumber").val())
				if (num < 1 || !Number.isInteger(num)) {
					throw "Error: Interval number must be a positive integer"
				}
				
				//Get units
				let units = this.parent.find(".intervalUnit").val()
				
				//Set the last date to the end of the day for inclusivity
				toCompare.hours(23)
				toCompare.minutes(59)
				toCompare.seconds(59)
				
				//While we're still before the end, push the current timestamp and add the number of units
				while (toAdd <= toCompare) {
					datesArray.push(toAdd.valueOf())
					toAdd.add(num, units)
				}
				
				//Return an array sorted on integer value
				return datesArray.sort(function(a, b) {
					return a - b
				})
			case "days":
				//Set hours and minutes
				toAdd.minutes(this.time.minutes)
				toAdd.hours(this.time.hours)
				
				//Set end date for inclusivity
				toCompare.hours(23)
				toCompare.minutes(59)
				toCompare.seconds(59)

				//Get the filter setting
				let filter = this.parent.find(".intervalFilter").val()
				//Get which instance of the given weekday the first day is
				let n = Math.ceil(this.firstCalendar.date.date() / 7)
				
				//Checks which days the user specified
				let daysArray = []
				
				//For each checkbox, if it's checked, add the corresponding day
				for (let i = 2; i < 2 + 7; i++) {
					daysArray.push(this.parent.find(`.daysSettings :nth-child(${i}) :nth-child(1)`).prop("checked") == true)
				}
				
				//While the one we're adding is before the end
				while (toAdd <= toCompare) {
					//Get the day
					let day = toAdd.day()

					//If the filter mode is nth, check that this is the nth instance. If not, add a day and continue
					if (filter == "nth") {
						if (Math.ceil(toAdd.date() / 7) != n) {
							toAdd.add(1, "day")
							continue
						}
					}

					//If the filter is last, check that this is the last instance. If not, add a day and continue
					if (filter == "last") {
						if (toAdd.daysInMonth() >= toAdd.date() + 7) {
							toAdd.add(1, "day")
							continue
						}
					}

					//If this is a day we're adding, add it
					if (daysArray[day]) {
						datesArray.push(toAdd.valueOf())
					}

					//If doing alternating weeks, and at the end of the week, skip a week
					if (day == 6 && filter == "alternating") {
						toAdd.add(7, "days")
					}

					//Check the next day
					toAdd.add(1, "day")
				}
				
				//Return sorted array
				return datesArray.sort(function(a, b) {
					return a - b
				})
			case "multiple":
				//Calendar takes care of this one for us, just sort them and set times
				let dates = this.firstCalendar.dates.slice(0).sort(function(a, b) {
					return a - b
				})
				//Set times
				for (var i in dates) {
					dates[i] = moment(dates[i]).minutes(this.time.minutes).hours(this.time.hours).valueOf()
				}
				return dates
		}
	}
	
	getFirst() {
		//Get the first date selected
		return this.getTimes()[0]
	}

	//Change interface based on mode. Called when needed elements are already hidden.
	showMode() {
		//Detach the clock view to prepare to move
		let addBack = this.parent.find(".timeColumn").detach()
		
		//For each settings view, hide them
		this.parent.find(".singleSettings").addClass("hidden")
		this.parent.find(".intervalSettings").addClass("hidden")
		this.parent.find(".daysSettings").addClass("hidden")
		this.parent.find(".multipleSettings").addClass("hidden")
		//Show only the settings column of the current mode and animate it showing up
		this.parent.find(`.${this.mode}Settings`).removeClass("hidden")
		this.parent.find(`.${this.mode}Settings`).slideDown()
		
		//If in these two modes, clock goes on top and label should be shown
		if (this.mode === "interval" || this.mode === "days") {
			this.parent.find(".settingsColumn").append(addBack)
			this.parent.find(".clockLabel").removeClass("hidden")
		} else {
			//If in these two modes, clock goes on bottom and label should be hidden
			this.parent.find(".firstDateTimeContainer").append(addBack)
			this.parent.find(".clockLabel").addClass("hidden")
		}
		//Animate showing the clock
		addBack.slideDown()
		
		//If the second calendar is hidden and in modes which need it
		if (this.parent.find(".calendarColumn2:hidden").length > 0 && (this.mode === "interval" || this.mode === "days")) {
			//Animate the label showing up
			this.parent.find(".firstLabel").slideDown()
			//Un-hide the calendar, then animate it sliding down
			this.parent.find(`.calendarColumn2`).removeClass("hidden")
			this.parent.find(".calendarColumn2").slideDown(() => {
				//"Render" when finished
				this.secondCalendar.setNumbers()
			})
		}
	}
	
	//Update mode, set settings, and hide other elements
	setMode(mode) {
		//Switch mode, saving old
		let oldMode = this.mode
		this.mode = mode
		
		switch(mode) {
			case "single":
				//If single mode, hide second calendar and first calendar label
				if (this.parent.find(".calendarColumn2:visible").length > 0) {
					this.parent.find(".firstLabel").slideUp()
					this.parent.find(".calendarColumn2").slideUp(400, this.showMode.bind(this))
				}

				//If need to move clock, hide it first
				if (oldMode == "interval" || oldMode == "days") {
					this.parent.find(".timeColumn").slideUp(400)
				}

				//Hide other settings
				if (this.parent.find(".intervalSettings:visible").length > 0) {
					this.parent.find(".intervalSettings").slideUp(400, this.showMode.bind(this))
				}
				if (this.parent.find(".daysSettings:visible").length > 0) {
					this.parent.find(".daysSettings").slideUp(400, this.showMode.bind(this))
				}
				if (this.parent.find(".multipleSettings:visible").length > 0) {
					this.parent.find(".multipleSettings").slideUp(400, this.showMode.bind(this))
				}
				
				//Set first calendar to single mode
				this.firstCalendar.setMode("single")
				//Calendar don't need to react to anything or update anything
				this.secondCalendar.setFilter(null)
				this.firstCalendar.setRipple(null)
				break
			case "interval":
				//Hide other settings
				if (this.parent.find(".daysSettings:visible").length > 0) {
					this.parent.find(".daysSettings").slideUp(400, this.showMode.bind(this))
				}
				if (this.parent.find(".multipleSettings:visible").length > 0) {
					this.parent.find(".multipleSettings").slideUp(400, this.showMode.bind(this))
				}
				if (this.parent.find(".singleSettings:visible").length > 0) {
					this.parent.find(".singleSettings").slideUp(400, this.showMode.bind(this))
				}
				
				//Hide clock if needs to move
				if (oldMode == "single" || oldMode == "multiple") {
					this.parent.find(".timeColumn").slideUp(400)
				}

				//Set first calendar to single mode
				this.firstCalendar.setMode("single")
				//Tell second calendar which dates are valie
				this.secondCalendar.setFilter(function(x, y, date) {
					//Get the number of units
					let num = parseFloat(this.parent.find(".intervalNumber").val())
					let units = this.parent.find(".intervalUnit").val()

					//Anything in the past should be filtered out
					if (date < this.firstCalendar.date) {
						return true
					}
					
					//If the units are months and the days are different, remove it
					if (units == "months") {
						if(this.firstCalendar.date.date() != date.date()) {
							return true
						}
						//Otherwise, check if it's the right number of months away
						return date.diff(this.firstCalendar.date, "months") % num != 0
					}
					
					//Get difference in days
					let difference = date.diff(this.firstCalendar.date, "days")

					//If units are weeks, divide by 7 to get correct units
					if (units == "weeks") {
						difference /= 7
					}

					//Return whether the right number of units away
					if (difference % num == 0) {
						return false
					} else {
						return true
					}
				}.bind(this))
				//Render second calendar when first changes
				this.firstCalendar.setRipple(() => {
					this.secondCalendar.setNumbers()
				})
				
				break
			case "days":
				//Hide other settings
				if (this.parent.find(".intervalSettings:visible").length > 0) {
					this.parent.find(".intervalSettings").slideUp(400, this.showMode.bind(this))
				}
				if (this.parent.find(".multipleSettings:visible").length > 0) {
					this.parent.find(".multipleSettings").slideUp(400, this.showMode.bind(this))
				}
				if (this.parent.find(".singleSettings:visible").length > 0) {
					this.parent.find(".singleSettings").slideUp(400, this.showMode.bind(this))
				}

				//If needed, hide clock
				if (oldMode == "single" || oldMode == "multiple") {
					this.parent.find(".timeColumn").slideUp(400)
				}

				//Set first calendar to single mode
				this.firstCalendar.setMode("single")
				//Tell the second calendar how to filter
				this.secondCalendar.setFilter(function(x, y, date) {
					//Filter out anything earlier than the first date
					if (date < this.firstCalendar.date) {
						return true
					}
					
					//Check for the filter setting
					let filter = this.parent.find(".intervalFilter").val()
					//Get the checkbox corresponding to this
					let checkbox = this.parent.find(`.daysSettings :nth-child(${date.day() + 2}) input`)

					//Filter if wrong day
					if (!checkbox.prop("checked")) {
						return true
					}

					//If Nth filter mode, check if this is the wrong instance and filter out if so
					if (filter == "nth") {
						if (Math.ceil(date.date() / 7) != parseInt(this.parent.find(".weekNumber").text())) {
							return true
						}
					}
					
					//If Last filter mode, check if this is the last instance
					if (filter == "last") {
						if (date.daysInMonth() >= date.date() + 7) {
							return true
						}
					}
					
					//If alternating filter mode, check how many weeks between start and end
					if (filter == "alternating") {
						let startOfWeek1 = moment(this.firstCalendar.date).subtract(this.firstCalendar.date.weekday(), "days")
						let startOfWeek2 = moment(date).subtract(date.weekday(), "days")
						if (Math.round(startOfWeek2.diff(startOfWeek1, "weeks")) % 2 == 1) {
							return true
						}
					}
					
					return false
				}.bind(this))
				//Tell the first calendar to update this
				this.firstCalendar.setRipple(function(date) {
					//Stop disabling any checkboxes
					this.parent.find(".daysSettings label input").prop("disabled", false)
					
					//Feature removed because users were getting confused why they couldn't uncheck one box,
					// so we stopped disabling that box so they wouldn't be confused.
					// We were assuming that users would always set the first day first, but this isn't the case.
					//Disable the current day's checkboxes
					let checkbox = this.parent.find(`.daysSettings :nth-child(${date.day() + 2}) input`)
					//checkbox.prop("disabled", true)
					
					//This one we did keep, because it helped prevent mistakes without causing confusion
					//Checking the current day and triggering its event handler
					checkbox.prop("checked", true)
					checkbox.change()
					
					//Get the instance of this week and the text of it
					let rank = Math.ceil(date.date() / 7)
					let text = rank.toString()
					
					//Add the correct placement modifier - 1st, 2nd, 3rd, 4th...
					switch (rank) {
						case 1:
							text += "st"
							break
						case 2:
							text += "nd"
							break
						case 3:
							text += "rd"
							break
						default:
							text += "th"
							break
					}
					
					//Add final text
					text += " instance each month"
					//Update select option
					this.parent.find(".daysSettings .weekNumber").text(text)

					//If this is the last week, enable the last option.
					if (date.date() + 7 > date.daysInMonth()) {
						this.parent.find(".lastOption").removeClass("hidden")
					} else {
						if (this.parent.find(".intervalFilter").val() == "last") {
							this.parent.find(".intervalFilter").val("all")
						}
						this.parent.find(".lastOption").addClass("hidden")
					}

					//Render second calendar
					this.secondCalendar.setNumbers()
				}.bind(this))

				//Same as directly above, but run immediately instead of only on change
				let rank = Math.ceil(this.firstCalendar.date.date() / 7)
				
				let text = rank.toString()
				
				switch (rank) {
					case 1:
						text += "st"
						break
					case 2:
						text += "nd"
						break
					case 3:
						text += "rd"
						break
					default:
						text += "th"
						break
				}
				
				text += " instance each month"
				this.parent.find(".daysSettings .weekNumber").text(text)
				
				break
			case "multiple":
				//Hide second calendar and redundant label
				if (this.parent.find(".calendarColumn2:visible").length > 0) {
					this.parent.find(".firstLabel").slideUp()
					this.parent.find(".calendarColumn2").slideUp(400, this.showMode.bind(this))
				}

				//Hide other settings
				if (this.parent.find(".intervalSettings:visible").length > 0) {
					this.parent.find(".intervalSettings").slideUp(400, this.showMode.bind(this))
				}
				if (this.parent.find(".daysSettings:visible").length > 0) {
					this.parent.find(".daysSettings").slideUp(400, this.showMode.bind(this))
				}
				if (this.parent.find(".singleSettings:visible").length > 0) {
					this.parent.find(".singleSettings").slideUp(400, this.showMode.bind(this))
				}

				//If needed, hide the clock
				if (oldMode == "interval" || oldMode == "days") {
					this.parent.find(".timeColumn").slideUp(400)
				}

				//Set to multiple mode, remove event listeners
				this.firstCalendar.setMode("multiple")
				this.secondCalendar.setFilter(null)
				this.firstCalendar.setRipple(null)
				break
		}
	}
}

//Represents the calendar view
class calendar {
	//Constructor takes the DOM parent, whether to include the text input
	// (Always yes for this project, may be no in the future),
	// date to initially display, and the mode (Single or multiple)
	constructor(parent, includeString, date, mode, interactive) {
		//Save jQuery parent object
		this.parent = $(parent)
		//Initial HTML to add
		let html = `<div class="calendarMonth d-flex justify-content-between align-items-center">
			<button class="monthLeft btn btn-light">&#60;</button>
			<p class="monthLabel text-center align-middle my-0">Month</p>
			<button class="monthRight btn btn-light">&#62;</button>
		</div>
		<div class="calendarGrid p-0"></div>`
		//If told to, include text input
		if (includeString) {
			html = `<div class="mb-1">
				<input type="text" class="form-control dateStringInput">
			</div>
			<div class="firstCalendarContainer">` + html + `</div>`
		}
		//Add this element's HTML to parent
		this.parent.append(html)
		//Initialize date, default to new Moment instance
		this.date = date ? moment(date) : moment()
		//Set all smaller units to 0
		this.date.milliseconds(0)
		this.date.seconds(0)
		this.date.minutes(0)
		this.date.hours(0)
		
		//Initialize dates
		this.dates = []
		//Not currently used, but may be using later
		//this.considering = []
		
		//Set date being displayed to current date by default
		this.displayDate = moment(this.date)
		//Set mode to supplied mode, or single if none
		this.mode = mode ? mode : "single"
		//Set interactive to supplied value, or true if none
		this.interactive = interactive == undefined ? true : undefined

		//Create grid of buttons
		this.buildGrid(date)
		//Set buttons to move months
		this.parent.find(".monthLeft").click(function() {
			this.displayDate.subtract(1, "M")
			this.setNumbers()
		}.bind(this))
		this.parent.find(".monthRight").click(function() {
			this.displayDate.add(1, "M")
			this.setNumbers()
		}.bind(this))
		
		//Set the text input to the current date
		this.parent.find(".dateStringInput").val(this.date.format("MM/DD/YYYY"))
		//When user types a date, if it's valid, set that date and say it's valid
		this.parent.find(".dateStringInput").change(this, function(evt) {
			let date = moment($(this).val())
			if (date.isValid()) {
				evt.data.setDate(date)
				$(this).removeClass("is-invalid")
			} else {
				$(this).addClass("is-invalid")
			}
		})
		//Used to have a scroll listener. Removed because people kept accidentally scrolling calendar
		/*
		this.parent.on("mousewheel", (evt) => {
			evt.preventDefault()
			if (evt.originalEvent.wheelDelta > 0) {
				this.displayDate.subtract(1, "M")
				this.setNumbers()
			} else {
				this.displayDate.add(1, "M")
				this.setNumbers()
			}
		})*/
	}
	
	//Set filter and re-render
	setFilter(func) {
		this.filterFunction = func
		this.setNumbers()
	}
	
	//Set ripple function and call it
	setRipple(func) {
		this.rippleFunction = func
		if (this.rippleFunction) {
			this.rippleFunction(this.date)
		}
	}

	//Put in all the HTML button elements
	buildGrid() {
		for (var i = 0; i < 6; i++) {
			let row = $('<div class="d-flex flex-nowrap"></div>')
			for (var j = 0; j < 7; j++) {
				let cell = $(`<button class="rounded-0 m-0 py-1 equalWidth text-center silentButton"${this.interactive ? "" : ' style="cursor: default;"'}>${i * 7 + j}</btn>`)
				row.append(cell)
			}
			this.parent.find(".calendarGrid").append(row)
		}
		//Render
		this.setNumbers()
	}

	//"Render" function
	setNumbers() {
		//Get the current weekday of the date being shown
		let x = this.displayDate.weekday()
		//Get the Y value on the calendar of the date being shown
		let y = Math.ceil(this.displayDate.date() / 7) - 1
		if (x < (this.displayDate.date() - 1) % 7) {
			y += 1
		}
		//Get the grid
		let grid = this.parent.find(".calendarGrid")
		//For every cell
		for (var i = 0; i < 6; i++) {
			for (var j = 0; j < 7; j++) {
				//Make a new date
				let toSet = moment(this.displayDate)
				//Get this cell
				let cell = this.getCell(j, i)
				
				//Offset from the date being shown by the proper amount
				toSet.add((i - y) * 7 + (j - x), 'd')
				//If this date is outside the current month, grey it out. Else, reset it
				if (toSet.month() != this.displayDate.month()) {
					cell.addClass("greyButton")
				} else {
					cell.removeClass("greyButton")
				}
				
				//If this is a selected day, reflect that. Else, reset it
				if (this.mode == "single" && toSet.diff(this.date) == 0
					|| this.mode == "multiple" && this.hasDate(toSet)) {
					cell.addClass("buttonSelected")
				} else {
					cell.removeClass("buttonSelected")
				}
				if (this.interactive) {
					//Remove listeners
					cell.off()
					//Add click listeners bound to select this day
					cell.mousedown({date: toSet, parent: this, x: j, y: i}, function(evt) {
						//If disabled, ignore
						if ($(this).prop("disabled")) return
						//If in multiple mode and this is selected, unselect it. If it's not selected, select it.
						if (evt.data.parent.mode == "multiple") {
							if (evt.data.parent.hasDate(evt.data.date)) {
								evt.data.parent.removeDate(evt.data.date)
							} else {
								evt.data.parent.addDate(evt.data.date)
							}
						} else {
							//If in single mode, set the selected date to this
							evt.data.parent.setDate(evt.data.date)
						}
					})
					//If hovered while button is being held in multiple mode, toggle select
					//Allows for quickly selecting multiple close days
					cell.hover((evt) => {
						if (this.mode == "single") return
						if (evt.buttons == 1) {
							if (this.hasDate(toSet)) {
								this.removeDate(toSet)
							} else {
								this.addDate(toSet)
							}
						}
					}, (evt) => {}) //The second listener is useless, but keeps the first from double-firing. Thanks, jQuery!
				}

				//Set the cell text
				cell.text(toSet.date())
				//If this has a filter function and it filters this, disable it
				if (this.filterFunction && this.filterFunction(x, y, toSet)) {
					cell.addClass("disabledButton")
					cell.prop("disabled", true)
					cell.removeClass("historyButton")
				} else {
					//Else reset it
					cell.removeClass("disabledButton")
					if (this.interactive) {
						cell.prop("disabled", false)
					}
					//If this has a filter function and this is before the selected date, it's going to have a message sent, so reflect that by turning green. Else reset that
					if (this.filterFunction && toSet < this.date) {
						cell.addClass("historyButton")
					} else {
						cell.removeClass("historyButton")
					}
				}
			}
		}
		//Set the correct label text
		this.parent.find('.monthLabel').text(this.displayDate.format("MMMM YYYY"))
	}

	//Set the current date
	setDate(date) {
		//Set the date
		this.date = moment(date)
		//Set the display date (Useful if the date is not in the current month)
		this.displayDate = moment(this.date)
		//Remove the invalid warning
		this.parent.find(".dateStringInput").removeClass("is-invalid")
		//Re-render
		this.setNumbers()
		//I left this comment here initially and I have no idea what it means:
			//Change this for hosting
		//I think it means that this assumes an American point of view, so change it before it goes live?
		// Too late, but GroupMe's audience is overwhelmingly American, so I don't think many people will care
		// Are you reading this far, Professor? If so, please let me know, because I've spent so long
		// in this code that I feel lost sometimes and I want to know someone else is lost with me
		this.parent.find(".dateStringInput").val(this.date.format("MM/DD/YYYY"))
		if (this.rippleFunction) {
			this.rippleFunction(this.date)
		}
	}
	
	//Check if a date is selected
	hasDate(date) {
		//Timestamp looking for
		let looking = date.valueOf()
		//Loop through, return if we find it, else return false
		for (var i in this.dates) {
			if (this.dates[i] == looking) {
				return true
			}
		}
		return false
	}

	//Add the date to the list of dates and render
	addDate(date) {
		this.dates.push(date.valueOf())
		this.parent.find(".dateStringInput").val(date.format("MM/DD/YYYY"))
		this.setNumbers()
	}

	//Remove the date from the list of dates and render
	removeDate(date) {
		this.dates = this.dates.filter(time => date.valueOf() != time)
		this.setNumbers()
	}
	
	//Return the cell with these coordinates
	//Wait, I never use this more than once! Why did I make it a function?
	getCell(x, y) {
		return this.parent.find(`.calendarGrid :nth-child(${y+1}) :nth-child(${x+1})`)
	}
	
	//Switch between single and multiple and re-render
	setMode(mode) {
		if (mode == this.mode) {
			return
		}
		this.mode = mode
		this.setNumbers()
	}
}

//Clock class
class clock {
	//Constructor only takes the parent argument
	constructor(parent) {
		//Save parent jQuery object
		this.parent = $(parent)
		//Add some HTML to parent
		this.parent.append(`<div class="mb-1">
			<div class="form-control timeStringInput">
				<button class="hoursButton silentButton px-2">12</button>:<button class="minutesButton silentButton px-2">00</button><button class="amPmButton silentButton px-2">AM</button>
			</div>
		</div>
		<div class="clocksWrapper p-1 my-3">
			<div class="clocksWrapper2">
				<div class="hoursClockWrapper">
				</div>
				<div class="minutesClockWrapper" style="display: none;">
				</div>
			</div>
		</div>`)
		//Load some SVG files which are the clocks
		this.parent.find(".hoursClockWrapper").load("/hoursPicker.svg", this.loadHours.bind(this))
		this.parent.find(".minutesClockWrapper").load("/minutesPicker.svg", this.loadMinutes.bind(this))

		//Each load increments this. Used so that the latter load runs the render method
		this.ready = -1
		//Set the current number of hours and minutes and AM/PM
		this.hours = (new Date()).getHours()
		this.minutes = (new Date()).getMinutes()
		this.pm = (this.hours > 11)
		//Used for typing
		this.minutesBuffer = ""
		
		//Show the respective clock elements when the text elements are clicked
		this.parent.find(".hoursButton").click(this.showHours.bind(this))
		this.parent.find(".minutesButton").click(this.showMinutes.bind(this))
		
		//Lets users type the time
		// I'm actually really proud of this, even if it's not perfect
		this.parent.find(".hoursButton").keypress({parent: this}, function(evt) {
			switch (parseInt(evt.key)) {
				case 0:
					//If previously typed 1, set 10 and switch to minutes view
					if (evt.data.parent.hours % 12 == 1) {
						evt.data.parent.setHour(10)
						evt.data.parent.showMinutes()
						//Switch to minutes button
						evt.data.parent.parent.find(".minutesButton").click()
						evt.data.parent.parent.find(".minutesButton").focus()
					} else {
						//Set to 12am, but don't assume they're done
						evt.data.parent.setHour(0)
					}
					break
				case 1:
					//If previously typed 1, set 11 and switch to minutes
					if (evt.data.parent.hours % 12 == 1) {
						evt.data.parent.setHour(11)
						evt.data.parent.showMinutes()
						//Switch to minutes button
						evt.data.parent.parent.find(".minutesButton").click()
						evt.data.parent.parent.find(".minutesButton").focus()
					} else {
						//Set to 1 otherwise, but don't assume they're done
						evt.data.parent.setHour(1)
					}
					break
				case 2:
					//If previously typed 1, set hours to 12 and go to minutes
					if (evt.data.parent.hours % 12 == 1) {
						evt.data.parent.setHour(12)
						evt.data.parent.showMinutes()
						//Switch to minutes
						evt.data.parent.parent.find(".minutesButton").click()
						evt.data.parent.parent.find(".minutesButton").focus()
					} else {
						//Set to 2 otherwise
						evt.data.parent.setHour(2)
						evt.data.parent.showMinutes()
						evt.data.parent.parent.find(".minutesButton").click()
						evt.data.parent.parent.find(".minutesButton").focus()
					}
					break
				case 3:
				case 4:
				case 5:
				case 6:
				case 7:
				case 8:
				case 9:
					//Set to typed number and switch to minutes
					evt.data.parent.setHour(parseInt(evt.key))
					evt.data.parent.parent.find(".minutesButton").click()
					evt.data.parent.parent.find(".minutesButton").focus()
					break
			}
		})
		//Typing for minutes
		this.parent.find(".minutesButton").keypress({parent: this}, function(evt) {
			let input = parseInt(evt.key)
			//If valid int
			if (!isNaN(input)) {
				//Get current buffer
				let currentBuffer = parseInt(evt.data.parent.minutesBuffer)
				//If buffer is between 6 and 9, this would be greater than 59. Assume the user is starting a new number from scratch
				if (currentBuffer < 10 && currentBuffer > 5) evt.data.parent.minutesBuffer = ""
				//If already double-digits, assume the user is starting a new number from scratch
				if (currentBuffer > 9) evt.data.parent.minutesBuffer = ""
				//Add the input to the buffer (Multiplies current by 10, which is good)
				evt.data.parent.minutesBuffer += input
				//Set minutes
				evt.data.parent.setMinutes(parseInt(evt.data.parent.minutesBuffer))
			} else {
				//If typing A
				if (evt.key == "a" || evt.key == "A") {
					//Select the AM/PM button
					evt.data.parent.parent.find(".hoursButton").removeClass("buttonSelected")
					evt.data.parent.parent.find(".minutesButton").removeClass("buttonSelected")
					evt.data.parent.parent.find(".amPmButton").addClass("buttonSelected")
					evt.data.parent.parent.find(".amPmButton").focus()
					
					//Set AM
					evt.data.parent.pm = false
					evt.data.parent.setHour(evt.data.parent.hours)

					//Render (Redundant? IDK but I'm afraid to remove it so close to the deadline)
					evt.data.parent.showTime()
				} else if (evt.key == "p" || evt.key == "P") {
					//Select the AM/PM button
					evt.data.parent.parent.find(".hoursButton").removeClass("buttonSelected")
					evt.data.parent.parent.find(".minutesButton").removeClass("buttonSelected")
					evt.data.parent.parent.find(".amPmButton").addClass("buttonSelected")
					evt.data.parent.parent.find(".amPmButton").focus()
					
					//Set PM
					evt.data.parent.pm = true
					evt.data.parent.setHour(evt.data.parent.hours + 12)
					
					//Render
					evt.data.parent.showTime()
				}
			}
		})
		//AM/PM typing
		this.parent.find(".amPmButton").keypress((evt) => {
			//Set AM
			if (evt.key == "a" || evt.key == "A") {
				this.pm = false
				this.setHour(this.hours)
			//Set PM
			} else if (evt.key == "p" || evt.key == "P") {
				this.pm = true
				this.setHour(this.hours + 12)
			}
		})
		
		//When hours are selected, show hours GUI
		this.parent.find(".hoursButton").focus({parent: this}, function(evt) {
			evt.data.parent.showHours()
		})
		//When minutes are selected, reset the buffer and show minutes GUI
		this.parent.find(".minutesButton").focus({parent: this}, function(evt) {
			evt.data.parent.minutesBuffer = ""
			evt.data.parent.showMinutes()
		})
		//When AM/PM is clicked
		this.parent.find(".amPmButton").click(function() {
			//Toggle AM/PM and switch
			this.pm = !this.pm
			if (this.pm) {
				this.setHour(this.hours + 12) //It does mod 12 in this function, so this is useless, but doing it like this makes me happy :)
			} else {
				this.setHour(this.hours)
			}
			//Select the AM/PM button
			this.parent.find(".hoursButton").removeClass("buttonSelected")
			this.parent.find(".minutesButton").removeClass("buttonSelected")
			this.parent.find(".amPmButton").addClass("buttonSelected")
			//Render
			this.showTime()
		}.bind(this))
	}

	//Render
	showTime() {
		//Okay, so basically, the way I achieve the spinner look where it makes stuff it hovers blue with white text is
		// that I have a second whole clock with that color scheme, and it's masked off to only be visible over the spinner. I'm so good at coding, please give me a good grade
		//Get the hours spinner and spin it according to the hours value
		let mask = this.parent.find(`.hoursClockWrapper #spinner`)
		mask.attr("transform", `rotate(${this.hours % 12 * 30} 66.146 66.146)`) 
		//Get the minutes spinner and point it to the right place
		mask = this.parent.find(`.minutesClockWrapper #spinner2`)
		mask.attr("transform", `rotate(${this.minutes * 6} 66.146 66.146)`) 
		//Update button text
		this.parent.find(".hoursButton").text((this.hours % 12 == 0 ? 12 : this.hours % 12).toString().padStart(2, "0"))
		this.parent.find(".minutesButton").text(this.minutes.toString().padStart(2, "0"))
		this.parent.find(".amPmButton").text(this.pm ? "PM" : "AM")
		//Update the mobile text picker
		//Python may have some great one-liners, but so does JS. And C if you remove all the whitespace.
		this.parent.parent().find(".mobileTimePicker").val(this.hours.toString().padStart(2, "0") + ":" + this.minutes.toString().padStart(2, "0"))
	}

	//Switch to hours view
	showHours() {
		//Select hours button visually
		this.parent.find(".hoursButton").addClass("buttonSelected")
		this.parent.find(".minutesButton").removeClass("buttonSelected")
		this.parent.find(".amPmButton").removeClass("buttonSelected")
		//Show the hours clock, not the minutes clock
		this.parent.find(".hoursClockWrapper:hidden").fadeIn(200)
		this.parent.find(".minutesClockWrapper").fadeOut(200)
	}
	
	//Switch to minutes view
	showMinutes() {
		//Select minutes button visually
		this.parent.find(".hoursButton").removeClass("buttonSelected")
		this.parent.find(".minutesButton").addClass("buttonSelected")
		this.parent.find(".amPmButton").removeClass("buttonSelected")
		//Show the minutes clock, not the hours clock
		this.parent.find(".hoursClockWrapper").fadeOut(200)
		this.parent.find(".minutesClockWrapper:hidden").fadeIn(200)
	}

	//Set the hours value and render
	setHour(hour) {
		this.hours = hour % 12
		if (this.pm) {
			this.hours += 12
		}
		this.showTime()
	}

	//Set the minutes and render
	setMinutes(minutes) {
		if (minutes == this.minutes) return
		this.minutes = minutes
		//Wait why did I do this here too? I have no clue but it's too close to the due date to try removing it
		let mask = this.parent.find(`.minutesClockWrapper #spinner`)
		mask.css("transform", `rotate({minutes * 6} 66.146 66.146)`)
		this.showTime()
	}

	//Called when hours SVG is loaded
	loadHours() {
		//For each button on the hours page
		for (var i = 0; i < 12; i++) {
			//Get the button
			let button = this.parent.find(`.hoursClockWrapper #buttons :nth-child(${i+1})`)
			//If button is being held over this, set hours to this
			// Allows to support dragging around the wheel
			button.hover(function(hour, evt) {
				evt.preventDefault()
				if (evt.buttons == 1) {
					this.setHour(hour)
				}
			}.bind(this, i + 1))
			//If clicked, set hour to this
			button.mousedown(function(hour, evt) {
				evt.preventDefault()
				this.setHour(hour)
			}.bind(this, i + 1))
			//Switch to minutes when done dragging
			button.mouseup(function(evt) {
				evt.preventDefault()
				this.showMinutes()
			}.bind(this))
		}
		//Say this is loaded
		this.ready++
		//If both are loaded, render
		if (this.ready == 1) {
			this.showTime()
		}
	}
	
	loadMinutes() {
		//Get the single button
		let button = this.parent.find(`.minutesClockWrapper #buttons2 :nth-child(1)`)
		//Remove current listeners if any
		button.off("mousemove")
		button.off("mousedown")
		//Set the ancestor arg
		let ancestor = this.parent.find(`.minutesClockWrapper`)
		//Set listeners for moving the mouse and clicking the mouse
		button.mousemove({parent: this, element: button, ancestor: ancestor}, mouseDrag)
		button.mousedown({parent: this, element: button, ancestor: ancestor}, mouseDrag)
		//Say this is loaded
		this.ready++
		//If both are loaded, render
		if (this.ready == 1) {
			this.showTime()
		}
	}
}

function mouseDrag(evt) {
	//DANG IT FIREFOX STOP PICKING UP IMAGES
	evt.preventDefault()
	//If left button is held
	if (evt.buttons == 1) {
		//Get the X and Y values relative to the center of the spinner
		//These lines are way more complicated because Safari has a decade-old bug with SVGs in HTML where it doesn't give the right offset
		// So frustrating that Apple doesn't seem to care enough about web developers to not break everything. I had to keep changing what
		// I used because Safari on desktop doesn't support stuff that everything else does, like jQuery's offset with SVGs, or date/time inputs natively
		let x = evt.pageX - (evt.data.element[1].getBoundingClientRect().left + evt.data.element[1].ownerDocument.defaultView.pageXOffset) - (evt.data.ancestor.width() / 2)
		let y = -evt.pageY + (evt.data.element[1].getBoundingClientRect().top + evt.data.element[1].ownerDocument.defaultView.pageYOffset) + (evt.data.ancestor.height() / 2)
		let angle = Math.round((Math.atan2(x, y) * 180 / Math.PI + 360) / 6) % 60
		evt.data.parent.setMinutes(angle)
	}
}

//<-- I can't believe I wrote this many lines of code
// for this project, WOW. Please be proud of me
