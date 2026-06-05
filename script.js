function fmt(n) {
  return 'Rp ' + n.toLocaleString('id-ID');
}

function hitungTagihan() {
  const waktu = parseInt(document.getElementById('waktu').value) || 0;
  const peserta = parseInt(document.getElementById('peserta').value) || 0;
  let harga = 0;
  if (document.getElementById('penginapan')?.checked)   harga += 1000000;
  if (document.getElementById('transportasi')?.checked) harga += 1200000;
  if (document.getElementById('makanan')?.checked)      harga += 500000;

  const total = waktu * peserta * harga;
  const elHarga = document.getElementById('hargaPaket');
  
  if (elHarga) {
    document.getElementById('hargaPaket').textContent = fmt(harga);
    document.getElementById('infoWaktu').textContent = waktu + ' hari';
    document.getElementById('infoPeserta').textContent = peserta + ' orang';
    document.getElementById('totalTagihan').textContent = fmt(total);
  }
}

function simpanPesanan() {
  const nama  = document.getElementById('nama').value.trim();
  const telp  = document.getElementById('telp').value.trim();
  const waktu = parseInt(document.getElementById('waktu').value) || 0;
  const peserta = parseInt(document.getElementById('peserta').value) || 0;

  const layanan = [];
  if (document.getElementById('penginapan').checked)   layanan.push('Penginapan');
  if (document.getElementById('transportasi').checked) layanan.push('Transportasi');
  if (document.getElementById('makanan').checked)      layanan.push('Makanan');

  if (!nama || !telp || !waktu || !peserta || layanan.length === 0) {
    alert('⚠️ Data form pemesanan harus terisi lengkap!');
    return;
  }

  let harga = 0;
  if (document.getElementById('penginapan').checked)   harga += 1000000;
  if (document.getElementById('transportasi').checked) harga += 1200000;
  if (document.getElementById('makanan').checked)      harga += 500000;

  const total = waktu * peserta * harga;

  document.getElementById('resumeContent').innerHTML = `
    <div class="resume-row"><span class="resume-label">Nama Pemesan</span><span class="resume-val">${nama}</span></div>
    <div class="resume-row"><span class="resume-label">No. Telepon</span><span class="resume-val">${telp}</span></div>
    <div class="resume-row"><span class="resume-label">Jumlah Peserta</span><span class="resume-val">${peserta} orang</span></div>
    <div class="resume-row"><span class="resume-label">Waktu Perjalanan</span><span class="resume-val">${waktu} hari</span></div>
    <div class="resume-row"><span class="resume-label">Layanan Paket</span><span class="resume-val">${layanan.join(', ')}</span></div>
    <div class="resume-row"><span class="resume-label">Harga Paket</span><span class="resume-val">${fmt(harga)}</span></div>
  `;
  document.getElementById('modalTotal').textContent = fmt(total);
  document.getElementById('modalOverlay').classList.add('show');
}

function tutupModal() {
  document.getElementById('modalOverlay').classList.remove('show');
}

function pesanLagi() {
  tutupModal();
  resetForm();
  document.getElementById('pesan').scrollIntoView({ behavior: 'smooth' });
}

function resetForm() {
  document.getElementById('nama').value = '';
  document.getElementById('telp').value = '';
  document.getElementById('waktu').value = '';
  document.getElementById('peserta').value = '';
  document.getElementById('penginapan').checked = false;
  document.getElementById('transportasi').checked = false;
  document.getElementById('makanan').checked = false;
  hitungTagihan();
}