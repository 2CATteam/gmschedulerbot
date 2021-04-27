class dateTimePicker {
	constructor(parent, vertical) {
		this.parent = $(parent)
		if (vertical) {
			$(parent).load("hci_mobile.html")
		} else {
			$(parent).load("hci.html", this.load.bind(this))
		}
	}
	
	load() {
		this.parent.find(".dateStringInput").first().val(moment().format('L'))
		this.firstCalendar = new calendar(this.parent.find(".calendarColumn"), true)
		this.time = new clock(this.parent.find(".timeColumn"))
		this.secondCalendar = new calendar(this.parent.find(".calendarColumn2"), true)
		
		this.setMode("single")
		this.parent.find(".repeatTypeSelect").change({parent: this}, function(evt) {
			evt.data.parent.setMode($(this).val())
		})
	}
	
	getTimes() {
		let toReturn = [this.getFirst()]
		return toReturn
	}
	
	getFirst() {
		let toReturn = moment(this.firstCalendar.date)
		toReturn.minutes(this.time.minutes)
		toReturn.hours(this.time.hours)
		return toReturn.valueOf()
	}
	
	showMode() {
		this.parent.find(".settingsColumn").children().addClass("hidden")
		this.parent.find(`.${this.mode}Settings`).removeClass("hidden")
		this.parent.find(`.${this.mode}Settings`).slideDown()
		if (this.parent.find(".calendarColumn2:hidden").length > 0 && (this.mode === "interval" || this.mode === "days")) {
			this.parent.find(".firstLabel").slideDown()
			this.parent.find(`.calendarColumn2`).removeClass("hidden")
			this.parent.find(".calendarColumn2").slideDown()
		}
	}
	
	setMode(mode) {
		this.mode = mode
		switch(mode) {
			case "single":
				if (this.parent.find(".calendarColumn2:visible").length > 0) {
					this.parent.find(".firstLabel").slideUp()
					this.parent.find(".calendarColumn2").slideUp(400, this.showMode.bind(this))
				}
				
				if (this.parent.find(".intervalSettings:visible").length > 0) {
					this.parent.find(".intervalSettings").slideUp(400, this.showMode.bind(this))
				}
				if (this.parent.find(".daysSettings:visible").length > 0) {
					this.parent.find(".daysSettings").slideUp(400, this.showMode.bind(this))
				}
				if (this.parent.find(".multipleSettings:visible").length > 0) {
					this.parent.find(".multipleSettings").slideUp(400, this.showMode.bind(this))
				}
				this.firstCalendar.setMode("single")
				break
			case "interval":
				if (this.parent.find(".daysSettings:visible").length > 0) {
					this.parent.find(".daysSettings").slideUp(400, this.showMode.bind(this))
				}
				if (this.parent.find(".multipleSettings:visible").length > 0) {
					this.parent.find(".multipleSettings").slideUp(400, this.showMode.bind(this))
				}
				if (this.parent.find(".singleSettings:visible").length > 0) {
					this.parent.find(".singleSettings").slideUp(400, this.showMode.bind(this))
				}
				
				this.firstCalendar.setMode("single")
				break
			case "days":
				if (this.parent.find(".intervalSettings:visible").length > 0) {
					this.parent.find(".intervalSettings").slideUp(400, this.showMode.bind(this))
				}
				if (this.parent.find(".multipleSettings:visible").length > 0) {
					this.parent.find(".multipleSettings").slideUp(400, this.showMode.bind(this))
				}
				if (this.parent.find(".singleSettings:visible").length > 0) {
					this.parent.find(".singleSettings").slideUp(400, this.showMode.bind(this))
				}
				
				this.firstCalendar.setMode("single")
				break
			case "multiple":
				if (this.parent.find(".calendarColumn2:visible").length > 0) {
					this.parent.find(".firstLabel").slideUp()
					this.parent.find(".calendarColumn2").slideUp(400, this.showMode.bind(this))
				}
				
				if (this.parent.find(".intervalSettings:visible").length > 0) {
					this.parent.find(".intervalSettings").slideUp(400, this.showMode.bind(this))
				}
				if (this.parent.find(".daysSettings:visible").length > 0) {
					this.parent.find(".daysSettings").slideUp(400, this.showMode.bind(this))
				}
				if (this.parent.find(".singleSettings:visible").length > 0) {
					this.parent.find(".singleSettings").slideUp(400, this.showMode.bind(this))
				}
				
				this.firstCalendar.setMode("multiple")
				break
		}
	}
}

