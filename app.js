document.addEventListener('DOMContentLoaded',function(){
  const pageSplash = document.getElementById('page-splash');
  const pageHome = document.getElementById('page-home');
  const pageInput = document.getElementById('page-input');
  const pageResults = document.getElementById('page-results');

  // Splash timeout
  setTimeout(()=>{
    if(pageSplash){
      pageSplash.classList.remove('active');
      pageHome.classList.add('active');
    }
  },2500);

  const btnStart = document.getElementById('btn-start');
  const btnPreset = document.getElementById('btn-preset');
  const backHome = document.getElementById('back-home');
  const btnBack = document.getElementById('btn-back');
  const form = document.getElementById('sim-form');
  const btnRun = document.getElementById('btn-run');
  const btnRepeat = document.getElementById('btn-repeat');
  const loading = document.getElementById('loading');
  const graphCard = document.getElementById('graph-card');
  const tableCard = document.getElementById('table-card');
  const formulaCard = document.getElementById('formula-card');
  const calcCard = document.getElementById('calc-card');
  const summaryCard = document.getElementById('summary-card');
  const classificationCard = document.getElementById('classification-card');

  function show(page){
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    page.classList.add('active');
  }

  btnStart.addEventListener('click',()=> show(pageInput));
  btnPreset.addEventListener('click',()=>{
    document.getElementById('t0').value = 90;
    document.getElementById('ta').value = 27;
    document.getElementById('k').value = 0.05;
    document.getElementById('duration').value = 60;
    document.getElementById('dt').value = 1;
    validateAll();
  });
  backHome.addEventListener('click',()=> show(pageHome));
  btnBack.addEventListener('click',()=> show(pageHome));

  // Validation
  const inputs = {
    t0: document.getElementById('t0'),
    ta: document.getElementById('ta'),
    k: document.getElementById('k'),
    duration: document.getElementById('duration'),
    dt: document.getElementById('dt')
  };
  const errs = {
    t0: document.getElementById('err-t0'),
    ta: document.getElementById('err-ta'),
    k: document.getElementById('err-k'),
    duration: document.getElementById('err-duration'),
    dt: document.getElementById('err-dt')
  };

  function validateAll(){
    let ok = true;
    const t0 = parseFloat(inputs.t0.value);
    const ta = parseFloat(inputs.ta.value);
    const k = parseFloat(inputs.k.value);
    const duration = parseFloat(inputs.duration.value);
    const dt = parseFloat(inputs.dt.value);

    Object.values(errs).forEach(e=> e.textContent = '');

    if (isNaN(t0)){ errs.t0.textContent = 'Masukkan suhu awal'; ok=false; }
    if (isNaN(ta)){ errs.ta.textContent = 'Masukkan suhu lingkungan'; ok=false; }
    if (isNaN(k)){ errs.k.textContent = 'Masukkan konstanta pendinginan'; ok=false; }
    if (isNaN(duration)){ errs.duration.textContent = 'Masukkan durasi'; ok=false; }
    if (isNaN(dt)){ errs.dt.textContent = 'Masukkan Δt'; ok=false; }

    if (!isNaN(t0) && !isNaN(ta) && t0 <= ta){ errs.t0.textContent = 'Suhu awal harus lebih besar dari suhu lingkungan'; ok=false; }
    if (!isNaN(ta) && ta <= 0){ errs.ta.textContent = 'Suhu lingkungan tidak boleh ≤ 0 °C'; ok=false; }
    if (!isNaN(duration) && duration < 1){ errs.duration.textContent = 'Durasi simulasi terlalu pendek'; ok=false; }
    if (!isNaN(dt) && (!isFinite(dt) || dt <= 0 || (!isNaN(duration) && dt >= duration))){ errs.dt.textContent = 'Δt harus lebih kecil dari durasi simulasi'; ok=false; }
    if (!isNaN(k) && k <= 0){ errs.k.textContent = 'Konstanta pendinginan harus bernilai positif'; ok=false; }

    btnRun.disabled = !ok;
    return ok;
  }

  Object.values(inputs).forEach(inp=> inp.addEventListener('input', validateAll));
  validateAll();

  form.addEventListener('submit',function(e){
    e.preventDefault();
    if (!validateAll()) return;

    const t0 = parseFloat(inputs.t0.value);
    const ta = parseFloat(inputs.ta.value);
    const k = parseFloat(inputs.k.value);
    const duration = parseFloat(inputs.duration.value);
    const dt = parseFloat(inputs.dt.value);

    show(pageResults);
    loading.style.display = 'block';
    graphCard.style.display = 'none';
    tableCard.style.display = 'none';
    formulaCard.style.display = 'none';
    calcCard.style.display = 'none';
    summaryCard.style.display = 'none';
    classificationCard.style.display = 'none';

    setTimeout(()=>{
      loading.style.display = 'none';
      const steps = Math.ceil(duration / dt) + 1;
      const times = [];
      const temps = [];
      let T = t0;
      for (let i=0;i<steps;i++){
        times.push(+(i*dt).toFixed(2));
        temps.push(+T.toFixed(4));
        T = T + dt * (-k * (T - ta));
      }

      // chart
      graphCard.style.display = 'block';
      const ctx = document.getElementById('chart').getContext('2d');
      if (window._chart) window._chart.destroy();
      window._chart = new Chart(ctx, {
        type: 'line',
        data: { labels: times, datasets: [{ label: 'Suhu (°C)', data: temps, fill:false, borderColor:'#5b3928', tension:0.2, pointRadius:2 }] },
        options: { scales: { x:{ title:{ display:true, text:'Waktu (menit)'} }, y:{ title:{ display:true, text:'Suhu (°C)'} } } }
      });

      // table
      tableCard.style.display = 'block';
      const tableContainer = document.getElementById('table-container');
      let html = '<table><tr><th>Waktu (menit)</th><th>Suhu (°C)</th></tr>';
      for (let i=0;i<times.length;i++){
        html += `<tr><td>${times[i]}</td><td>${temps[i]}</td></tr>`;
      }
      html += '</table>';
      tableContainer.innerHTML = html;

      // formula
      formulaCard.style.display = 'block';

      // calc steps
      calcCard.style.display = 'block';
      const calcSteps = document.getElementById('calc-steps');
      let calcHtml = '<ol>';
      let Tn = t0;
      for (let i=0;i<Math.min(4, temps.length);i++){
        const next = +(Tn + dt * (-k * (Tn - ta)));
        calcHtml += `<li>T<sub>${i}</sub> = ${Tn.toFixed(4)} → T<sub>${i+1}</sub> = ${next.toFixed(4)}</li>`;
        Tn = next;
      }
      calcHtml += '</ol>';
      calcSteps.innerHTML = calcHtml;

      // summary
      let readyIndex = temps.findIndex(t=> t <= 65);
      let summaryText = (readyIndex === -1)
        ? 'Kopi tidak mencapai 65 °C dalam durasi simulasi.'
        : `Kopi anda siap diminum pada menit ke-${times[readyIndex]}.`;
      summaryCard.style.display = 'block';
      document.getElementById('summary-text').textContent = summaryText;

      // classification
      classificationCard.style.display = 'block';
      const lastTemp = temps[temps.length-1];
      let classText = '';
      if (lastTemp >= 70){ classText = '🔥 Kopi masih terlalu panas, tunggu beberapa menit lagi.'; }
      else if (lastTemp >= 60){ classText = '☕ Suhu kopi tepat untuk dinikmati.'; }
      else { classText = '❄️ Kopi sudah terlalu dingin, rasanya kurang nikmat.'; }
      document.getElementById('class-text').textContent = classText;

    },800);
  });

  btnRepeat.addEventListener('click',()=> show(pageInput));
});

// Register Service Worker for PWA
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js")
    .then(() => console.log("Service Worker registered"))
    .catch(err => console.log("SW registration failed:", err));
}
