class dateTimePicker {
	constructor(parent) {
		this.parent = $(parent)
		$(parent).load("/hci.html", this.load.bind(this))
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
		
		this.parent.find(".intervalSettings .intervalNumber").change(function() {
			this.secondCalendar.setNumbers()
		}.bind(this))
		this.parent.find(".intervalSettings .intervalUnit").change(function() {
			this.secondCalendar.setNumbers()
		}.bind(this))
		
		this.parent.find(".daysSettings label input").click(function() {
			this.secondCalendar.setNumbers()
		}.bind(this))
		
		this.parent.find(".daysSettings select").change(function() {
			this.secondCalendar.setNumbers()
		}.bind(this))
		
		this.showRepeat = false
		
		this.parent.find(".showHideRepeat").click(() => {
			if (!this.showRepeat) {
				//this.parent.find(".repeatSelect").removeClass("hidden")
				this.parent.find(".repeatSelect").slideDown()
				//this.parent.find(".settingsColumn").removeClass("hidden")
				this.parent.find(".settingsColumn").slideDown()
				this.showRepeat = true
				this.parent.find(".showHideRepeat").text("Hide repeat options")
				this.parent.find(".showHideRepeat").removeClass("animationFixer")
			} else {
				this.parent.find(".repeatSelect").slideUp(function() {
					//$(this).addClass("hidden")
				})
				this.parent.find(".settingsColumn").slideUp(function() {
					//$(this).addClass("hidden")
					$(this).parent().find(".showHideRepeat").addClass("animationFixer")
				})
				this.showRepeat = false
				this.parent.find(".showHideRepeat").text("Show repeat options")
			}
		})
		
		$(window).resize(() => {
			if (this.mobile()) {
				this.parent.find(".mobileTime").removeClass("hidden")
				this.parent.find(".timeColumn").addClass("hidden")
			} else {
				this.parent.find(".mobileTime").addClass("hidden")
				this.parent.find(".timeColumn").removeClass("hidden")
			}
		})
		if (this.mobile()) {
			this.parent.find(".mobileTime").removeClass("hidden")
			this.parent.find(".timeColumn").addClass("hidden")
		} else {
			this.parent.find(".mobileTime").addClass("hidden")
			this.parent.find(".timeColumn").removeClass("hidden")
		}
		
		this.parent.find(".mobileTimePicker").val(moment().format("HH:mm"))
		this.parent.find(".mobileTimePicker").change(() => {
			if (this.parent.find(".mobileTimePicker").val().match(/\d+:\d+/)) {
				let nums = this.parent.find(".mobileTimePicker").val().split(":")
				this.time.hours = parseInt(nums[0])
				this.time.minutes = parseInt(nums[1])
				this.time.showTime()
			} else {
				this.time.hours = 0
				this.time.minutes = 0
			}
		})
	}
	
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
	
	getTimes() {
		let datesArray = []
		let toAdd = moment(this.firstCalendar.date)
		let toCompare = moment(this.secondCalendar.date)
		
		switch (this.mode) {
			case "single":
				let toReturn = moment(this.firstCalendar.date)
				toReturn.minutes(this.time.minutes)
				toReturn.hours(this.time.hours)
				return [toReturn.valueOf()]
			case "interval":
				datesArray = []
				toAdd.minutes(this.time.minutes)
				toAdd.hours(this.time.hours)
				
				let num = parseFloat(this.parent.find(".intervalNumber").val())
				if (num < 1 || !Number.isInteger(num)) {
					throw "Error: Interval number must be a positive integer"
				}
				
				let units = this.parent.find(".intervalUnit").val()
				
				toCompare.hours(23)
				toCompare.minutes(59)
				toCompare.seconds(59)
				
				while (toAdd <= toCompare) {
					datesArray.push(toAdd.valueOf())
					toAdd.add(num, units)
				}
				return datesArray.sort(function(a, b) {
					return a - b
				})
			case "days":
				datesArray = []
				toAdd.minutes(this.time.minutes)
				toAdd.hours(this.time.hours)
				
				toCompare.hours(23)
				toCompare.minutes(59)
				toCompare.seconds(59)
				
				let filter = this.parent.find(".intervalFilter").val()
				
				let n = Math.ceil(this.firstCalendar.date.date() / 7)
				
				let daysArray = []
				
				for (let i = 2; i < 2 + 7; i++) {
					daysArray.push(this.parent.find(`.daysSettings :nth-child(${i}) :nth-child(1)`).prop("checked") == true)
				}
				
				while (toAdd <= toCompare) {
					let day = toAdd.day()
					
					if (filter == "nth") {
						if (Math.ceil(toAdd.date() / 7) != n) {
							toAdd.add(1, "day")
							continue
						}
					}
					
					if (filter == "last") {
						if (toAdd.daysInMonth() >= toAdd.date() + 7) {
							toAdd.add(1, "day")
							continue
						}
					}
					
					if (daysArray[day]) {
						datesArray.push(toAdd.valueOf())
					}
					
					if (day == 6 && filter == "alternating") {
						toAdd.add(7, "days")
					}
					
					toAdd.add(1, "day")
				}
				return datesArray.sort(function(a, b) {
					return a - b
				})
			case "multiple":
				return this.firstCalendar.dates.sort(function(a, b) {
					return a - b
				})
		}
	}
	
