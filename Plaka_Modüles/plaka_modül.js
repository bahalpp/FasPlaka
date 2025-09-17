(() => {
	const textEl = document.getElementById('plateText');
	const bandEl = document.getElementById('plateBand');
	const textColorInput = document.getElementById('textColorInput');
	const alignButtons = Array.from(document.querySelectorAll('.align-btn'));
	const plateTop = document.querySelector('.plate-top');
		const iconLeft = document.getElementById('iconLeft');
		const iconRight = document.getElementById('iconRight');
	// Button tabanlı kontroller
	const choiceButtons = Array.from(document.querySelectorAll('.choice-btn'));

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
	['input', 'change'].forEach(evt => { textColorInput?.addEventListener(evt, updatePreview); });

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

	// Choice button davranışı (renk ve ikonlar)
	function setActiveInGroup(group, btn) {
		choiceButtons.filter(b => b.dataset.group === group)
			.forEach(b => b.classList.toggle('active', b === btn));
	}

	function handleChoiceClick(e) {
		const btn = e.currentTarget;
		const group = btn.dataset.group;
		const value = btn.dataset.value ?? '';
		setActiveInGroup(group, btn);
		if (group === 'text-color') {
			bandEl.style.setProperty('--text-color', value || '#ffffff');
		} else if (group === 'icon-left') {
			iconLeft.textContent = value;
		} else if (group === 'icon-right') {
			iconRight.textContent = value;
		}
	}

	choiceButtons.forEach(btn => btn.addEventListener('click', handleChoiceClick));

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

	// Toolbar inline görünür; toggle mantığı kaldırıldı

	// Her kontrol için açılır menü toggle
	const controls = Array.from(document.querySelectorAll('.control'));
	function closeAllMenus(except) {
		controls.forEach(ctrl => {
			if (ctrl === except) return;
			const toggle = ctrl.querySelector('.control-toggle');
			const menu = ctrl.querySelector('.control-menu');
			if (toggle && menu) {
				toggle.setAttribute('aria-expanded', 'false');
				menu.setAttribute('aria-hidden', 'true');
				menu.hidden = true;
			}
		});
	}
	controls.forEach(ctrl => {
		const toggle = ctrl.querySelector('.control-toggle');
		const menu = ctrl.querySelector('.control-menu');
		if (!toggle || !menu) return;
		menu.setAttribute('aria-hidden', 'true');
		toggle.addEventListener('click', (e) => {
			e.stopPropagation();
			const expanded = toggle.getAttribute('aria-expanded') === 'true';
			closeAllMenus(ctrl);
			toggle.setAttribute('aria-expanded', String(!expanded));
			menu.hidden = expanded;
			menu.setAttribute('aria-hidden', expanded ? 'true' : 'false');
		});
	});

	// Dışarı tıklayınca kapat
	document.addEventListener('click', () => closeAllMenus());
	// ESC ile kapat
	document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAllMenus(); });
})();
