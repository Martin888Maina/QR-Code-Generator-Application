// QR Code Generator — main application logic

(function () {

  // module-level state
  var currentQRText = '';
  var activeTab = 'url';

  // DOM references
  var input        = document.getElementById('qr-input');
  var generateBtn  = document.getElementById('generate-btn');
  var errorMsg     = document.getElementById('error-msg');
  var charCount    = document.getElementById('char-count');
  var clearBtn     = document.getElementById('clear-btn');
  var qrContainer  = document.getElementById('qrcode');
  var tabBtns      = document.querySelectorAll('.tab-btn');
  var downloadBtns = document.querySelectorAll('.download-btn');

  // tab switching
  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      tabBtns.forEach(function (b) {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      activeTab = btn.getAttribute('data-type');

      if (activeTab === 'url') {
        input.setAttribute('type', 'url');
        input.setAttribute('placeholder', 'https://example.com');
      } else {
        input.setAttribute('type', 'text');
        input.setAttribute('placeholder', 'Type any text here...');
      }

      // switching tabs after a generation clears the output
      resetOutput();
    });
  });

  // live character counter and clear-button visibility
  input.addEventListener('input', function () {
    var len = input.value.length;
    charCount.textContent = len + ' / 500';

    if (len >= 500) {
      charCount.classList.add('over-limit');
    } else {
      charCount.classList.remove('over-limit');
    }

    clearBtn.classList.toggle('visible', len > 0);
    clearError();
  });

  // clear button resets everything
  clearBtn.addEventListener('click', function () {
    input.value = '';
    charCount.textContent = '0 / 500';
    charCount.classList.remove('over-limit');
    clearBtn.classList.remove('visible');
    clearError();
    resetOutput();
    input.focus();
  });

  // generate on button click
  generateBtn.addEventListener('click', function () {
    generateQR();
  });

  // generate on Enter key — prevent any default form behaviour
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      generateQR();
    }
  });

  // focus the input field as soon as the page loads
  input.focus();

  // --- Core generation function ---

  function generateQR() {
    var text = input.value.trim();

    if (!text) {
      showError('Please enter a URL or text to generate a QR code.');
      input.classList.add('error');
      return;
    }

    if (text.length > 500) {
      showError('Input must be 500 characters or fewer.');
      input.classList.add('error');
      return;
    }

    clearError();
    generateBtn.textContent = 'Generating...';

    // brief timeout gives the browser a frame to update the button label
    setTimeout(function () {
      // remove placeholder and any previous QR output
      var placeholder = document.getElementById('qr-placeholder');
      if (placeholder) {
        placeholder.remove();
      }
      qrContainer.innerHTML = '';

      new QRCode(qrContainer, {
        text: text,
        width: 220,
        height: 220,
        colorDark: '#111111',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      });

      currentQRText = text;
      enableDownloadButtons();
      generateBtn.textContent = 'Generate QR Code';
    }, 200);
  }

  // --- Helper functions ---

  function enableDownloadButtons() {
    downloadBtns.forEach(function (btn) {
      btn.classList.remove('disabled');
      btn.removeAttribute('disabled');
    });
  }

  function resetOutput() {
    qrContainer.innerHTML = '';

    // rebuild the placeholder if it was removed during a previous generation
    if (!document.getElementById('qr-placeholder')) {
      var ph = document.createElement('div');
      ph.className = 'qr-placeholder';
      ph.id = 'qr-placeholder';
      ph.innerHTML = '<div class="placeholder-box"><span class="placeholder-text">Your QR code will appear here</span></div>';
      qrContainer.appendChild(ph);
    }

    currentQRText = '';

    downloadBtns.forEach(function (btn) {
      btn.classList.add('disabled');
      btn.setAttribute('disabled', 'true');
    });
  }

  function showError(msg) {
    errorMsg.textContent = msg;
  }

  function clearError() {
    errorMsg.textContent = '';
    input.classList.remove('error');
  }

  // --- Download functions ---

  function downloadPNG() {
    var canvas = qrContainer.querySelector('canvas');
    if (!canvas) return;
    var link = document.createElement('a');
    link.download = 'qr-code.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  // JPEG has no alpha channel — fill white before drawing the QR canvas on top
  function downloadJPG() {
    var canvas = qrContainer.querySelector('canvas');
    if (!canvas) return;
    var exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    var ctx = exportCanvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    ctx.drawImage(canvas, 0, 0);
    var link = document.createElement('a');
    link.download = 'qr-code.jpg';
    link.href = exportCanvas.toDataURL('image/jpeg', 0.95);
    link.click();
  }

  // qrcodejs only renders a canvas — wrap the PNG data inside an SVG image tag
  function downloadSVG() {
    var canvas = qrContainer.querySelector('canvas');
    if (!canvas) return;
    var dataURL = canvas.toDataURL('image/png');
    var svgContent = [
      '<svg xmlns="http://www.w3.org/2000/svg"',
      '     xmlns:xlink="http://www.w3.org/1999/xlink"',
      '     width="' + canvas.width + '" height="' + canvas.height + '">',
      '  <image href="' + dataURL + '" width="' + canvas.width + '" height="' + canvas.height + '"/>',
      '</svg>'
    ].join('\n');
    var blob = new Blob([svgContent], { type: 'image/svg+xml' });
    var link = document.createElement('a');
    link.download = 'qr-code.svg';
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  }

  // Wire each download button to its function
  document.getElementById('btn-png').addEventListener('click', function () {
    if (!this.classList.contains('disabled')) downloadPNG();
  });

  document.getElementById('btn-jpg').addEventListener('click', function () {
    if (!this.classList.contains('disabled')) downloadJPG();
  });

  document.getElementById('btn-svg').addEventListener('click', function () {
    if (!this.classList.contains('disabled')) downloadSVG();
  });

})();
