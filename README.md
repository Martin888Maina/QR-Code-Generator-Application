# QR Code Generator

A fast, lightweight QR code generator that runs entirely in the browser. No installation,
no dependencies, no backend — open the file and use it immediately.

## Live Demo

[qr-generator.martinmaina.dev](https://qr-generator.martinmaina.dev)

## Features

- Generate QR codes from any URL or plain text
- URL and Text input modes with tab switching
- Live character counter with a 500-character limit
- Download the generated QR code as PNG, JPG, or SVG
- Inline input validation — no browser alert dialogs
- Fully responsive layout — works on mobile and desktop
- Clean, minimal white interface

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 (semantic) |
| Styling | CSS3 (custom properties, flexbox) |
| Logic | Vanilla JavaScript (ES6+) |
| QR Library | qrcodejs (CDN) |
| Fonts | Inter — Google Fonts |

No build tools. No npm. No framework.

## How to Run Locally

No installation required. Clone the repository and open `index.html` directly in any
modern browser.

```bash
git clone https://github.com/Martin888Maina/QR-Code-Generator-Application.git
cd QR-Code-Generator-Application
```

Then open `index.html` in Chrome, Firefox, or Safari.

## How to Use

1. Select the input type — URL or Text
2. Type or paste your content into the input field
3. Click **Generate QR Code** or press Enter
4. Scan the result with any phone camera or QR reader
5. Click **Download PNG**, **Download JPG**, or **Download SVG** to save the file

## Project Structure

```
QR-Code-Generator-Application/
├── index.html        — application entry point
├── css/
│   └── style.css     — all styles, custom properties, responsive layout
├── js/
│   └── app.js        — QR generation, download logic, input handling
├── assets/
│   └── favicon.ico
├── LICENSE
└── README.md
```

## Known Limitations

- SVG export wraps an embedded PNG image inside an SVG container. This is a limitation
  of the qrcodejs library, which renders to canvas only and does not produce native vector output.
- Very long inputs produce high-density QR codes that may be harder to scan on
  lower-quality cameras. Always test the scan after generating.

## License

MIT — see [LICENSE](LICENSE)
