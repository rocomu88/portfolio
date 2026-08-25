/* Password gate for case study pages (client-side deterrent, not real security) */
(function () {
  var KEY = 'case-study-access';
  var HASH = '2f0563193d5336a331f127ccdf2b0829cb40b18bda2a2ec3669f436e6c56ecec';

  var form = document.getElementById('passGateForm');
  var input = document.getElementById('passGateInput');
  var errorEl = document.getElementById('passGateError');
  if (!form || !input) return;

  function sha256Hex(text) {
    var data = new TextEncoder().encode(text);
    return crypto.subtle.digest('SHA-256', data).then(function (buf) {
      return Array.from(new Uint8Array(buf)).map(function (b) {
        return b.toString(16).padStart(2, '0');
      }).join('');
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var val = input.value;
    if (!val) return;
    sha256Hex(val).then(function (hex) {
      if (hex === HASH) {
        localStorage.setItem(KEY, '1');
        document.body.classList.remove('locked');
      } else {
        errorEl.textContent = 'Incorrect password. Try again.';
        input.classList.remove('error');
        void input.offsetWidth;
        input.classList.add('error');
        input.value = '';
        input.focus();
      }
    });
  });
})();