	getFirst() {
		return this.getTimes()[0]
	}
	
	showMode() {
		let addBack = this.parent.find(".timeColumn").detach()
		this.parent.find(".singleSettings").addClass("hidden")
		this.parent.find(".intervalSettings").addClass("hidden")
		this.parent.find(".daysSettings").addClass("hidden")
		this.parent.find(".multipleSettings").addClass("hidden")
		this.parent.find(`.${this.mode}Settings`).removeClass("hidden")
		this.parent.find(`.${this.mode}Settings`).slideDown()
		if (this.mode === "interval" || this.mode === "days") {
			this.parent.find(".settingsColumn").append(addBack)
			this.parent.find(".clockLabel").removeClass("hidden")
		} else {
			this.parent.find(".firstDateTimeContainer").append(addBack)
			this.parent.find(".clockLabel").addClass("hidden")
		}
		addBack.slideDown()
		if (this.parent.find(".calendarColumn2:hidden").length > 0 && (this.mode === "interval" || this.mode === "days")) {
			this.parent.find(".firstLabel").slideDown()
			this.parent.find(`.calendarColumn2`).removeClass("hidden")
			this.parent.find(".calendarColumn2").slideDown(() => {
				this.secondCalendar.setNumbers()
			})
		}
	}
	
	setMode(mode) {
		let oldMode = this.mode
		this.mode = mode
		switch(mode) {
			case "single":
				if (this.parent.find(".calendarColumn2:visible").length > 0) {
					this.parent.find(".firstLabel").slideUp()
					this.parent.find(".calendarColumn2").slideUp(400, this.showMode.bind(this))
				}
				
				if (oldMode == "interval" || oldMode == "days") {
					this.parent.find(".timeColumn").slideUp(400)
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
				this.secondCalendar.setFilter(null)
				this.firstCalendar.setRipple(null)
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
				
				if (oldMode == "single" || oldMode == "multiple") {
					this.parent.find(".timeColumn").slideUp(400)
				}
				
				this.firstCalendar.setMode("single")
				this.secondCalendar.setFilter(function(x, y, date) {
					let num = parseFloat(this.parent.find(".intervalNumber").val())
					let units = this.parent.find(".intervalUnit").val()
					
					if (date < this.firstCalendar.date) {
						return true
					}
					
					if (units == "months") {
						if(this.firstCalendar.date.date() != date.date()) {
							return true
						}
						return date.diff(this.firstCalendar.date, "months") % num != 0
					}
					
					let difference = date.diff(this.firstCalendar.date, "days")
					
					if (units == "weeks") {
						difference /= 7
					}
					
					if (difference % num == 0) {
						return false
					} else {
						return true
					}
				}.bind(this))
				this.firstCalendar.setRipple(() => {
					this.secondCalendar.setNumbers()
				})
				
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
				
				if (oldMode == "single" || oldMode == "multiple") {
					this.parent.find(".timeColumn").slideUp(400)
				}
				
				this.firstCalendar.setMode("single")
				this.secondCalendar.setFilter(function(x, y, date) {
					if (date < this.firstCalendar.date) {
						return true
					}
					
					let filter = this.parent.find(".intervalFilter").val()
					let checkbox = this.parent.find(`.daysSettings :nth-child(${date.day() + 2}) input`)
					
					if (!checkbox.prop("checked")) {
						return true
					}
					
					if (filter == "nth") {
						if (Math.ceil(date.date() / 7) != parseInt(this.parent.find(".weekNumber").text())) {
							return true
						}
					}
					
					if (filter == "last") {
						if (date.daysInMonth() >= date.date() + 7) {
							return true
						}
					}
					
					if (filter == "alternating") {
						let startOfWeek1 = moment(this.firstCalendar.date).subtract(this.firstCalendar.date.weekday(), "days")
						let startOfWeek2 = moment(date).subtract(date.weekday(), "days")
						if (Math.round(startOfWeek2.diff(startOfWeek1, "weeks")) % 2 == 1) {
							return true
						}
					}
					
					return false
				}.bind(this))
				this.firstCalendar.setRipple(function(date) {
					this.parent.find(".daysSettings label input").prop("disabled", false)
					let checkbox = this.parent.find(`.daysSettings :nth-child(${date.day() + 2}) input`)
					//checkbox.prop("disabled", true)
					checkbox.prop("checked", true)
					checkbox.change()
					
					let rank = Math.ceil(date.date() / 7)
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
					
					if (date.date() + 7 > date.daysInMonth()) {
						this.parent.find(".lastOption").removeClass("hidden")
					} else {
						if (this.parent.find(".intervalFilter").val() == "last") {
							this.parent.find(".intervalFilter").val("all")
						}
						this.parent.find(".lastOption").addClass("hidden")
					}

					this.secondCalendar.setNumbers()
				}.bind(this))
				
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
				
				if (oldMode == "interval" || oldMode == "days") {
					this.parent.find(".timeColumn").slideUp(400)
				}
				
				this.firstCalendar.setMode("multiple")
				this.secondCalendar.setFilter(null)
				this.firstCalendar.setRipple(null)
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
		
		this.dates = []
		this.considering = []
		
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
				$(this).removeClass("is-invalid")
			} else {
				$(this).addClass("is-invalid")
			}
		})
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
	
