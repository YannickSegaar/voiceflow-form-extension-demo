// This extension shows a waiting animation with customizable text and delay
// Also checking for the vf_done value to stop/hide the animation if it's true
export const WaitingAnimationExtension = {
  name: 'WaitingAnimation',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_waitingAnimation' ||
    trace.payload.name === 'ext_waitingAnimation',
  render: async ({ trace, element }) => {
    window.vf_done = true
    await new Promise((resolve) => setTimeout(resolve, 250))

    const text = trace.payload?.text || 'Please wait...'
    const delay = trace.payload?.delay || 3000

    const waitingContainer = document.createElement('div')
    waitingContainer.innerHTML = `
      <style>
        .vfrc-message--extension-WaitingAnimation {
          background-color: transparent !important;
          background: none !important;
        }
        .waiting-animation-container {
          font-family: Arial, sans-serif;
          font-size: 14px;
          font-weight: 300;
          color: #fffc;
          display: flex;
          align-items: center;
        }
        .waiting-text {
          display: inline-block;
          margin-left: 10px;
        }
        .waiting-letter {
          display: inline-block;
          animation: shine 1s linear infinite;
        }
        @keyframes shine {
          0%, 100% { color: #fffc; }
          50% { color: #000; }
        }
        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #fffc;
          border-top: 2px solid #000;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
      <div class="waiting-animation-container">
        <div class="spinner"></div>
        <span class="waiting-text">${text
          .split('')
          .map((letter, index) =>
            letter === ' '
              ? ' '
              : `<span class="waiting-letter" style="animation-delay: ${
                  index * (1000 / text.length)
                }ms">${letter}</span>`
          )
          .join('')}</span>
      </div>
    `

    element.appendChild(waitingContainer)

    window.voiceflow.chat.interact({
      type: 'continue',
    })

    let intervalCleared = false
    window.vf_done = false

    const checkDoneInterval = setInterval(() => {
      if (window.vf_done) {
        clearInterval(checkDoneInterval)
        waitingContainer.style.display = 'none'
        window.vf_done = false
      }
    }, 100)

    setTimeout(() => {
      if (!intervalCleared) {
        clearInterval(checkDoneInterval)
        waitingContainer.style.display = 'none'
      }
    }, delay)
  },
}

// This extension triggers a "done" action,
// typically used to signal the completion of a task
// and hide a previous WaitingAnimation
export const DoneAnimationExtension = {
  name: 'DoneAnimation',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_doneAnimation' ||
    trace.payload.name === 'ext_doneAnimation',
  render: async ({ trace, element }) => {
    window.vf_done = true
    await new Promise((resolve) => setTimeout(resolve, 250))

    window.voiceflow.chat.interact({
      type: 'continue',
    })
  },
}

export const DisableInputExtension = {
  name: 'DisableInput',
  type: 'effect',
  match: ({ trace }) =>
    trace.type === 'ext_disableInput' ||
    trace.payload.name === 'ext_disableInput',
  effect: ({ trace }) => {
    const { isDisabled } = trace.payload

    function disableInput() {
      const chatDiv = document.getElementById('voiceflow-chat')

      if (chatDiv) {
        const shadowRoot = chatDiv.shadowRoot
        if (shadowRoot) {
          const chatInput = shadowRoot.querySelector('.vfrc-chat-input')
          const textarea = shadowRoot.querySelector(
            'textarea[id^="vf-chat-input--"]'
          )
          const button = shadowRoot.querySelector('.vfrc-chat-input--button')

          if (chatInput && textarea && button) {
            // Add a style tag if it doesn't exist
            let styleTag = shadowRoot.querySelector('#vf-disable-input-style')
            if (!styleTag) {
              styleTag = document.createElement('style')
              styleTag.id = 'vf-disable-input-style'
              styleTag.textContent = `
                .vf-no-border, .vf-no-border * {
                  border: none !important;
                }
                .vf-hide-button {
                  display: none !important;
                }
              `
              shadowRoot.appendChild(styleTag)
            }

            function updateInputState() {
              textarea.disabled = isDisabled
              if (!isDisabled) {
                textarea.placeholder = 'Message...'
                chatInput.classList.remove('vf-no-border')
                button.classList.remove('vf-hide-button')
                // Restore original value getter/setter
                Object.defineProperty(
                  textarea,
                  'value',
                  originalValueDescriptor
                )
              } else {
                textarea.placeholder = ''
                chatInput.classList.add('vf-no-border')
                button.classList.add('vf-hide-button')
                Object.defineProperty(textarea, 'value', {
                  get: function () {
                    return ''
                  },
                  configurable: true,
                })
              }

              // Trigger events to update component state
              textarea.dispatchEvent(
                new Event('input', { bubbles: true, cancelable: true })
              )
              textarea.dispatchEvent(
                new Event('change', { bubbles: true, cancelable: true })
              )
            }

            // Store original value descriptor
            const originalValueDescriptor = Object.getOwnPropertyDescriptor(
              HTMLTextAreaElement.prototype,
              'value'
            )

            // Initial update
            updateInputState()
          } else {
            console.error('Chat input, textarea, or button not found')
          }
        } else {
          console.error('Shadow root not found')
        }
      } else {
        console.error('Chat div not found')
      }
    }

    disableInput()
  },
}

const DEALERSHIPS = [
  {
    name: 'PARIS INTRA MUROS',
    address: '72 Rue DU FAUBOURG SAINT JACQUES, 75011 Paris',
  },
  {
    name: 'RENAULT MONTROUGE',
    address: '59 Avenue Aristide Briand, 75014 Paris',
  },
  {
    name: 'PARIS SAINT-GERMAIN',
    address: '81 Boulevard Saint Germain, 75006 Paris',
  },
  {
    name: 'RENAULT PORTE DE VINCENNES',
    address: '55 Boulevard de Charonne, 75011 Paris',
  },
]

const VEHICLES = [
  { id: 'r5i', name: 'R5 Iconic', image: '/images/r5Iconic.png' },
  { id: 'r5t', name: 'R5 Techno', image: '/images/r5Techno.png' },
]

const TIME_SLOTS = ['10:15-11:00 AM PST', '2:30-3:15 PM PST']

export const BookingExtension = {
  name: 'Booking',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_booking' || trace.payload.name === 'ext_booking',
  render: ({ trace, element }) => {
    let currentScreen = 0
    let selectedLocation = ''
    let selectedVehicle = ''
    let selectedDate = ''
    let selectedTime = ''
    let displayedMonth = new Date().getMonth()
    let displayedYear = new Date().getFullYear()
    let formData = {
      email: '',
      firstName: '',
      lastName: '',
      country: 'United States',
      phone: '',
      zipCode: '',
    }

    const container = document.createElement('div')
    container.className = 'max-w-2xl mx-auto p-2'

    // Helper function to scroll to bottom
    function scrollToBottom() {
      // Find the chat dialog container with the specific class
      const chatDialog = document.querySelector('.vfrc-chat--dialog.c-Mmsau')
      if (chatDialog) {
        setTimeout(() => {
          chatDialog.scrollTo({
            top: chatDialog.scrollHeight,
            behavior: 'smooth',
          })
        }, 100) // Small delay to ensure content is rendered
      }
    }

    function renderLocationVehicleScreen() {
      container.innerHTML = `
        <style>
          .vfrc-message--extension-Booking {
            background-color: transparent !important;
            background: none !important;
          }
          .booking-container {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            max-width: 320px;
            margin: 0 auto;
          }
          .booking-title {
            font-size: 1.5rem;
            padding-top: 16px;
            margin-bottom: 1.5rem;
            font-weight: bold;
          }
          .booking-subtitle {
            font-size: 1.25rem;
            margin-bottom: 1rem;
            font-weight: normal;
          }
          .booking-select {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #e2e8f0;
            border-radius: 0.375rem;
            margin-bottom: 0.75rem;
            font-size: 0.875rem;
          }
          .vehicle-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .vehicle-button {
            position: relative;
            padding: 0;
            aspect-ratio: 4/3;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            cursor: pointer;
            overflow: hidden;
          }
          .vehicle-button img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
          }
          .vehicle-button.selected {
            border: 2px solid black;
          }
          .next-button {
            width: 100%;
            margin-top: 24px;
            padding: 16px;
            border: none;
            border-radius: 8px;
            background: #000;
            color: #fff;
            font-size: 16px;
            cursor: pointer;
            text-align: center;
          }
          .next-button:disabled { opacity: 0.5;
            cursor: not-allowed; }
          .next-button:not(:disabled) { background: black; color: white; }
        </style>
        <div class="booking-container">
          <div class="booking-title">Let's set up your drive</div>

          <div class="booking-subtitle">Location</div>
          <select class="booking-select" id="location-select">
            <option value="">Select a location</option>
            ${DEALERSHIPS.map(
              (dealer) => `
              <option value="${dealer.name}">${dealer.name} - ${dealer.address}</option>
            `
            ).join('')}
          </select>

          <div class="booking-subtitle">Vehicle</div>
          <div class="vehicle-grid">
            ${VEHICLES.map(
              (vehicle) => `
              <button class="vehicle-button" data-vehicle="${vehicle.id}">
                <img src="${vehicle.image}" alt="${vehicle.name}">
              </button>
            `
            ).join('')}
          </div>

          <button class="next-button" id="next-button" disabled>Next</button>
        </div>
      `

      const locationSelect = container.querySelector('#location-select')
      const vehicleButtons = container.querySelectorAll('.vehicle-button')
      const nextButton = container.querySelector('#next-button')

      locationSelect.value = selectedLocation
      locationSelect.addEventListener('change', (e) => {
        selectedLocation = e.target.value
        updateNextButton()
      })

      vehicleButtons.forEach((button) => {
        if (button.dataset.vehicle === selectedVehicle) {
          button.classList.add('selected')
        }
        button.addEventListener('click', () => {
          vehicleButtons.forEach((b) => b.classList.remove('selected'))
          button.classList.add('selected')
          selectedVehicle = button.dataset.vehicle
          updateNextButton()
        })
      })

      function updateNextButton() {
        nextButton.disabled = !selectedLocation || !selectedVehicle
      }

      nextButton.addEventListener('click', () => {
        currentScreen = 1
        renderCurrentScreen()
        scrollToBottom()
      })
    }

    function renderCalendarScreen() {
      let currentDate = new Date()
      displayedMonth = currentDate.getMonth()
      displayedYear = currentDate.getFullYear()

      function generateCalendar(month, year) {
        const firstDayOfMonth = new Date(year, month, 1).getDay()
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        const currentMonth = new Date(year, month).toLocaleString('default', {
          month: 'long',
          year: 'numeric',
        })

        container.innerHTML = `
        <style>
          .vfrc-message--extension-Booking {
            background-color: transparent !important;
            background: none !important;
          }
          .booking-container {
            width: 320px;
            padding: 0;
            margin: 0;
          }
          .calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 8px;
            width: 320px;
            margin-bottom: 24px;
          }
          .calendar-day {
            aspect-ratio: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            padding: 0;
            background: none;
          }
          .calendar-day:disabled {
            color: #cbd5e0;
            cursor: not-allowed;
          }
          .calendar-day.selected {
            border: 2px solid #000;
          }
          .time-slot {
            width: 100%;
            padding: 16px;
            text-align: left;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            margin-bottom: 8px;
            font-size: 16px;
            background: white;
            cursor: pointer;
          }
          .time-slot.selected {
            border: 2px solid #000;
          }
          .booking-title {
            font-size: 1.5rem;
            padding-top: 16px;
            margin-bottom: 1.5rem;
            font-weight: bold;
          }
          .month-nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            font-size: 16px;
          }
          .month-nav button {
            border: none;
            background: none;
            padding: 8px;
            cursor: pointer;
            font-size: 16px;
          }
          .month-nav button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .day-label {
            font-size: 12px;
            font-weight: 500;
            text-align: center;
            color: #666;
            padding: 4px 0;
          }
          .button-group {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-top: 24px;
          }
          .back-button {
            flex: 0 0 auto;
            min-width: 120px;
            padding: 16px;
            border: 1px solid rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            background: white;
            color: #000;
            font-size: 16px;
            cursor: pointer;
            text-align: center;
          }
          .next-button {
            flex: 1;
            padding: 16px;
            border: none;
            border-radius: 8px;
            background: #000;
            color: #fff;
            font-size: 16px;
            cursor: pointer;
            text-align: center;
          }
          .next-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        </style>
        <div class="booking-container">
          <div class="booking-title">Appointment times</div>

          <div class="month-nav">
            <button id="prev-month" ${
              month <= currentDate.getMonth() &&
              year <= currentDate.getFullYear()
                ? 'disabled'
                : ''
            }>←</button>
            <span>${currentMonth}</span>
            <button id="next-month" ${
              month >= currentDate.getMonth() + 2 ? 'disabled' : ''
            }>→</button>
          </div>

          <div class="calendar-grid">
            ${['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
              .map((day) => `<div class="day-label">${day}</div>`)
              .join('')}
            ${Array(firstDayOfMonth)
              .fill()
              .map(() => `<div></div>`)
              .join('')}
            ${Array(daysInMonth)
              .fill()
              .map((_, i) => {
                const day = i + 1
                const isDisabled =
                  (year === currentDate.getFullYear() &&
                    month === currentDate.getMonth() &&
                    day < currentDate.getDate()) ||
                  (year === currentDate.getFullYear() &&
                    month < currentDate.getMonth())
                return `
                    <button class="calendar-day ${
                      selectedDate === day ? 'selected' : ''
                    }"
                      ${isDisabled ? 'disabled' : ''}
                      data-day="${day}">
                      ${day}
                    </button>
                  `
              })
              .join('')}
          </div>

          ${
            selectedDate
              ? `
            <div style="margin-top: 24px;">
              ${TIME_SLOTS.map(
                (slot) => `
                <button class="time-slot ${
                  selectedTime === slot ? 'selected' : ''
                }" data-time="${slot}">
                  ${slot}
                </button>
              `
              ).join('')}
            </div>
          `
              : ''
          }

          <div class="button-group">
            <button class="back-button">Back</button>
            <button class="next-button" id="next-button" ${
              !selectedDate || !selectedTime ? 'disabled' : ''
            }>Next</button>
          </div>
        </div>
      `

        // Add event listeners
        container
          .querySelector('#prev-month')
          ?.addEventListener('click', () => {
            if (month === 0) {
              displayedMonth = 11
              displayedYear--
            } else {
              displayedMonth--
            }
            selectedDate = null
            selectedTime = null
            generateCalendar(displayedMonth, displayedYear)
          })

        container
          .querySelector('#next-month')
          ?.addEventListener('click', () => {
            if (month === 11) {
              displayedMonth = 0
              displayedYear++
            } else {
              displayedMonth++
            }
            selectedDate = null
            selectedTime = null
            generateCalendar(displayedMonth, displayedYear)
          })

        container
          .querySelector('.back-button')
          .addEventListener('click', () => {
            currentScreen = 0
            renderCurrentScreen()
            scrollToBottom()
          })

        container
          .querySelectorAll('.calendar-day:not([disabled])')
          .forEach((day) => {
            day.addEventListener('click', () => {
              container
                .querySelectorAll('.calendar-day')
                .forEach((d) => d.classList.remove('selected'))
              day.classList.add('selected')
              selectedDate = parseInt(day.dataset.day)
              generateCalendar(displayedMonth, displayedYear)
            })
          })

        container.querySelectorAll('.time-slot').forEach((slot) => {
          slot.addEventListener('click', () => {
            container
              .querySelectorAll('.time-slot')
              .forEach((s) => s.classList.remove('selected'))
            slot.classList.add('selected')
            selectedTime = slot.dataset.time
            container.querySelector('#next-button').disabled = false
          })
        })

        container
          .querySelector('#next-button')
          .addEventListener('click', () => {
            currentScreen = 2
            renderCurrentScreen()
            scrollToBottom()
          })
      }

      // Initial calendar generation
      generateCalendar(displayedMonth, displayedYear)
    }

    function renderContactScreen() {
      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ]
      container.innerHTML = `
        <style>
          .vfrc-message--extension-Booking {
            background-color: transparent !important;
            background: none !important;
          }
          .form-input {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #e2e8f0;
            border-radius: 0.375rem;
            margin-bottom: 0.5rem;
            font-size: 0.875rem;
          }
          .form-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
          .booking-container {
            max-width: 100%;
            margin: 0 auto;
            background-color: transparent !important;
            background: none !important;
          }
          .booking-title {
            font-size: 1.5rem;
            padding-top: 16px;
            margin-bottom: 1.5rem;
            font-weight: bold;
          }
          .booking-info {
            font-size: 0.875rem;
            margin-bottom: 1rem;
            color: #718096;
          }
          .consent-text {
            font-size: 0.75rem;
            color: #718096;
            margin-bottom: 0.75rem;
          }
          .submit-button {
            width: 100%;
            padding: 0.5rem;
            border-radius: 0.375rem;
            background: black;
            color: white;
            font-size: 0.875rem;
          }
          .button-group {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-top: 24px;
          }
          .back-button {
            flex: 0 0 auto;
            min-width: 120px;
            padding: 16px;
            border: 1px solid rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            background: white;
            color: #000;
            font-size: 16px;
            cursor: pointer;
            text-align: center;
          }
          .submit-button {
            flex: 1;
            padding: 16px;
            border: none;
            border-radius: 8px;
            background: #000;
            color: #fff;
            font-size: 16px;
            cursor: pointer;
            text-align: center;
          }
        </style>
        <div class="booking-container">
          <div class="booking-title">Contact Information</div>

          <div class="booking-info">
            <p>${monthNames[displayedMonth]} ${selectedDate}, ${displayedYear}</p>
            <p>${selectedTime}</p>
            <p>${selectedLocation}</p>
          </div>

          <form id="contact-form">
            <input type="email" name="email" placeholder="Email *" class="form-input" required pattern="[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}" title="Please enter a valid email address">
            <input type="text" name="firstName" placeholder="First name *" class="form-input" required>
            <input type="text" name="lastName" placeholder="Last name *" class="form-input" required>
            <select name="country" class="form-input" required>
              <option value="United States">United States</option>
            </select>
            <input type="tel" name="phone" placeholder="Phone number *" class="form-input" required pattern="^[0-9]{10}$" title="Please enter a valid 10-digit phone number">
            <input type="text" name="zipCode" placeholder="ZIP code *" class="form-input" required pattern="^[0-9]{5}$" title="Please enter a valid 5-digit ZIP code">

            <p class="consent-text">
              By clicking below to book a demo drive, I authorize Rivian to contact me via email or at the number provided about my demo drive and to give me more information about Rivian products, news and events.
            </p>

            <div class="button-group">
              <button type="button" class="back-button">Back</button>
              <button type="submit" class="submit-button">Book it</button>
            </div>
          </form>
        </div>
      `

      container.querySelector('.back-button').addEventListener('click', () => {
        currentScreen = 1
        renderCurrentScreen()
        scrollToBottom()
      })

      container
        .querySelector('#contact-form')
        .addEventListener('submit', (e) => {
          e.preventDefault()
          const formElements = e.target.elements

          // Add validation check for all fields
          const email = formElements.email
          const phone = formElements.phone
          const zipCode = formElements.zipCode

          // Reset validation styles
          const fieldsToValidate = [email, phone, zipCode]
          fieldsToValidate.forEach((field) => field.classList.remove('invalid'))

          // Check validity of all fields
          if (
            !email.checkValidity() ||
            !phone.checkValidity() ||
            !zipCode.checkValidity()
          ) {
            // Add invalid class to fields that failed validation
            if (!email.checkValidity()) email.classList.add('invalid')
            if (!phone.checkValidity()) phone.classList.add('invalid')
            if (!zipCode.checkValidity()) zipCode.classList.add('invalid')
            return
          }

          // Hide both buttons
          container.querySelector('.button-group').style.display = 'none'

          formData = {
            email: email.value,
            firstName: formElements.firstName.value,
            lastName: formElements.lastName.value,
            country: formElements.country.value,
            phone: phone.value,
            zipCode: zipCode.value,
          }

          // Format the date as YYYY/MM/DD
          const formattedDate = `${displayedYear}/${String(
            displayedMonth + 1
          ).padStart(2, '0')}/${String(selectedDate).padStart(2, '0')}`

          window.voiceflow.chat.interact({
            type: 'complete',
            payload: {
              location: selectedLocation,
              vehicle: selectedVehicle,
              date: formattedDate,
              time: selectedTime,
              ...formData,
            },
          })
        })
    }

    function renderCurrentScreen() {
      switch (currentScreen) {
        case 0:
          renderLocationVehicleScreen()
          break
        case 1:
          renderCalendarScreen()
          break
        case 2:
          renderContactScreen()
          break
      }
      scrollToBottom() // Scroll after initial render
    }

    renderCurrentScreen()
    element.appendChild(container)
    scrollToBottom() // Scroll after initial mount
  },
}
