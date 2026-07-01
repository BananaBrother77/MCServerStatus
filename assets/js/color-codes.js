const COLOURS = [
  { code: '0', name: 'Black', hex: '#000000' },
  { code: '1', name: 'Dark Blue', hex: '#0000AA' },
  { code: '2', name: 'Dark Green', hex: '#00AA00' },
  { code: '3', name: 'Dark Aqua', hex: '#00AAAA' },
  { code: '4', name: 'Dark Red', hex: '#AA0000' },
  { code: '5', name: 'Dark Purple', hex: '#AA00AA' },
  { code: '6', name: 'Gold', hex: '#FFAA00' },
  { code: '7', name: 'Gray', hex: '#AAAAAA' },
  { code: '8', name: 'Dark Gray', hex: '#555555' },
  { code: '9', name: 'Blue', hex: '#5555FF' },
  { code: 'a', name: 'Green', hex: '#55FF55' },
  { code: 'b', name: 'Aqua', hex: '#55FFFF' },
  { code: 'c', name: 'Red', hex: '#FF5555' },
  { code: 'd', name: 'Light Purple', hex: '#FF55FF' },
  { code: 'e', name: 'Yellow', hex: '#FFFF55' },
  { code: 'f', name: 'White', hex: '#FFFFFF' },
];

const FORMATS = [
  { code: 'k', name: 'Obfuscated', style: 'obfuscated' },
  { code: 'l', name: 'Bold', style: 'bold' },
  { code: 'm', name: 'Strikethrough', style: 'line-through' },
  { code: 'n', name: 'Underline', style: 'underline' },
  { code: 'o', name: 'Italic', style: 'italic' },
  { code: 'r', name: 'Reset', style: 'reset' },
];

const els = {
  colourGrid: document.getElementById('colourGrid'),
  formatGrid: document.getElementById('formatGrid'),
  input: document.getElementById('codeInput'),
  preview: document.getElementById('codePreview'),
  copyBtn: document.getElementById('copyBtn'),
};

function renderSwatches() {
  let colourHtml = '';
  COLOURS.forEach((c) => {
    colourHtml += `
      <button class="swatch" type="button" data-code="${c.code}">
        <span class="swatch-preview" style="background:${c.hex}"></span>
        <span>${c.name}</span>
        <span class="swatch-code">&${c.code}</span>
      </button>`;
  });
  els.colourGrid.innerHTML = colourHtml;

  let formatHtml = '';
  FORMATS.forEach((f) => {
    const labelStyle =
      f.style === 'bold'
        ? 'font-weight:700'
        : f.style === 'italic'
          ? 'font-style:italic'
          : f.style === 'underline'
            ? 'text-decoration:underline'
            : f.style === 'line-through'
              ? 'text-decoration:line-through'
              : f.style === 'obfuscated'
                ? 'opacity:0.4'
                : '';

    formatHtml += `
      <button class="swatch swatch--format" type="button" data-code="${f.code}">
        <span style="${labelStyle}">${f.name}</span>
        <span class="swatch-code">&${f.code}</span>
      </button>`;
  });
  els.formatGrid.innerHTML = formatHtml;

  els.colourGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.swatch');
    if (btn) insertCode(btn.dataset.code);
  });

  els.formatGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.swatch');
    if (btn) insertCode(btn.dataset.code);
  });
}

function insertCode(code) {
  const { input } = els;
  const start = input.selectionStart;
  const end = input.selectionEnd;
  const text = input.value;
  input.value = text.slice(0, start) + `&${code}` + text.slice(end);
  input.selectionStart = input.selectionEnd = start + 2;
  input.focus();
  updatePreview();
}

function parseCodes(text) {
  const parts = [];
  let currentStyles = [];
  let i = 0;
  let buf = '';

  function pushPart() {
    if (buf) {
      parts.push({ text: buf, styles: [...currentStyles] });
      buf = '';
    }
  }

  while (i < text.length) {
    if (text[i] === '&' && i + 1 < text.length) {
      const code = text[i + 1].toLowerCase();
      i += 2;
      pushPart();

      if (code === 'r') {
        currentStyles = [];
      } else if (code === 'k') {
        currentStyles.push('obfuscated');
      } else if (code === 'l') {
        currentStyles.push('bold');
      } else if (code === 'm') {
        currentStyles.push('line-through');
      } else if (code === 'n') {
        currentStyles.push('underline');
      } else if (code === 'o') {
        currentStyles.push('italic');
      } else {
        const colour = COLOURS.find((c) => c.code === code);
        if (colour) {
          currentStyles = currentStyles.filter(
            (s) =>
              s === 'bold' ||
              s === 'italic' ||
              s === 'underline' ||
              s === 'line-through' ||
              s === 'obfuscated',
          );
          currentStyles.push(colour.hex);
        }
      }
    } else {
      buf += text[i];
      i++;
    }
  }
  pushPart();

  return parts;
}

function renderPreview(text) {
  if (!text.trim()) {
    els.preview.innerHTML =
      '<span style="color:var(--text-muted);opacity:0.4">Your formatted text will appear here...</span>';
    return;
  }

  const parts = parseCodes(text);
  let html = '';

  for (const part of parts) {
    let spanStyle = '';
    let hexColour = null;

    for (const style of part.styles) {
      if (style.startsWith('#')) {
        hexColour = style;
      } else if (style === 'bold') {
        spanStyle += 'font-weight:700;';
      } else if (style === 'italic') {
        spanStyle += 'font-style:italic;';
      } else if (style === 'underline') {
        spanStyle += 'text-decoration:underline;';
      } else if (style === 'line-through') {
        spanStyle += 'text-decoration:line-through;';
      } else if (style === 'obfuscated') {
        spanStyle += 'opacity:0.3;filter:blur(3px);user-select:none;';
      }
    }

    if (hexColour) spanStyle += `color:${hexColour};`;
    html += `<span style="${spanStyle}">${part.text}</span>`;
  }

  els.preview.innerHTML = html;
}

function updatePreview() {
  renderPreview(els.input.value);
}

function copyText() {
  const text = els.preview.textContent;
  if (!text.trim()) return;

  navigator.clipboard.writeText(text).then(() => {
    const icon = els.copyBtn.querySelector('i');

    icon.setAttribute('data-lucide', 'check');

    lucide.createIcons();
    setTimeout(() => {
      icon.setAttribute('data-lucide', 'copy');
      lucide.createIcons();
    }, 1500);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderSwatches();

  els.input.addEventListener('input', updatePreview);
  renderPreview('');

  els.copyBtn.addEventListener('click', copyText);
});
