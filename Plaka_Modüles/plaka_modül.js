(() => {
	const textEl = document.getElementById('plateText');
	const bandEl = document.getElementById('plateBand');
	const textInput = document.getElementById('plateTextInput');
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
		const t = sanitizeText(textInput.value);
		textEl.textContent = t || 'PLAKALIK YAZISI GİR';
		bandEl.style.setProperty('--text-color', textColorInput.value || '#ffffff');
	}

	// Event bindings
	['input', 'change'].forEach(evt => {
		textInput.addEventListener(evt, updatePreview);
		textColorInput.addEventListener(evt, updatePreview);
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
})();
