const VOUCHERS = {
  'DISKON10': { type: 'percent', value: 10, label: 'Diskon 10%' },
  'DISKON20': { type: 'percent', value: 20, label: 'Diskon 20%' },
  'PROMO50': { type: 'percent', value: 50, label: 'Diskon 50%' },
  'PIKNIKMURAH': { type: 'nominal', value: 100000, label: 'Potongan Rp 100.000' }
};

function fmt(n) {
  return 'Rp ' + n.toLocaleString('id-ID');
}

function hitungTagihan() {
  const waktu = parseInt(document.getElementById('waktu')?.value) || 0;
  const peserta = parseInt(document.getElementById('peserta')?.value) || 0;
  let harga = 0;
  
  if (document.getElementById('penginapan')?.checked)   harga += 1000000;
  if (document.getElementById('transportasi')?.checked) harga += 1200000;
  if (document.getElementById('makanan')?.checked)      harga += 500000;

  const totalSebelumDiskon = waktu * peserta * harga;
  let diskon = 0;

  const voucherInput = document.getElementById('voucher');
  const msgEl = document.getElementById('voucherMessage');
  const rowDiskon = document.getElementById('rowDiskon');
  const nilaiDiskonEl = document.getElementById('nilaiDiskon');

  if (voucherInput && msgEl) {
    const code = voucherInput.value.trim().toUpperCase();
    if (code === '') {
      msgEl.textContent = '';
      if (rowDiskon) rowDiskon.style.display = 'none';
    } else if (VOUCHERS[code]) {
      const v = VOUCHERS[code];
      if (v.type === 'percent') {
        diskon = Math.round(totalSebelumDiskon * (v.value / 100));
      } else if (v.type === 'nominal') {
        diskon = Math.min(v.value, totalSebelumDiskon);
      }
      msgEl.textContent = `✓ Voucher "${code}" berhasil digunakan (${v.label})`;
      msgEl.style.color = '#4caf50';
      if (rowDiskon && diskon > 0) {
        rowDiskon.style.display = 'flex';
        nilaiDiskonEl.textContent = '-' + fmt(diskon);
      } else if (rowDiskon) {
        rowDiskon.style.display = 'none';
      }
    } else {
      msgEl.textContent = '✗ Kode voucher tidak valid';
      msgEl.style.color = 'var(--coral)';
      if (rowDiskon) rowDiskon.style.display = 'none';
    }
  }

  const total = Math.max(0, totalSebelumDiskon - diskon);
  const elHarga = document.getElementById('hargaPaket');
  
  if (elHarga) {
    document.getElementById('hargaPaket').textContent = fmt(harga);
    document.getElementById('infoWaktu').textContent = waktu + ' hari';
    document.getElementById('infoPeserta').textContent = peserta + ' orang';
    document.getElementById('totalTagihan').textContent = fmt(total);
  }
}

let currentBooking = null;

function simpanPesanan() {
  const nama  = document.getElementById('nama').value.trim();
  const telp  = document.getElementById('telp').value.trim();
  const waktu = parseInt(document.getElementById('waktu').value) || 0;
  const peserta = parseInt(document.getElementById('peserta').value) || 0;
  const layanan = [];
  
  if (document.getElementById('penginapan').checked) layanan.push('Penginapan');
  if (document.getElementById('transportasi').checked) layanan.push('Transportasi');
  if (document.getElementById('makanan').checked) layanan.push('Makanan');

  if (!nama || !telp || !waktu || !peserta || layanan.length === 0) {
    alert('⚠️ Data form pemesanan harus terisi lengkap!');
    return;
  }

  let harga = 0;
  if (document.getElementById('penginapan').checked) harga += 1000000;
  if (document.getElementById('transportasi').checked) harga += 1200000;
  if (document.getElementById('makanan').checked) harga += 500000;

  const totalSebelumDiskon = waktu * peserta * harga;
  let diskon = 0;
  let voucherApplied = '';
  const voucherInput = document.getElementById('voucher');
  
  if (voucherInput) {
    const code = voucherInput.value.trim().toUpperCase();
    if (VOUCHERS[code]) {
      const v = VOUCHERS[code];
      if (v.type === 'percent') {
        diskon = Math.round(totalSebelumDiskon * (v.value / 100));
      } else if (v.type === 'nominal') {
        diskon = Math.min(v.value, totalSebelumDiskon);
      }
      voucherApplied = code;
    }
  }

  const total = Math.max(0, totalSebelumDiskon - diskon);

  currentBooking = { nama, telp, waktu, peserta, layanan, harga, diskon, total, voucherApplied };

  let resumeHTML = `
    <div class="resume-row"><span class="resume-label">Nama Pemesan</span><span class="resume-val">${nama}</span></div>
    <div class="resume-row"><span class="resume-label">No. Telepon</span><span class="resume-val">${telp}</span></div>
    <div class="resume-row"><span class="resume-label">Jumlah Peserta</span><span class="resume-val">${peserta} orang</span></div>
    <div class="resume-row"><span class="resume-label">Waktu Perjalanan</span><span class="resume-val">${waktu} hari</span></div>
    <div class="resume-row"><span class="resume-label">Layanan Paket</span><span class="resume-val">${layanan.join(', ')}</span></div>
    <div class="resume-row"><span class="resume-label">Harga Paket</span><span class="resume-val">${fmt(harga)}</span></div>
  `;

  if (diskon > 0) {
    resumeHTML += `<div class="resume-row" style="color: var(--coral);"><span class="resume-label" style="color: var(--coral);">Potongan Voucher (${voucherApplied})</span><span class="resume-val">-${fmt(diskon)}</span></div>`;
  }

  document.getElementById('resumeContent').innerHTML = resumeHTML;
  document.getElementById('modalTotal').textContent = fmt(total);
  document.getElementById('modalConfirmState').style.display = 'block';
  document.getElementById('modalTicketState').style.display = 'none';
  
  const successState = document.getElementById('modalSuccessState');
  if (successState) successState.style.display = 'none';
  
  document.getElementById('modalOverlay').classList.add('show');
}

