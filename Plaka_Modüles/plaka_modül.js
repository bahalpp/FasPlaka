(() => {
	// Bu dosya, plaka önizleme alanını (alt bant) canlı olarak günceller.
	// Olayı tetikleyenler: kullanıcı yazı şeridi içine yazdığında, kontrol menülerinden
	// hizalama/renk/ikon seçimlerine tıkladığında, menü başlıklarına tıklayıp açtığında,
	// sayfa boyutu değiştiğinde (menüleri kapatmak için) ve sayfa genelinde ESC/dış tıklamalar.

	// SIK KULLANILAN DOM REFERANSLARI
	const textEl = document.getElementById('plateText');       // Kullanıcının yazdığı metin (contenteditable)
	const bandEl = document.getElementById('plateBand');       // Yazı şeridinin tamamı (stil değişimleri burada)
	const alignButtons = Array.from(document.querySelectorAll('.align-btn')); // Hizalama seçenekleri
	const iconLeft = document.getElementById('iconLeft');      // Sol ikon alanı
	const iconRight = document.getElementById('iconRight');    // Sağ ikon alanı
	// Button tabanlı kontroller (renk/ikon/yazı tipi gibi seçenek butonları)
	const choiceButtons = Array.from(document.querySelectorAll('.choice-btn'));

	/**
	 * Kullanıcı metnini güvenli ve tutarlı hale getirmek için basit bir temizlik.
	 * - Çoklu boşlukları tek boşluğa indirir
	 * - Baştaki/sondaki boşlukları kırpar
	 */
	function sanitizeText(str) {
		return (str || '').replace(/\s+/g, ' ').trim();
	}

	/**
	 * Önizlemeyi başlangıçta toparlamak için çağrılır.
	 * - Metni uppercase yapar
	 * - Aktif renk butonundan yazı rengini CSS değişkeni olarak yazar
	 */
	function updatePreview() {
		const t = sanitizeText(textEl?.textContent);
		if (textEl) textEl.textContent = (t || '').toUpperCase();
		const activeColor = document.querySelector('.choice-btn.color.active')?.dataset.value || '#ffffff';
		bandEl?.style.setProperty('--text-color', activeColor);
	}

	// Event bindings
	// Renk butonları üzerinden güncelleniyor; ekstra input dinleyicisi yok

		// HİZALAMA
		/**
		 * Yazı şeridindeki içerik hizasını günceller.
		 * Tetikleyici: .align-btn butonlarından birine tıklamak.
		 */
		function setAlignment(pos) {
			const map = { left: 'flex-start', center: 'center', right: 'flex-end' };
			bandEl.style.setProperty('--content-justify', map[pos] || 'center');
			alignButtons.forEach(b => b.classList.toggle('active', b.dataset.align === pos));
		}
		// Her hizalama butonuna tıklanınca setAlignment çalışır
		alignButtons.forEach(btn => btn.addEventListener('click', () => setAlignment(btn.dataset.align)));


	// İLK YÜKLEME: başlangıç durumunu düzenle
	updatePreview();
		setAlignment('center');

	// CHOICE BUTONLARI (RENK/İKON)
	// Grup içinde tek bir aktif buton tutulur. Renk seçimi metin rengini günceller;
	// Sol/Sağ ikon seçimleri ilgili alana karakteri yazar.
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

	// Tetikleyici: renk/ikon butonlarına tıklama -> handleChoiceClick
	choiceButtons.forEach(btn => btn.addEventListener('click', handleChoiceClick));

	// METİN DÜZENLEME (contenteditable)
	// Kullanıcı alt bant üzerine doğrudan yazabilir.
	// Kısıtlar: Enter ile satır eklenmesi engellenir; maksimum karakter sayısı uygulanır;
	// metin her girişte uppercase yapılır ve caret sona taşınır.
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

	// Tetikleyici: Bant alanına tıklama -> yazı alanına odaklan
	bandEl?.addEventListener('click', () => textEl?.focus());

	// Toolbar inline görünür; eski toplu toggle mantığı kaldırıldı.

	// AÇILIR MENÜLER (Dropdown)
	// Her .control için menü başlığına tıklayınca ilgili menü açılır/kapanır.
	// Aynı anda yalnızca bir menü açık kalır. Dış tıklama/ESC/resize ile menüler kapanır.
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
		/**
		 * Menüyü ekran taşımlarına göre hizalar.
		 * Varsayılan sol hizadır; sağa taşma varsa sağa yaslar.
		 * Tetikleyici: menü ilk açıldığında çağrılır.
		 */
		function positionMenu() {
			menu.style.left = '0px';
			menu.style.right = 'auto';
			menu.style.maxWidth = '';
			const rect = menu.getBoundingClientRect();
			const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
			if (rect.right > vw - 8) {
				menu.style.left = 'auto';
				menu.style.right = '0px';
			}
		}
		toggle.addEventListener('click', (e) => {
			e.stopPropagation();
			const expanded = toggle.getAttribute('aria-expanded') === 'true';
			closeAllMenus(ctrl);
			toggle.setAttribute('aria-expanded', String(!expanded));
			menu.hidden = expanded;
			menu.setAttribute('aria-hidden', expanded ? 'true' : 'false');
			if (!expanded) {
				// Menu yeni açıldı; konumunu ayarla
				positionMenu();
			}
		});
	});

	// Global Kapanış Tetikleyicileri
	// Dışarı tıklayınca kapat
	document.addEventListener('click', () => closeAllMenus());
	// ESC ile kapat
	document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAllMenus(); });
	// Resize/orientation değişince kapat (mobil duyarlılık)
	let resizeTimer;
	window.addEventListener('resize', () => {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(() => closeAllMenus(), 120);
	});

// KAYDET BUTONU: Plaka bilgilerini JSON olarak console'a yazdırır
document.getElementById('savePlateBtn')?.addEventListener('click', () => {
	// Plaka metni
	const text = textEl?.textContent || '';
	// Aktif yazı rengi
	const textColorBtn = document.querySelector('.choice-btn.color.active');
	const textColor = textColorBtn?.dataset.value || '#ffffff';
	// Bant arka plan rengi (şu an sabit, isterseniz ekleyebilirim)
	const bandBg = bandEl?.style.getPropertyValue('--band-bg') || '#000000';
	// Sol/Sağ ikon
	const iconLeftVal = iconLeft?.textContent || '';
	const iconRightVal = iconRight?.textContent || '';
	// Hizalama
	let align = 'center';
	const alignBtn = document.querySelector('.align-btn.active');
	if (alignBtn) align = alignBtn.dataset.align;
	// Yazı tipi
	let font = 'Arial';
	const fontBtn = document.querySelector('.choice-btn[data-group="font-family"].active');
	if (fontBtn) font = fontBtn.dataset.value;
	// JSON objesi
	const plateData = {
		text,
		textColor,
		bandBg,
		iconLeft: iconLeftVal,
		iconRight: iconRightVal,
		align,
		font
	};
	console.log('Plaka Bilgileri:', JSON.stringify(plateData, null, 2));
});
})();
