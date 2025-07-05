let timer = null;

function formatMoney(n) {
  if (!n) return "...";
  if (n >= 1e12) return (n/1e12).toFixed(2) + "T $";
  if (n >= 1e9) return (n/1e9).toFixed(2) + "B $";
  if (n >= 1e6) return (n/1e6).toFixed(2) + "M $";
  return n.toLocaleString('en-US', {style:'currency', currency:'USD', maximumFractionDigits: 0});
}

async function fetchMarketCaps(force = false) {
  document.getElementById('btc').textContent = "...";
  document.getElementById('eth').textContent = "...";
  document.getElementById('total').textContent = "...";
  document.getElementById('alt').textContent = "...";
  document.getElementById('btc_dom').textContent = "...";
  document.getElementById('eth_dom').textContent = "...";
  document.getElementById('defi').textContent = "...";
  document.getElementById('ai').textContent = "...";
  document.getElementById('meme').textContent = "...";
  document.getElementById('updated').textContent = "Đang tải...";

  try {
    // 1. Market cap và dominance
    const [global, btc, eth, categories] = await Promise.all([
      fetch('https://api.coingecko.com/api/v3/global').then(r=>r.json()),
      fetch('https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false').then(r=>r.json()),
      fetch('https://api.coingecko.com/api/v3/coins/ethereum?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false').then(r=>r.json()),
      fetch('https://api.coingecko.com/api/v3/coins/categories').then(r=>r.json())
    ]);
    // Tổng
    const totalCap = global.data.total_market_cap.usd;
    const btcCap = btc.market_data.market_cap.usd;
    const ethCap = eth.market_data.market_cap.usd;
    const altCap = totalCap - btcCap - ethCap;
    // Dominance
    const btcDom = global.data.market_cap_percentage.btc;
    const ethDom = global.data.market_cap_percentage.eth;

    document.getElementById('btc').textContent = formatMoney(btcCap);
    document.getElementById('eth').textContent = formatMoney(ethCap);
    document.getElementById('total').textContent = formatMoney(totalCap);
    document.getElementById('alt').textContent = formatMoney(altCap);
    document.getElementById('btc_dom').textContent = btcDom ? btcDom.toFixed(2) + " %" : "...";
    document.getElementById('eth_dom').textContent = ethDom ? ethDom.toFixed(2) + " %" : "...";
    const updated = new Date(global.data.updated_at * 1000).toLocaleString('vi-VN');
    document.getElementById('updated').textContent = "Cập nhật: " + updated;

    // 2. Sector: tìm DeFi, AI & Big Data, Meme trong mảng categories
    function getCat(nameArr) {
      for (let c of categories) {
        if (nameArr.some(n => c.name.toLowerCase().includes(n))) {
          return c.market_cap;
        }
      }
      return null;
    }
    // DeFi
    let defiCap = getCat(['defi']);
    // AI & Big Data
    let aiCap = getCat(['ai', 'big data']);
    // Meme
    let memeCap = getCat(['meme']);

    document.getElementById('defi').textContent = defiCap ? formatMoney(defiCap) : "N/A";
    document.getElementById('ai').textContent = aiCap ? formatMoney(aiCap) : "N/A";
    document.getElementById('meme').textContent = memeCap ? formatMoney(memeCap) : "N/A";

  } catch (e) {
    document.getElementById('btc').textContent = "Error!";
    document.getElementById('eth').textContent = "Error!";
    document.getElementById('total').textContent = "Error!";
    document.getElementById('alt').textContent = "Error!";
    document.getElementById('btc_dom').textContent = "Error!";
    document.getElementById('eth_dom').textContent = "Error!";
    document.getElementById('defi').textContent = "Error!";
    document.getElementById('ai').textContent = "Error!";
    document.getElementById('meme').textContent = "Error!";
    document.getElementById('updated').textContent = "Không tải được dữ liệu!";
  }
  if (force) blinkUpdate();
}

function blinkUpdate() {
  const updatedDiv = document.getElementById('updated');
  updatedDiv.style.color = '#f7931a';
  setTimeout(()=>{ updatedDiv.style.color='#888'; }, 600);
}

// Auto refresh control
function setAutoRefresh() {
  const val = parseInt(document.getElementById('interval').value);
  if (timer) clearInterval(timer);
  if (val > 0) {
    timer = setInterval(() => fetchMarketCaps(true), val * 1000);
  }
  // Lưu lựa chọn refresh
  localStorage.setItem('cap_interval', val);
}

document.getElementById('interval').addEventListener('change', setAutoRefresh);

window.onload = function() {
  // Khôi phục lựa chọn refresh interval
  const last = localStorage.getItem('cap_interval');
  if (last) {
    document.getElementById('interval').value = last;
  }
  setAutoRefresh();
  fetchMarketCaps();
};

window.fetchMarketCaps = fetchMarketCaps;