function konfirmasiPesanan() {
  if (!currentBooking) return;

  const ticketId = 'RAT-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
  const activeHotel = currentBooking.layanan.includes('Penginapan') ? 'active hotel' : '';
  const activeTransport = currentBooking.layanan.includes('Transportasi') ? 'active transport' : '';
  const activeFood = currentBooking.layanan.includes('Makanan') ? 'active food' : '';

  let discountRowHTML = '';
  if (currentBooking.diskon > 0) {
    discountRowHTML = `<div class="ticket-label" style="color: var(--coral); margin-top: 0.2rem; font-size: 0.75rem;">Potongan: -${fmt(currentBooking.diskon)} (${currentBooking.voucherApplied})</div>`;
  }

  const ticketHTML = `
    <div class="ticket">
      <div class="ticket-header">
        <span class="ticket-title">Raja Ampat Tours</span>
        <span class="ticket-id">${ticketId}</span>
      </div>
      <div class="ticket-body">
        <div class="ticket-item">
          <span class="ticket-label">Nama Pemesan</span>
          <span class="ticket-value">${currentBooking.nama}</span>
        </div>
        <div class="ticket-item">
          <span class="ticket-label">No. Telepon</span>
          <span class="ticket-value">${currentBooking.telp}</span>
        </div>
        <div class="ticket-item">
          <span class="ticket-label">Jumlah Peserta</span>
          <span class="ticket-value">${currentBooking.peserta} orang</span>
        </div>
        <div class="ticket-item">
          <span class="ticket-label">Waktu Perjalanan</span>
          <span class="ticket-value">${currentBooking.waktu} hari</span>
        </div>
        <div class="ticket-services">
          <div class="ticket-services-title">Layanan Terpilih</div>
          <div class="ticket-badges">
            <div class="ticket-badge ${activeHotel}">
              <span style="font-size:1.1rem;">🏨</span>
              <span style="font-size:0.65rem;margin-top:0.1rem;">Penginapan</span>
            </div>
            <div class="ticket-badge ${activeTransport}">
              <span style="font-size:1.1rem;">🛥️</span>
              <span style="font-size:0.65rem;margin-top:0.1rem;">Transport</span>
            </div>
            <div class="ticket-badge ${activeFood}">
              <span style="font-size:1.1rem;">🍽️</span>
              <span style="font-size:0.65rem;margin-top:0.1rem;">Makanan</span>
            </div>
          </div>
        </div>
      </div>
      <div class="ticket-footer">
        <div class="ticket-price-box">
          <span class="ticket-label">Total Pembayaran</span>
          <span class="ticket-value" style="font-size: 1.25rem; color: var(--sky); font-family: 'Playfair Display', serif;">${fmt(currentBooking.total)}</span>
          ${discountRowHTML}
        </div>
        <div class="ticket-barcode"></div>
      </div>
    </div>
    <p style="font-size:0.82rem;color:var(--muted);text-align:center;margin-bottom:1rem;margin-top:1.5rem;">🎉 Pemesanan berhasil dikonfirmasi!</p>
    <div class="modal-btns">
      <button class="btn-yes" onclick="pesanLagi()" style="width:100%;">Pesan Lagi</button>
    </div>
  `;

  document.getElementById('modalTicketState').innerHTML = ticketHTML;
  document.getElementById('modalConfirmState').style.display = 'none';
  document.getElementById('modalSuccessState').style.display = 'block';

  setTimeout(() => {
    document.getElementById('modalSuccessState').style.display = 'none';
    document.getElementById('modalTicketState').style.display = 'block';
  }, 1500);
}

function resetForm() {
  document.getElementById('nama').value = '';
  document.getElementById('telp').value = '';
  document.getElementById('waktu').value = '';
  document.getElementById('peserta').value = '';
  document.getElementById('penginapan').checked = false;
  document.getElementById('transportasi').checked = false;
  document.getElementById('makanan').checked = false;
  
  const voucherInput = document.getElementById('voucher');
  if (voucherInput) voucherInput.value = '';
  
  const msgEl = document.getElementById('voucherMessage');
  if (msgEl) msgEl.textContent = '';
  
  const rowDiskon = document.getElementById('rowDiskon');
  if (rowDiskon) rowDiskon.style.display = 'none';

  document.getElementById('modalConfirmState').style.display = 'block';
  document.getElementById('modalTicketState').style.display = 'none';
  
  const successState = document.getElementById('modalSuccessState');
  if (successState) successState.style.display = 'none';
  
  hitungTagihan();
}

function tutupModal() {
  document.getElementById('modalOverlay').classList.remove('show');
}

function pesanLagi() {
  tutupModal();
  resetForm();
  document.getElementById('pesan').scrollIntoView({ behavior: 'smooth' });
}

document.addEventListener("DOMContentLoaded", function() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length > 0) {
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(faq => {
          faq.classList.remove('active');
        });
        if (!isActive) {
          item.classList.add('active');
        }
      });
    });
  }
});