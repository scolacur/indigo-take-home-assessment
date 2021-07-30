// Create an index.js file with JavaScript that can:
	// Validate data entry
		// Age is required
		// Age must be > 0
		// Relationship is required
	// Add people to a growing household list
	// Reset the entry form after each addition
	// Remove a previously added person from the list
	// Display the household list in the HTML as it is modified
	// Serialize the household as JSON upon form submission as a fake trip to the server
	// Follow industry accessibility guidelines for form validation

// Clarifications
	// Do not modify the given index.html file in any way. You're still allowed to modify the DOM through JavaScript.
	// You must write JavaScript, not a language that compiles down to JavaScript. You must only use features from the ES5 standard. No
	// 3rd party libraries (i.e. no jQuery, no React).
	// The display of the household list is up to you.
	// On submission, put the serialized JSON in the provided <pre class="debug"> DOM element and display that element.
	// After submission, the user should be able to make changes and submit the household again.
	// You don't need to add validations around anything other than the age and relationship requirements described above. It's ok for
	// someone to add 35 parents.
	// The focus here is on the quality of your JavaScript, not the beauty of your design. The controls you add around viewing and
	// deleting household members should be usable but don’t need to look pretty.

//IIFE to prevent polluting global scope
(function() {
	if (!document) return

	/****************/
	/*Initialization*/
	/****************/

	//Initialize Application state

	/*All of the application-specific information (field names & types), data schema,
	lives on the state. The other parts of the component (initialization, methods)
	are agnostic of what type of data they are displaying. This makes this
	component very easily extendable to be used for a variety of applications.*/
	var state = {
		entries: {},
		entryCount: 0,
		copy: {
			empty: 'No household members to display',
			entryHeader: 'Member'
		},
		/*We could actually build the whole form component HTML from this object,
		possibly via a framework. But since we can't modify the HTML,
		instead this object is just set up to mirror what's already in the HTML.
		*/
		fields: {
			'age': {
				type: 'number',
				input: 'text',
				label: 'Age',
				required: true,
				min: 0,
				max: Infinity,
				validationErrText: 'Age is required and must be a number > 0.'
			},
			'rel': {
				type: 'string',
				input: 'select',
				label: 'Relationship',
				required: true,
				validationErrText: 'Relationship is required.'
			},
			'smoker': {
				type: 'boolean',
				input: 'checkbox',
				label: 'Smoker?',
				required: false,
				validationErrText: ''
			}
		}
	}

	/*Append stylesheet to page for easier styling*/
	var link = document.createElement('link')
	link.href = './household-builder.css'
	link.type = 'text/css'
	link.rel = 'stylesheet'
	link.media = 'screen,print'

	document.getElementsByTagName('head')[0].appendChild(link)

	/*Set up listeners*/
	var form = document.querySelector('form')
	if (form) {
		form.addEventListener('submit', submit)
	}

	var addBtn = document.getElementsByClassName('add')[0]
	if (addBtn) {
		addBtn.type = 'button'
		addBtn.addEventListener('click', addEntry)
	}

	/*Add some attributes to existing elements for validation
	(normally this would just be done directly in the HTML,
	but can't modify HTML as per instructions)
	*/
	var inputs = document.getElementsByTagName('input')
	var selects = document.getElementsByTagName('select')
	Array.from(inputs).concat(Array.from(selects)).forEach(function(input) {
		var field = state.fields[input.id]
		if (field) {
			if (field.required) {
				input.required = true
			}
			if (field.type === 'number') {
				input.type = 'number'
			}
			if (field.min !== undefined) {
				input.min = field.min
			}
			if (field.max !== undefined) {
				input.max = field.max
			}
		}
	})

	/*Add some useful HTML to the DOM*/

	//A place to display the list in addition to the JSON read-out
	var listContainer  = document.createElement('div')
	listContainer.classList.add('list-container')
	//Header for list
	var listHeader = document.createElement('h3')
	listHeader.classList.add('list-header')
	//Placeholder message for when list is empty
	var defaultMsg = document.createElement('span')
	defaultMsg.classList.add('empty-msg')

	listHeader.textContent = 'Household'
	defaultMsg.textContent = state.copy.empty

	listContainer.appendChild(defaultMsg)
	document.body.appendChild(listHeader)
	document.body.appendChild(listContainer)

	//A place for error messages
	var errorMsgContainer  = document.createElement('div')
	form.appendChild(errorMsgContainer)

	/*********/
	/*METHODS*/
	/*********/

	//Listener for "Add" button
	function addEntry(e) {
		e.preventDefault()
		clearErrorMessages()
		var newEntry = getFormData()
		var isValid = validateEntry(newEntry)
		if (!isValid) return

		//Increment entryCount (we can't use entries.length because that will
		//break once we start removing entries)
		state.entryCount++
		//Add to state
		state.entries[state.entryCount] = newEntry
		newEntry.id = state.entryCount

		//Reset form
		form.reset()

		//Write to page
		renderData(state.entries)
	}

	/*Pulls data from the form and converts to an object
	representing an entry to store on the state.*/
	function getFormData() {
		var formData = new FormData(form)
		var entry = {}

		Object.keys(state.fields).forEach(function(key) {
			var field = state.fields[key]
			var fieldValue

			switch (field.input) {
				//Extract boolean value from checkbox
				case 'checkbox':
					fieldValue = (formData.get(key) === 'on')
					break
				//Just get the value normally
				case 'select':
					fieldValue = formData.get(key)
					break
				case 'text':
				default:
					//if text input and expecting a number, parse the number
					//This could also be specified in the HTML with the attribute type='number'
					//type='number' input elements can also accept min and max values as attributes,
					if (field.type === 'number') {
						fieldValue = parseInt(formData.get('age'))
					} else {
						fieldValue = formData.get(key)
					}
					break
			}

			entry[key] = fieldValue
		})

		return entry
	}

	/*Validates an entry by individually validating each field based on that field's
	validation rules. If any field is invalid, the whole entry is invalid. In this case,
	error messages are displayed for any invalid fields indicating what the validation criteria are.*/
	function validateEntry(entry) {
		var entryIsValid = true
		Object.keys(entry).forEach(function(key) {
			var field = state.fields[key]
			var isValid = validateFieldValue(entry[key], field)
			if (!isValid) {
				entryIsValid = false
				showErrorMessage(state.fields[key].validationErrText)
			}
		})

		return entryIsValid
	}

	/*Returns true if a particular entry is valid given the options set on the field*/
	function validateFieldValue(val, field) {
		var fieldIsValid = true

		switch (field.input) {
			case 'checkbox':
				if (field.required && !val) {
					fieldIsValid = false
				}
				break
			case 'select':
				if (field.required && (!val || !val.length)) {
					fieldIsValid = false
				}
				break
			case 'text':
			default:
				if (field.type === 'number') {
					if (isNaN(val)) {
						fieldIsValid = false
					}
					if (field.required && typeof val !== 'number') {
						fieldIsValid = false
					}
					if (val < field.min || val > field.max) {
						fieldIsValid = false
					}
					break
				} else {
					if (field.required && (!val || !val.length)) {
						fieldIsValid = false
					}
					break
				}
		}
		return fieldIsValid
	}

	//"POST" data to "server", pass error and success handlers
	function submit(e) {
		e.preventDefault()
		postData(state.entries, errHandler, renderJSON)
	}

	//Very basic async function to mimic an actual API call
	function postData(data, errCb, successCb) {
		try {
			doStuffThatMightTakeAWhile()
			successCb(data)
		} catch (e) {
			errCb(e, 'POST request failed')
		}
	}

	function doStuffThatMightTakeAWhile() {
		return true
	}

	//Renders serialized JSON on page
	function renderJSON(data) {
		var jsonContainer = document.getElementsByClassName('debug')[0]
		jsonContainer.textContent = JSON.stringify(data, undefined, 2)
		jsonContainer.style.display = 'block'
	}

	//Renders list of entries to the page
	/*In a real-world scenario, only the diff would be rendered.
	Frameworks like React make this easy. Here we are just clearing
	the contents and re-rendering the entire state.entries object.
	Important: Data must be an object
	*/
	function renderData(data) {
		var listContainer = document.getElementsByClassName('list-container')[0]
		if (listContainer) {
			//Clear previous results
			listContainer.innerHTML = ''

			//Reset "empty" copy if there are no entries
			if (!Object.keys(data).length) {
				listContainer.textContent = state.copy.empty
			}

			//Render each entry
			Object.keys(data).forEach(function(key, i) {
				var entry = data[key]
				createListItem(entry, i)
			})
		}
	}

	//Renders an element inside the list container to display a given entry
	function createListItem(entry) {
		var entryWrap = document.createElement('div')
		entryWrap.classList.add('entry')
		entryWrap.id = 'entry' + '-' + entry.id

		var entryHeader = document.createElement('h5')
		entryHeader.classList.add('entry-header')
		entryHeader.textContent = state.copy.entryHeader + ' ' + entry.id
		entryWrap.appendChild(entryHeader)

		var removeBtn = document.createElement('button')
		removeBtn.textContent = 'Remove'
		removeBtn.addEventListener('click', removeEntry.bind(null, entry.id))

		Object.keys(entry)
		.filter(function(key) {
			return key !== 'id'
		})
		.forEach(function(key) {
			var field = document.createElement('div')
			field.classList.add('field')

			var fieldLabel = document.createElement('span')
			fieldLabel.textContent = state.fields[key].label + ':'
			fieldLabel.classList.add('field-label')

			var fieldValue = document.createElement('span')
			fieldValue.textContent = formatValue(key, entry[key])
			fieldValue.classList.add('field-value')
			fieldValue.classList.add('field-value-' + key)

			field.appendChild(fieldLabel)
			field.appendChild(fieldValue)
			entryWrap.appendChild(field)
		})

		entryWrap.appendChild(removeBtn)
		listContainer.appendChild(entryWrap)
	}

	//Helper function to format values displayed in list
	//Capitalizes first character of strings and displays "Yes"/"No" for booleans
	function formatValue(key, val) {
		if (state.fields[key].type === 'string') {
			return val.charAt(0).toUpperCase() + val.slice(1)
		} else if (state.fields[key].type === 'boolean') {
			return val ? 'Yes' : 'No'
		} else {
			return val
		}
	}

	//Remove entry by ID (client-side)
	function removeEntry(id) {
		delete state.entries[id]
		renderData(state.entries)
	}

	//Generic Error Handler
	function errHandler(err, msg) {
		showErrorMessage(msg)
	}

	//Creates div to hold the error message and renders it inside the error message container
	function showErrorMessage(msg) {
		var errMsg = document.createElement('div')
		errMsg.innerHTML = msg
		errMsg.classList.add('error-msg')
		errorMsgContainer.appendChild(errMsg)
	}

	//Clears all error messages from the error message container
	function clearErrorMessages() {
		errorMsgContainer.innerHTML = ''
	}
})()
