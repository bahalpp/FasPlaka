(() => {
	const textEl = document.getElementById('plateText');
	const bandEl = document.getElementById('plateBand');
	const textColorInput = document.getElementById('textColorInput');
	const alignButtons = Array.from(document.querySelectorAll('.align-btn'));
	const plateTop = document.querySelector('.plate-top');
		const iconLeft = document.getElementById('iconLeft');
		const iconRight = document.getElementById('iconRight');
		const iconLeftSelect = document.getElementById('iconLeftSelect');
		const iconRightSelect = document.getElementById('iconRightSelect');

	function sanitizeText(str) {
		// Basit temizlik: Çoklu boşlukları tek boşluğa indir, 32 karakter üstünü input zaten kesiyor
		return (str || '').replace(/\s+/g, ' ').trim();
	}

	function updatePreview() {
		const t = sanitizeText(textEl?.textContent);
		if (textEl) textEl.textContent = (t || '').toUpperCase();
		if (bandEl) bandEl.style.setProperty('--text-color', textColorInput?.value || '#ffffff');
	}

	// Event bindings
	['input', 'change'].forEach(evt => {
		textColorInput?.addEventListener(evt, updatePreview);
	});

		// Hizalama
		function setAlignment(pos) {
			const map = { left: 'flex-start', center: 'center', right: 'flex-end' };
			bandEl.style.setProperty('--content-justify', map[pos] || 'center');
			alignButtons.forEach(b => b.classList.toggle('active', b.dataset.align === pos));
		}
		alignButtons.forEach(btn => btn.addEventListener('click', () => setAlignment(btn.dataset.align)));


	// İlk yükleme
	updatePreview();
		setAlignment('center');

		// İkon kontrolleri
		function updateIcons() {
			iconLeft.textContent = iconLeftSelect?.value || '';
			iconRight.textContent = iconRightSelect?.value || '';
			
		}
		['change', 'input'].forEach(evt => {
			iconLeftSelect?.addEventListener(evt, updateIcons);
			iconRightSelect?.addEventListener(evt, updateIcons);
		
		});
		updateIcons();

	// Alt plaka üzerinde doğrudan yazma: satır sonunu engelle, uzunluğu sınırla
	const MAX_LEN = 32;
	textEl?.addEventListener('keydown', (e) => { if (e.key === 'Enter') e.preventDefault(); });
	textEl?.addEventListener('input', () => {
		let t = sanitizeText(textEl.textContent).toUpperCase();
		if (t.length > MAX_LEN) t = t.slice(0, MAX_LEN);
		textEl.textContent = t;
		// caret'i sona taşı
		const r = document.createRange();
		r.selectNodeContents(textEl);
		r.collapse(false);
		const sel = window.getSelection();
		sel.removeAllRanges();
		sel.addRange(r);
	});

	bandEl?.addEventListener('click', () => textEl?.focus());
})();