class calendar {
	constructor(parent, includeString, date, mode) {
		this.parent = $(parent)
		let html = `<div class="calendarMonth d-flex justify-content-between align-items-center">
			<button class="monthLeft btn btn-light">&#60;</button>
			<p class="monthLabel text-center align-middle my-0">Month</p>
			<button class="monthRight btn btn-light">&#62;</button>
		</div>
		<div class="calendarGrid p-0"></div>`
		if (includeString) {
			html = `<div class="mb-1">
				<input type="text" class="form-control dateStringInput">
			</div>
			<div class="firstCalendarContainer">` + html + `</div>`
		}
		this.parent.append(html)
		this.date = date ? moment(date) : moment()
		this.date.milliseconds(0)
		this.date.seconds(0)
		this.date.minutes(0)
		this.date.hours(0)
		
		this.displayDate = moment(this.date)
		
		this.mode = mode ? mode : "single"
		
		this.buildGrid(date)
		this.parent.find(".monthLeft").click(function() {
			this.displayDate.subtract(1, "M")
			this.setNumbers()
		}.bind(this))
		this.parent.find(".monthRight").click(function() {
			this.displayDate.add(1, "M")
			this.setNumbers()
		}.bind(this))
		this.parent.find(".dateStringInput").val(this.date.format("MM/DD/YYYY"))
		this.parent.find(".dateStringInput").change(this, function(evt) {
			let date = moment($(this).val())
			if (date.isValid()) {
				evt.data.setDate(date)
			}
		})
	}
	
	setFilter(func) {
		this.filterFunction = func
		this.setNumbers()
	}
	
	buildGrid() {
		for (var i = 0; i < 6; i++) {
			let row = $('<div class="d-flex flex-nowrap"></div>')
			for (var j = 0; j < 7; j++) {
				let cell = $(`<button class="rounded-0 m-0 py-1 equalWidth text-center silentButton">${i * 7 + j}</btn>`)
				row.append(cell)
			}
			this.parent.find(".calendarGrid").append(row)
		}
		this.setNumbers()
	}
	
	setNumbers() {
		let x = this.displayDate.weekday()
		let y = Math.ceil(this.displayDate.date() / 7) - 1
		if (x < (this.displayDate.date() - 1) % 7) {
			y += 1
		}
		let grid = this.parent.find(".calendarGrid")
		for (var i = 0; i < 6; i++) {
			for (var j = 0; j < 7; j++) {
				let toSet = moment(this.displayDate)
				let cell = this.getCell(j, i)
				toSet.add((i - y) * 7 + (j - x), 'd')
				if (toSet.month() != this.displayDate.month()) {
					cell.addClass("greyButton")
				} else {
					cell.removeClass("greyButton")
				}
				if (y === i && x === j) {
					cell.addClass("buttonSelected")
				} else {
					cell.removeClass("buttonSelected")
				}
				cell.off()
				cell.mousedown({date: toSet, parent: this}, function(evt) {
					evt.data.parent.setDate(evt.data.date)
				})
				cell.text(toSet.date())
			}
		}
		this.parent.find('.monthLabel').text(this.date.format("MMMM"))
	}
	
	setDate(date) {
		this.date = moment(date)
		this.displayDate = moment(this.date)
		this.setNumbers()
		//Change this for hosting
		this.parent.find(".dateStringInput").val(this.date.format("MM/DD/YYYY"))
	}
	
