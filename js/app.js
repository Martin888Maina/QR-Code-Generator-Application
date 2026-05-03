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

      // always use type="text" to prevent browser-native URL validation
      // interfering with our own inline error handling
      input.setAttribute('type', 'text');
      if (activeTab === 'url') {
        input.setAttribute('placeholder', 'https://example.com');
      } else {
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

  // defer focus slightly so mobile browsers honour it on page load
  setTimeout(function () { input.focus(); }, 0);

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
    generateBtn.disabled = true;

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
      generateBtn.disabled = false;
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

  // qrcodejs renders both a <canvas> and an <img> inside #qrcode.
  // The <img> src is a reliable data URL in all browsers — use it as the source
  // for all exports by drawing it onto a fresh canvas first.
  function getExportCanvas(callback) {
    var img = qrContainer.querySelector('img');
    if (!img) return;
    var exportCanvas = document.createElement('canvas');
    exportCanvas.width = 220;
    exportCanvas.height = 220;
    var ctx = exportCanvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    // if the image is already loaded draw immediately, otherwise wait for load
    if (img.complete && img.naturalWidth !== 0) {
      ctx.drawImage(img, 0, 0, exportCanvas.width, exportCanvas.height);
      callback(exportCanvas);
    } else {
      img.onload = function () {
        ctx.drawImage(img, 0, 0, exportCanvas.width, exportCanvas.height);
        callback(exportCanvas);
      };
    }
  }

  function triggerDownload(dataURL, filename) {
    var link = document.createElement('a');
    link.download = filename;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function downloadPNG() {
    getExportCanvas(function (canvas) {
      triggerDownload(canvas.toDataURL('image/png'), 'qr-code.png');
    });
  }

  // JPEG has no alpha channel — the white fill in getExportCanvas handles this
  function downloadJPG() {
    getExportCanvas(function (canvas) {
      triggerDownload(canvas.toDataURL('image/jpeg', 0.95), 'qr-code.jpg');
    });
  }

  // embed the PNG data URL inside an SVG image tag for the SVG export
  function downloadSVG() {
    getExportCanvas(function (canvas) {
      var dataURL = canvas.toDataURL('image/png');
      var svgContent = [
        '<svg xmlns="http://www.w3.org/2000/svg"',
        '     xmlns:xlink="http://www.w3.org/1999/xlink"',
        '     width="220" height="220">',
        '  <image href="' + dataURL + '" width="220" height="220"/>',
        '</svg>'
      ].join('\n');
      var blob = new Blob([svgContent], { type: 'image/svg+xml' });
      var objectURL = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.download = 'qr-code.svg';
      link.href = objectURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // defer revoke so the browser starts the download before the blob is released
      setTimeout(function () { URL.revokeObjectURL(objectURL); }, 1000);
    });
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
