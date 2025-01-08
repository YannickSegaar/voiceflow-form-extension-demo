# Voiceflow Form Extension Demo

This repository demonstrates a custom implementation of the Voiceflow Chat Widget with form-based extensions.
The demo showcases a Renault 5 test drive booking experience.

## Features

- Custom chat widget implementation
- Form-based extensions for handling user interactions
- Waiting and done animations
- Sending data back to the Voiceflow agent for booking functionality

## Prerequisites

- A modern web browser
- A Voiceflow account (for project customization)

## Quick Start

1. Clone this repository:
```bash
git clone https://github.com/voiceflow-gallagan/voiceflow-form-extension-demo.git
cd voiceflow-form-extension-demo
```

2. Start a local development server:
```bash
npx serve
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## Project Structure

```
├── index.html              # Main demo page
├── extensions/
│   └── extensions.js       # Custom Voiceflow extensions
├── images/                 # Image assets
└── styles/
    └── widget.css         # Custom widget styling
```

## Configuration

The chat widget is configured in `index.html` with the following key settings:

- Project ID: `677e761e051f29e11830fdb8`
- Runtime URL: `https://general-runtime.voiceflow.com`
- Version: `development`

## Custom Extensions

The demo includes several custom extensions:
- DisableInputExtension
- WaitingAnimationExtension
- DoneAnimationExtension
- BookingExtension

## Local Development

1. Make sure you have Node.js installed
2. Install `serve` globally (optional):
```bash
npm install -g serve
```

3. Run the local server:
```bash
npx serve
```

4. The site will be available at `http://localhost:3000`