	getCell(x, y) {
		return this.parent.find(`.calendarGrid :nth-child(${y+1}) :nth-child(${x+1})`)
	}
	
	setMode(mode) {
		if (mode == this.mode) {
			return
		}
	}
}

class clock {
	constructor(parent) {
		this.parent = $(parent)
		this.parent.append(`<div class="mb-1">
			<div class="form-control timeStringInput">
				<button class="hoursButton silentButton px-2">12</button>:<button class="minutesButton silentButton px-2">00</button><button class="amPmButton silentButton px-2">AM</button>
			</div>
		</div>
		<div class="clocksWrapper p-1 my-3">
			<div class="hoursClockWrapper">
			</div>
			<div class="minutesClockWrapper" style="display: none;">
			</div>
		</div>`)
		this.parent.find(".hoursClockWrapper").load("hoursPicker.svg", this.loadHours.bind(this))
		this.parent.find(".minutesClockWrapper").load("minutesPicker.svg", this.loadMinutes.bind(this))
		
		this.ready = -1
		this.hours = (new Date()).getHours()
		this.minutes = (new Date()).getMinutes()
		this.pm = (this.hours > 11)
		this.minutesBuffer = ""
		
		this.parent.find(".hoursButton").click(this.showHours.bind(this))
		this.parent.find(".minutesButton").click(this.showMinutes.bind(this))
		this.parent.find(".hoursButton").keypress({parent: this}, function(evt) {
			switch (parseInt(evt.key)) {
				case 0:
					if (evt.data.parent.hours % 12 == 1) {
						evt.data.parent.setHour(10)
						evt.data.parent.showMinutes()
						evt.data.parent.parent.find(".minutesButton").click()
						evt.data.parent.parent.find(".minutesButton").focus()
					} else {
						evt.data.parent.setHour(0)
					}
					break
				case 1:
					if (evt.data.parent.hours % 12 == 1) {
						evt.data.parent.setHour(11)
						evt.data.parent.showMinutes()
						evt.data.parent.parent.find(".minutesButton").click()
						evt.data.parent.parent.find(".minutesButton").focus()
					} else {
						evt.data.parent.setHour(1)
					}
					break
				case 2:
					if (evt.data.parent.hours % 12 == 1) {
						evt.data.parent.setHour(12)
						evt.data.parent.showMinutes()
						evt.data.parent.parent.find(".minutesButton").click()
						evt.data.parent.parent.find(".minutesButton").focus()
					} else {
						evt.data.parent.setHour(2)
						evt.data.parent.showMinutes()
					}
					break
				case 3:
				case 4:
				case 5:
				case 6:
				case 7:
				case 8:
				case 9:
					evt.data.parent.setHour(parseInt(evt.key))
					break
			}
		})
		this.parent.find(".minutesButton").keypress({parent: this}, function(evt) {
			let input = parseInt(evt.key)
			if (!isNaN(input)) {
				let currentBuffer = parseInt(evt.data.parent.minutesBuffer)
				if (currentBuffer < 10 && currentBuffer > 5) evt.data.parent.minutesBuffer = ""
				if (currentBuffer > 9) evt.data.parent.minutesBuffer = ""
				evt.data.parent.minutesBuffer += input
				evt.data.parent.setMinutes(parseInt(evt.data.parent.minutesBuffer))
			}
		})
		this.parent.find(".amPmButton").keypress({parent: this}, function(evt) {
			if (evt.key == "a" || evt.key == "A") {
				this.pm = false
				this.setHour(this.hours)
			} else if (evt.key == "p" || evt.key == "P") {
				this.pm = true
				this.setHour(this.hours + 12)
			}
		})
		
		this.parent.find(".hoursButton").focus({parent: this}, function(evt) {
			evt.data.parent.showHours()
		})
		this.parent.find(".minutesButton").focus({parent: this}, function(evt) {
			evt.data.parent.minutesBuffer = ""
			evt.data.parent.showMinutes()
		})
		
		this.parent.find(".amPmButton").click(function() {
			this.pm = !this.pm
			if (this.pm) {
				this.setHour(this.hours + 12)
			} else {
				this.setHour(this.hours)
			}
			this.parent.find(".hoursButton").removeClass("buttonSelected")
			this.parent.find(".minutesButton").removeClass("buttonSelected")
			this.parent.find(".amPmButton").addClass("buttonSelected")
			this.showTime()
		}.bind(this))
	}
	