	setFilter(func) {
		this.filterFunction = func
		this.setNumbers()
	}
	
	setRipple(func) {
		this.rippleFunction = func
		if (this.rippleFunction) {
			this.rippleFunction(this.date)
		}
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
				if (this.mode == "single" && toSet.diff(this.date) == 0
					|| this.mode == "multiple" && this.hasDate(toSet)) {
					cell.addClass("buttonSelected")
				} else {
					cell.removeClass("buttonSelected")
				}
				cell.off()
				cell.mousedown({date: toSet, parent: this, x: j, y: i}, function(evt) {
					if ($(this).prop("disabled")) return
					if (evt.data.parent.mode == "multiple") {
						if (evt.data.parent.hasDate(evt.data.date)) {
							evt.data.parent.removeDate(evt.data.date)
						} else {
							evt.data.parent.addDate(evt.data.date)
						}
					} else {
						evt.data.parent.setDate(evt.data.date)
					}
				})
				cell.hover((evt) => {
					if (this.mode == "single") return
					if (evt.buttons == 1) {
						if (this.hasDate(toSet)) {
							this.removeDate(toSet)
						} else {
							this.addDate(toSet)
						}
					}
				}, (evt) => {
				})
				cell.text(toSet.date())
				if (this.filterFunction && this.filterFunction(x, y, toSet)) {
					cell.addClass("disabledButton")
					cell.prop("disabled", true)
					cell.removeClass("historyButton")
				} else {
					cell.removeClass("disabledButton")
					cell.prop("disabled", false)
					if (this.filterFunction && toSet < this.date) {
						cell.addClass("historyButton")
					} else {
						cell.removeClass("historyButton")
					}
				}
			}
		}
		this.parent.find('.monthLabel').text(this.displayDate.format("MMMM YYYY"))
	}
	
	setDate(date) {
		this.date = moment(date)
		this.displayDate = moment(this.date)
		this.parent.find(".dateStringInput").removeClass("is-invalid")
		this.setNumbers()
		//Change this for hosting
		this.parent.find(".dateStringInput").val(this.date.format("MM/DD/YYYY"))
		if (this.rippleFunction) {
			this.rippleFunction(this.date)
		}
	}
	
	hasDate(date) {
		let looking = date.valueOf()
		for (var i in this.dates) {
			if (this.dates[i] == looking) {
				return true
			}
		}
		return false
	}
	
	addDate(date) {
		this.dates.push(date.valueOf())
		this.parent.find(".dateStringInput").val(date.format("MM/DD/YYYY"))
		this.setNumbers()
	}
	
	removeDate(date) {
		this.dates = this.dates.filter(time => date.valueOf() != time)
		this.setNumbers()
	}
	
	getCell(x, y) {
		return this.parent.find(`.calendarGrid :nth-child(${y+1}) :nth-child(${x+1})`)
	}
	
	setMode(mode) {
		if (mode == this.mode) {
			return
		}
		this.mode = mode
		this.setNumbers()
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
			<div class="clocksWrapper2">
				<div class="hoursClockWrapper">
				</div>
				<div class="minutesClockWrapper" style="display: none;">
				</div>
			</div>
		</div>`)
		this.parent.find(".hoursClockWrapper").load("/hoursPicker.svg", this.loadHours.bind(this))
		this.parent.find(".minutesClockWrapper").load("/minutesPicker.svg", this.loadMinutes.bind(this))
		
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
					evt.data.parent.parent.find(".minutesButton").click()
					evt.data.parent.parent.find(".minutesButton").focus()
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
			} else {
				if (evt.key == "a" || evt.key == "A") {
					evt.data.parent.parent.find(".hoursButton").removeClass("buttonSelected")
					evt.data.parent.parent.find(".minutesButton").removeClass("buttonSelected")
					evt.data.parent.parent.find(".amPmButton").addClass("buttonSelected")
					evt.data.parent.parent.find(".amPmButton").focus()
					
					evt.data.parent.pm = false
					evt.data.parent.setHour(evt.data.parent.hours)
					
					evt.data.parent.showTime()
				} else if (evt.key == "p" || evt.key == "P") {
					evt.data.parent.parent.find(".hoursButton").removeClass("buttonSelected")
					evt.data.parent.parent.find(".minutesButton").removeClass("buttonSelected")
					evt.data.parent.parent.find(".amPmButton").addClass("buttonSelected")
					evt.data.parent.parent.find(".amPmButton").focus()
					
					evt.data.parent.pm = true
					evt.data.parent.setHour(evt.data.parent.hours + 12)
					
					evt.data.parent.showTime()
				}
			}
		})
		this.parent.find(".amPmButton").keypress((evt) => {
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
		this.parent.parent().find(".mobileTimePicker").val(this.hours.toString().padStart(2, "0") + ":" + this.minutes.toString().padStart(2, "0"))
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
				evt.preventDefault()
				if (evt.buttons == 1) {
					this.setHour(hour)
				}
			}.bind(this, i + 1))
			button.mousedown(function(hour, evt) {
				evt.preventDefault()
				this.setHour(hour)
			}.bind(this, i + 1))
			button.mouseup(function(evt) {
				evt.preventDefault()
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
	evt.preventDefault()
	if (evt.buttons == 1) {
		let x = evt.pageX - (evt.data.element[1].getBoundingClientRect().left + evt.data.element[1].ownerDocument.defaultView.pageXOffset) - (evt.data.ancestor.width() / 2)
		let y = -evt.pageY + (evt.data.element[1].getBoundingClientRect().top + evt.data.element[1].ownerDocument.defaultView.pageYOffset) + (evt.data.ancestor.height() / 2)
		let angle = Math.round((Math.atan2(x, y) * 180 / Math.PI + 360) / 6) % 60
		evt.data.parent.setMinutes(angle)
	}
}