	showTime() {
		let mask = this.parent.find(`.hoursClockWrapper #spinner`)
		mask.attr("transform", `rotate(${this.hours % 12 * 30} 66.146 66.146)`) 
		mask = this.parent.find(`.minutesClockWrapper #spinner2`)
		mask.attr("transform", `rotate(${this.minutes * 6} 66.146 66.146)`) 
		this.parent.find(".hoursButton").text((this.hours % 12 == 0 ? 12 : this.hours % 12).toString().padStart(2, "0"))
		this.parent.find(".minutesButton").text(this.minutes.toString().padStart(2, "0"))
		this.parent.find(".amPmButton").text(this.pm ? "PM" : "AM")
	}
	
	showHours() {
		this.parent.find(".hoursButton").addClass("buttonSelected")
		this.parent.find(".minutesButton").removeClass("buttonSelected")
		this.parent.find(".amPmButton").removeClass("buttonSelected")
		this.parent.find(".hoursClockWrapper:hidden").fadeIn(200)
		this.parent.find(".minutesClockWrapper").fadeOut(200)
	}
	
	showMinutes() {
		this.parent.find(".hoursButton").removeClass("buttonSelected")
		this.parent.find(".minutesButton").addClass("buttonSelected")
		this.parent.find(".amPmButton").removeClass("buttonSelected")
		this.parent.find(".hoursClockWrapper").fadeOut(200)
		this.parent.find(".minutesClockWrapper:hidden").fadeIn(200)
	}
	
	setHour(hour) {
		this.hours = hour % 12
		if (this.pm) {
			this.hours += 12
		}
		this.showTime()
	}
	
	setMinutes(minutes) {
		if (minutes == this.minutes) return
		this.minutes = minutes
		let mask = this.parent.find(`.minutesClockWrapper #spinner`)
		mask.css("transform", `rotate({minutes * 6} 66.146 66.146)`)
		this.showTime()
	}
	
	loadHours() {
		for (var i = 0; i < 12; i++) {
			let button = this.parent.find(`.hoursClockWrapper #buttons :nth-child(${i+1})`)
			button.hover(function(hour, evt) {
				if (evt.buttons == 1) {
					this.setHour(hour)
				}
			}.bind(this, i + 1))
			button.mousedown(function(hour, evt) {
				this.setHour(hour)
			}.bind(this, i + 1))
			button.mouseup(function() {
				this.showMinutes()
			}.bind(this))
		}
		this.ready++
		if (this.ready == 1) {
			this.showTime()
		}
	}
	
	loadMinutes() {
		let button = this.parent.find(`.minutesClockWrapper #buttons2 :nth-child(1)`)
		button.off("mousemove")
		button.off("mousedown")
		let ancestor = this.parent.find(`.minutesClockWrapper`)
		button.mousemove({parent: this, element: button, ancestor: ancestor}, mouseDrag)
		button.mousedown({parent: this, element: button, ancestor: ancestor}, mouseDrag)
		this.ready++
		if (this.ready == 1) {
			this.showTime()
		}
	}
}

function mouseDrag(evt) {
	if (evt.buttons == 1) {
		let x = evt.pageX - evt.data.element.offset().left - (evt.data.ancestor.width() / 2)
		let y = -evt.pageY + evt.data.element.offset().top + (evt.data.ancestor.height() / 2)
		let angle = Math.round((Math.atan2(x, y) * 180 / Math.PI + 360) / 6) % 60
		evt.data.parent.setMinutes(angle)
	}
}