// ============================================
// TradeX Dashboard - Main JavaScript
// Professional Stock Trading Dashboard
// ============================================

// Global Variables
let currentPage = 'home';
let stockData = [];
let watchlist = [];
let currentChart = null; // To store Chart.js instance for dynamic updates
const ALPHA_VANTAGE_API_KEY = 'X9VVFFCU4I97EBMG'; // Your API Key

// DOM Elements
const contentArea = document.getElementById('content-area');
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menu-toggle'); // For mobile sidebar toggle
const closeSidebar = document.getElementById('close-sidebar'); // For closing mobile sidebar
const globalSearch = document.getElementById('global-search');
const toast = document.getElementById('toast');
const toastIcon = document.getElementById('toast-icon');
const toastMessage = document.getElementById('toast-message');
const loader = document.getElementById('loader');

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize data
        await initializeData();
        
        // Setup event listeners
        setupEventListeners();
        
        // Load initial page
        navigateTo('home');
        
        // Update time on homepage periodically
        setInterval(updateCurrentTimeDisplay, 60000); 
        
        // Simulate real-time updates for stock data (optional, for demo purposes)
        setInterval(simulateRealTimeUpdates, 15000); 
        
    } catch (error) {
        console.error('Initialization error:', error);
        showToast('Error initializing dashboard. Please refresh.', 'error');
    }
});

// ============================================
// DATA INITIALIZATION & SIMULATION
// ============================================

async function initializeData() {
    showLoader(true);
    try {
        // Generate initial dummy stock data
        stockData = generateDummyStockData();
        
        // Load watchlist from localStorage
        const savedWatchlist = localStorage.getItem('tradex_watchlist');
        if (savedWatchlist) {
            watchlist = JSON.parse(savedWatchlist);
        }
    } catch (error) {
        console.error('Failed to initialize data:', error);
        throw error; // Re-throw to be caught by DOMContentLoaded
    } finally {
        showLoader(false);
    }
}

/**
 * Generates dummy stock data for demonstration purposes.
 */
function generateDummyStockData() {
    const companies = [
        { code: 'BBCA', name: 'Bank Central Asia Tbk.', sector: 'Keuangan', basePrice: 10250 },
        { code: 'UNVR', name: 'Unilever Indonesia Tbk.', sector: 'Consumer', basePrice: 5420 },
        { code: 'TLKM', name: 'Telkom Indonesia Tbk.', sector: 'Telekomunikasi', basePrice: 3820 },
        { code: 'ASII', name: 'Astra International Tbk.', sector: 'Otomotif', basePrice: 5250 },
        { code: 'BMRI', name: 'Bank Mandiri (Persero) Tbk.', sector: 'Keuangan', basePrice: 4980 },
        { code: 'BBNI', name: 'Bank Negara Indonesia (Persero) Tbk.', sector: 'Keuangan', basePrice: 8750 },
        { code: 'GOTO', name: 'GoTo Gojek Tokopedia Tbk.', sector: 'Teknologi', basePrice: 125 },
        { code: 'CPIN', name: 'Charoen Pokphand Indonesia Tbk.', sector: 'Consumer', basePrice: 4780 },
        { code: 'HMSP', name: 'HM Sampoerna Tbk.', sector: 'Consumer', basePrice: 2180 },
        { code: 'ICBP', name: 'Indofood CBP Sukses Makmur Tbk.', sector: 'Consumer', basePrice: 8450 },
        { code: 'KLBF', name: 'Kalbe Farma Tbk.', sector: 'Kesehatan', basePrice: 1560 },
        { code: 'UNTR', name: 'United Tractors Tbk.', sector: 'Tambang', basePrice: 26350 },
        { code: 'PGAS', name: 'Perusahaan Gas Negara Tbk.', sector: 'Energi', basePrice: 1650 },
        { code: 'JSMR', name: 'Jasa Marga (Persero) Tbk.', sector: 'Infrastruktur', basePrice: 4180 },
        { code: 'SMGR', name: 'Semen Indonesia (Persero) Tbk.', sector: 'Infrastruktur', basePrice: 10250 },
        { code: 'INDF', name: 'Indofood Sukses Makmur Tbk.', sector: 'Consumer', basePrice: 6750 },
        { code: 'ADRO', name: 'Adaro Energy Indonesia Tbk.', sector: 'Tambang', basePrice: 2800 },
        { code: 'BRPT', name: 'Barito Pacific Tbk.', sector: 'Industri', basePrice: 1200 },
        { code: 'LINK', name: 'Link Net Tbk.', sector: 'Telekomunikasi', basePrice: 2500 },
        { code: 'MTEL', name: 'Dayamitra Telekomunikasi Tbk.', sector: 'Telekomunikasi', basePrice: 700 }
    ];
    
    return companies.map(company => ({
        code: company.code,
        name: company.name,
        sector: company.sector,
        price: company.basePrice + (Math.random() - 0.5) * company.basePrice * 0.05, // Initial price with small fluctuation
        change: (Math.random() - 0.5) * 8, // Initial change percentage
        volume: Math.floor(Math.random() * 20000000) + 1000000,
    }));
}

/**
 * Simulates real-time updates for stock prices and volume.
 * This is a dummy function; in a real app, it would fetch from a WebSocket or API.
 */
function simulateRealTimeUpdates() {
    stockData = stockData.map(stock => {
        const priceChangeFactor = (Math.random() - 0.5) * 0.02; // +/- 2% max
        const newPrice = stock.price * (1 + priceChangeFactor);
        const newChange = (newPrice - stock.price) / stock.price * 100;
        const newVolume = stock.volume + Math.floor((Math.random() - 0.5) * 500000);

        return {
            ...stock,
            price: Math.max(1, parseFloat(newPrice.toFixed(2))), // Ensure price >= 1
            change: parseFloat(newChange.toFixed(2)),
            volume: Math.max(0, newVolume) // Ensure volume >= 0
        };
    });

    // If on Market or Watchlist page, re-render to show updates
    if (currentPage === 'market') {
        renderMarketPage(true); // true to indicate it's an update, not initial load
    } else if (currentPage === 'watchlist') {
        renderWatchlistPage(true);
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Mobile sidebar toggle
    menuToggle.addEventListener('click', () => {
        sidebar.classList.remove('-translate-x-full');
    });
    
    closeSidebar.addEventListener('click', () => {
        sidebar.classList.add('-translate-x-full');
    });
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth < 768) {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target) && !sidebar.classList.contains('-translate-x-full')) {
                sidebar.classList.add('-translate-x-full');
            }
        }
    });
    
    // Sidebar navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(e.currentTarget.dataset.page);
        });
    });
    
    // Global search (can be expanded to filter results across pages)
    globalSearch.addEventListener('input', debounce(handleGlobalSearch, 300));
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            globalSearch.focus();
        }
        // Escape to clear search and blur
        if (e.key === 'Escape' && document.activeElement === globalSearch) {
            globalSearch.value = '';
            globalSearch.blur();
            // Optional: navigate back to current page if search was active
            // navigateTo(currentPage); 
        }
    });
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.page) {
            navigateTo(e.state.page);
        } else {
            // If no state, default to home page
            navigateTo('home');
        }
    });
    
    // Adjust sidebar visibility on resize
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) {
            sidebar.classList.remove('-translate-x-full'); // Ensure sidebar is visible on desktop
        } else {
            sidebar.classList.add('-translate-x-full'); // Ensure sidebar is hidden on mobile by default
        }
    });
}

/**
 * Handles global search input. Currently just logs, but can be extended.
 */
function handleGlobalSearch() {
    const query = globalSearch.value.trim().toLowerCase();
    if (query.length > 2) {
        // Example: filter stock data and show results, or suggest relevant pages
        console.log('Global search query:', query);
        // For a full implementation, you'd likely render a search results page
    }
}

// ============================================
// NAVIGATION & PAGE LOADING
// ============================================

/**
 * Navigates to a specified page and updates UI.
 * @param {string} pageName - The identifier for the page to navigate to.
 * @param {any} [data=null] - Optional data to pass to the page renderer (e.g., stock code).
 * @param {boolean} [pushState=true] - Whether to push the state to browser history.
 */
function navigateTo(pageName, data = null, pushState = true) {
    currentPage = pageName;
    
    // Update active state for sidebar links
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === pageName) {
            item.classList.add('active');
        }
    });
    
    // Hide mobile sidebar
    if (window.innerWidth < 768) {
        sidebar.classList.add('-translate-x-full');
    }
    
    // Render page content
    switch (pageName) {
        case 'home': renderHomePage(); break;
        case 'market': renderMarketPage(); break;
        case 'watchlist': renderWatchlistPage(); break;
        case 'education': renderEducationPage(); break;
        case 'news': renderNewsPage(); break;
        case 'about': renderAboutPage(); break;
        case 'chart': renderStockChartPage(data); break; // 'data' is expected to be stock code
        default: renderHomePage(); break;
    }
    
    // Update browser history
    if (pushState) {
        window.history.pushState({ page: pageName, data: data }, '', `#${pageName}${data ? `/${data}` : ''}`);
    }
}

// ============================================
// PAGE RENDERERS
// ============================================

/**
 * Renders the Home page.
 */
function renderHomePage() {
    const totalMarketCap = stockData.reduce((sum, stock) => sum + (stock.price * stock.volume * 100), 0); // Simplified market cap calculation
    const marketIndex = 7245.50 + (Math.random() - 0.5) * 50; // Simulate JCI movement
    const topGainer = [...stockData].sort((a, b) => b.change - a.change)[0];
    const topLoser = [...stockData].sort((a, b) => a.change - b.change)[0];

    contentArea.innerHTML = `
        <div class="fade-in space-y-6">
            <!-- Header -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h1 class="text-3xl font-bold mb-2">Stock Market Dashboard</h1>
                    <p class="text-gray-400">Professional Trading Platform • <span id="current-time">${getCurrentTimeFormatted()}</span></p>
                </div>
                <div class="mt-4 md:mt-0 flex items-center space-x-4">
                    <div class="text-right">
                        <p class="text-sm text-gray-400">Market Status</p>
                        <p class="text-lg font-semibold text-green-400 pulse">Open</p>
                    </div>
                    <div class="w-16 h-16 rounded-full border-4 border-green-500/30 flex items-center justify-center">
                        <span class="text-2xl font-bold text-green-400">${stockData.length}</span>
                    </div>
                </div>
            </div>
            
            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                ${createStatCard('Total Market Cap', formatCurrency(totalMarketCap), 'text-green-400', '+2.4%', 'fa-chart-pie')}
                ${createStatCard('Market Index', `JCI ${marketIndex.toFixed(2)}`, 'text-blue-400', '+1.2%', 'fa-chart-line')}
                ${createStatCard('Top Gainer', `${topGainer.code} ${formatPercentage(topGainer.change)}`, 'text-green-400', 'Today', 'fa-fire')}
                ${createStatCard('Top Loser', `${topLoser.code} ${formatPercentage(topLoser.change)}`, 'text-red-400', 'Today', 'fa-fire-extinguisher')}
            </div>
            
            <!-- Main Chart Section (JCI Overview) -->
            <div class="card p-6">
                <div class="flex flex-col lg:flex-row justify-between items-center mb-6">
                    <h2 class="text-xl font-bold mb-4 lg:mb-0">JCI Overview</h2>
                    <div class="flex space-x-2">
                        <button class="timeframe-btn btn btn-secondary active" data-timeframe="1D">1D</button>
                        <button class="timeframe-btn btn btn-secondary" data-timeframe="1W">1W</button>
                        <button class="timeframe-btn btn btn-secondary" data-timeframe="1M">1M</button>
                        <button class="timeframe-btn btn btn-secondary" data-timeframe="1Y">1Y</button>
                    </div>
                </div>
                <div class="chart-container">
                    <canvas id="marketOverviewChart"></canvas>
                </div>
            </div>
            
            <!-- Market Summary -->
            <div class="card p-6">
                <h3 class="text-lg font-bold mb-4">Market Summary</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="p-4 bg-dark-bg rounded-lg">
                        <p class="text-sm text-gray-400 mb-1">Advancers</p>
                        <p class="text-2xl font-bold text-green-400">${Math.floor(stockData.length * 0.55)}</p>
                    </div>
                    <div class="p-4 bg-dark-bg rounded-lg">
                        <p class="text-sm text-gray-400 mb-1">Decliners</p>
                        <p class="text-2xl font-bold text-red-400">${Math.floor(stockData.length * 0.35)}</p>
                    </div>
                    <div class="p-4 bg-dark-bg rounded-lg">
                        <p class="text-sm text-gray-400 mb-1">Unchanged</p>
                        <p class="text-2xl font-bold text-gray-400">${Math.floor(stockData.length * 0.1)}</p>
                    </div>
                    <div class="p-4 bg-dark-bg rounded-lg">
                        <p class="text-sm text-gray-400 mb-1">Total Volume</p>
                        <p class="text-2xl font-bold text-blue-400">${formatCompactNumber(stockData.reduce((sum, s) => sum + s.volume, 0))}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Initialize JCI chart after content is in DOM
    setTimeout(() => {
        setupMarketOverviewChart();
    }, 100);
}

/**
 * Renders the Market page.
 * @param {boolean} isUpdate - If true, only update table, not the whole page structure.
 */
function renderMarketPage(isUpdate = false) {
    if (!isUpdate) {
        contentArea.innerHTML = `
            <div class="fade-in space-y-6">
                <!-- Header -->
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 class="text-3xl font-bold mb-2">Market Overview</h1>
                        <p class="text-gray-400">Browse all listed stocks</p>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div class="relative flex-1 md:w-64">
                            <input type="text" id="stock-search" placeholder="Search by code or name..." 
                                class="w-full bg-dark-bg border border-dark-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/50">
                            <i class="fas fa-search absolute left-3 top-2.5 text-gray-500"></i>
                        </div>
                        <select id="sort-select" class="bg-dark-bg border border-dark-border rounded-lg py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/50">
                            <option value="default">Sort by</option>
                            <option value="code-asc">Code (A-Z)</option>
                            <option value="price-desc">Price (High-Low)</option>
                            <option value="price-asc">Price (Low-High)</option>
                            <option value="change-desc">Change (High-Low)</option>
                            <option value="change-asc">Change (Low-High)</option>
                            <option value="volume-desc">Volume (High-Low)</option>
                            <option value="volume-asc">Volume (Low-High)</option>
                        </select>
                    </div>
                </div>
                
                <!-- Stock Table -->
                <div class="card overflow-hidden p-0">
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th data-sort="code">Code <i class="fas fa-sort text-xs ml-1"></i></th>
                                    <th>Name</th>
                                    <th data-sort="price">Price <i class="fas fa-sort text-xs ml-1"></i></th>
                                    <th data-sort="change">% Change <i class="fas fa-sort text-xs ml-1"></i></th>
                                    <th data-sort="volume">Volume <i class="fas fa-sort text-xs ml-1"></i></th>
                                    <th>Sector</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="stock-table-body">
                                <!-- Stock rows will be inserted here -->
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="text-sm text-gray-400 text-center">
                    Showing <span id="stock-count">0</span> stocks
                </div>
            </div>
        `;
        // Setup event listeners for search and sort after initial render
        document.getElementById('stock-search').addEventListener('input', debounce(populateStockTable, 300));
        document.getElementById('sort-select').addEventListener('change', populateStockTable);
        document.querySelectorAll('#stock-table-body + .table th[data-sort]').forEach(th => {
            th.addEventListener('click', () => {
                const currentSort = document.getElementById('sort-select').value;
                const column = th.dataset.sort;
                let direction = 'asc';
                if (currentSort.includes(column)) {
                    direction = currentSort.endsWith('asc') ? 'desc' : 'asc';
                }
                document.getElementById('sort-select').value = `${column}-${direction}`;
                populateStockTable();
            });
        });
    }
    populateStockTable();
}

/**
 * Populates the stock table on the Market page.
 */
function populateStockTable() {
    const stockSearchInput = document.getElementById('stock-search');
    const sortSelect = document.getElementById('sort-select');
    const stockTableBody = document.getElementById('stock-table-body');
    const stockCountSpan = document.getElementById('stock-count');

    let filteredStocks = stockData.filter(stock =>
        stock.code.toLowerCase().includes(stockSearchInput.value.toLowerCase()) ||
        stock.name.toLowerCase().includes(stockSearchInput.value.toLowerCase())
    );

    // Apply sorting
    const sortOption = sortSelect.value;
    if (sortOption !== 'default') {
        const [column, direction] = sortOption.split('-');
        filteredStocks.sort((a, b) => {
            let valA = a[column];
            let valB = b[column];

            // Handle string vs number comparison
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();

            if (valA < valB) return direction === 'asc' ? -1 : 1;
            if (valA > valB) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    stockTableBody.innerHTML = '';
    if (filteredStocks.length === 0) {
        stockTableBody.innerHTML = `<tr><td colspan="7" class="px-6 py-4 text-center text-gray-500">No stocks found.</td></tr>`;
    } else {
        filteredStocks.forEach(stock => {
            const changeColorClass = stock.change >= 0 ? 'text-green' : 'text-red';
            const row = document.createElement('tr');
            row.className = 'hover:bg-dark-bg transition-colors cursor-pointer';
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">${stock.code}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">${stock.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-text-primary text-right">${formatCurrency(stock.price)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm ${changeColorClass} text-right">${formatPercentage(stock.change)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary text-right">${stock.volume.toLocaleString('id-ID')}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">${stock.sector}</td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm">
                    <button class="btn btn-primary btn-sm" onclick="navigateTo('chart', '${stock.code}')">View Chart</button>
                </td>
            `;
            stockTableBody.appendChild(row);
        });
    }
    stockCountSpan.textContent = filteredStocks.length;
}

/**
 * Renders the Watchlist page.
 * @param {boolean} isUpdate - If true, only update table, not the whole page structure.
 */
function renderWatchlistPage(isUpdate = false) {
    if (!isUpdate) {
        contentArea.innerHTML = `
            <div class="fade-in space-y-6">
                <!-- Header -->
                <div>
                    <h1 class="text-3xl font-bold mb-2">My Watchlist</h1>
                    <p class="text-gray-400">Monitor your favorite stocks and portfolio performance</p>
                </div>
                
                <!-- Add Stock Form -->
                <div class="card watchlist-form p-6">
                    <h3 class="text-lg font-bold mb-4">Add New Stock</h3>
                    <form id="watchlist-form" class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div class="form-group">
                            <label class="form-label">Stock Code</label>
                            <input type="text" id="watchlist-code" class="form-control" placeholder="e.g. BBCA" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Buy Price (Rp)</label>
                            <input type="number" id="watchlist-price" class="form-control" placeholder="0" required min="0" step="1">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Quantity (Unit)</label>
                            <input type="number" id="watchlist-qty" class="form-control" value="1" min="1" required>
                        </div>
                        <div class="flex items-end">
                            <button type="submit" class="btn btn-primary w-full">
                                <i class="fas fa-plus"></i> Add to Watchlist
                            </button>
                        </div>
                    </form>
                </div>
                
                <!-- Watchlist Table -->
                <div class="card overflow-hidden p-0">
                    <h2 class="text-xl font-bold p-6 pb-2">Your Stocks</h2>
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Name</th>
                                    <th>Buy Price</th>
                                    <th>Current Price</th>
                                    <th>Profit/Loss (Rp)</th>
                                    <th>Profit/Loss (%)</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="watchlist-table-body">
                                <!-- Watchlist rows will be inserted here -->
                            </tbody>
                        </table>
                    </div>
                    <div id="empty-watchlist-message" class="text-center py-12 text-gray-500 hidden">
                        <i class="fas fa-box-open text-5xl mb-4"></i>
                        <p class="text-xl font-semibold mb-2">Your watchlist is empty!</p>
                        <p>Add stocks using the form above to monitor your investments.</p>
                    </div>
                </div>
            </div>
        `;
        // Setup form submission
        document.getElementById('watchlist-form').addEventListener('submit', handleAddWatchlist);
    }
    // Always render table to show latest data
    renderWatchlistTable();
}

/**
 * Handles adding a stock to the watchlist.
 */
function handleAddWatchlist(e) {
    e.preventDefault();
    const codeInput = document.getElementById('watchlist-code');
    const priceInput = document.getElementById('watchlist-price');
    const qtyInput = document.getElementById('watchlist-qty');

    const code = codeInput.value.toUpperCase().trim();
    const buyPrice = parseFloat(priceInput.value);
    const quantity = parseInt(qtyInput.value);

    if (!code || isNaN(buyPrice) || isNaN(quantity) || buyPrice <= 0 || quantity <= 0) {
        showToast('Please fill in all fields correctly.', 'error');
        return;
    }

    const existingStock = stockData.find(s => s.code === code);
    if (!existingStock) {
        showToast(`Stock code "${code}" not found in market data.`, 'error');
        return;
    }

    if (watchlist.some(item => item.code === code)) {
        showToast(`Stock "${code}" is already in your watchlist.`, 'info');
        return;
    }

    watchlist.push({ code, buyPrice, quantity });
    localStorage.setItem('tradex_watchlist', JSON.stringify(watchlist));
    showToast(`Stock "${code}" added to watchlist.`, 'success');

    // Clear form
    codeInput.value = '';
    priceInput.value = '';
    qtyInput.value = '1';

    renderWatchlistTable();
}

/**
 * Renders the watchlist table.
 */
function renderWatchlistTable() {
    const watchlistTableBody = document.getElementById('watchlist-table-body');
    const emptyMessage = document.getElementById('empty-watchlist-message');

    watchlistTableBody.innerHTML = ''; // Clear existing rows

    if (watchlist.length === 0) {
        emptyMessage.classList.remove('hidden');
        return;
    }
    emptyMessage.classList.add('hidden');

    watchlist.forEach((item, index) => {
        const marketStock = stockData.find(s => s.code === item.code);
        const currentPrice = marketStock ? marketStock.price : item.buyPrice; // Use buy price if market data not found
        const profitLossPerUnit = currentPrice - item.buyPrice;
        const totalProfitLoss = profitLossPerUnit * item.quantity;
        const profitLossPercentage = (profitLossPerUnit / item.buyPrice) * 100;

        const changeColorClass = totalProfitLoss >= 0 ? 'text-green' : 'text-red';

        const row = document.createElement('tr');
        row.className = 'hover:bg-dark-bg transition-colors';
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">${item.code}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">${formatCurrency(item.buyPrice)} (${item.quantity} unit)</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-text-primary">${formatCurrency(currentPrice)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm ${changeColorClass}">${formatCurrency(totalProfitLoss)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm ${changeColorClass}">${formatPercentage(profitLossPercentage)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm">
                <button class="btn btn-danger btn-sm" onclick="removeFromWatchlist(${index})">Remove</button>
            </td>
        `;
        watchlistTableBody.appendChild(row);
    });
}

/**
 * Removes a stock from the watchlist by its index.
 * @param {number} index - The index of the stock in the watchlist array.
 */
function removeFromWatchlist(index) {
    const removedStockCode = watchlist[index].code;
    watchlist.splice(index, 1);
    localStorage.setItem('tradex_watchlist', JSON.stringify(watchlist));
    showToast(`Stock "${removedStockCode}" removed from watchlist.`, 'info');
    renderWatchlistTable(); // Re-render the table
}

/**
 * Renders the Education page.
 */
function renderEducationPage() {
    const educationContent = [
        {
            icon: 'fa-book-open',
            color: 'from-blue-500 to-blue-600',
            title: 'Pengertian Saham',
            desc: 'Memahami apa itu saham, fungsi pasar modal, dan peran investor di pasar saham.',
            link: '#'
        },
        {
            icon: 'fa-hand-holding-usd',
            color: 'from-green-500 to-green-600',
            title: 'Cara Membeli Saham',
            desc: 'Panduan lengkap dari registrasi broker hingga eksekusi order beli saham.',
            link: '#'
        },
        {
            icon: 'fa-exclamation-triangle',
            color: 'from-yellow-500 to-yellow-600',
            title: 'Risiko Investasi',
            desc: 'Mengenal risiko pasar saham dan strategi mengelola risiko untuk menjaga modal.',
            link: '#'
        },
        {
            icon: 'fa-language',
            color: 'from-purple-500 to-purple-600',
            title: 'Istilah Penting',
            desc: 'Kamus istilah saham: IPO, LQ45, Harga Pembukaan, Volume, dll.',
            link: '#'
        },
        {
            icon: 'fa-chart-line',
            color: 'from-red-500 to-red-600',
            title: 'Analisis Teknikal',
            desc: 'Belajar membaca grafik, pola, indikator teknikal untuk keputusan entry/exit.',
            link: '#'
        },
        {
            icon: 'fa-file-invoice-dollar',
            color: 'from-indigo-500 to-indigo-600',
            title: 'Analisis Fundamental',
            desc: 'Evaluasi kinerja perusahaan melalui laporan keuangan: EPS, PBV, DER, dll.',
            link: '#'
        }
    ];
    
    contentArea.innerHTML = `
        <div class="fade-in space-y-6">
            <div>
                <h1 class="text-3xl font-bold mb-2">Pusat Edukasi</h1>
                <p class="text-gray-400">Tingkatkan pengetahuan investasi Anda dengan materi-materi berikut</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${educationContent.map(item => `
                    <div class="edu-card card p-0 overflow-hidden">
                        <div class="h-40 bg-gradient-to-br ${item.color} flex items-center justify-center">
                            <i class="fas ${item.icon} text-5xl text-white opacity-90"></i>
                        </div>
                        <div class="p-6 flex-1 flex flex-col">
                            <h3 class="text-xl font-bold mb-2">${item.title}</h3>
                            <p class="text-gray-400 text-sm mb-4 flex-1">${item.desc}</p>
                            <a href="${item.link}" class="btn btn-secondary w-full text-center">
                                Baca Selengkapnya <i class="fas fa-arrow-right ml-2"></i>
                            </a>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

/**
 * Renders the News page.
 */
function renderNewsPage() {
    // newsData is defined globally at the top of the script
    contentArea.innerHTML = `
        <div class="fade-in space-y-6">
            <div>
                <h1 class="text-3xl font-bold mb-2">Berita Saham Terbaru</h1>
                <p class="text-gray-400">Update berita pasar modal dan ekonomi terkini</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${newsData.map(news => `
                    <article class="news-card card p-0">
                        <img src="${news.image}" alt="${news.title}" class="w-full h-48 object-cover">
                        <div class="card-body p-6">
                            <div class="flex items-center space-x-2 mb-3">
                                <span class="badge badge-blue">${news.category}</span>
                                <span class="text-xs text-gray-500">${news.date}</span>
                            </div>
                            <h3 class="text-lg font-bold mb-2 line-clamp-2">${news.title}</h3>
                            <p class="text-gray-400 text-sm mb-4 line-clamp-3">${news.description}</p>
                            <button class="btn btn-secondary text-sm read-more" onclick="showToast('Artikel akan segera tersedia', 'info')">
                                Baca Selengkapnya <i class="fas fa-arrow-right ml-2"></i>
                            </button>
                        </div>
                    </article>
                `).join('')}
            </div>
        </div>
    `;
}

/**
 * Renders the About page.
 */
function renderAboutPage() {
    contentArea.innerHTML = `
        <div class="fade-in max-w-4xl mx-auto">
            <div class="text-center mb-12">
                <div class="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <i class="fas fa-chart-line text-4xl text-white"></i>
                </div>
                <h1 class="text-4xl font-bold mb-4">Tentang TradeX</h1>
                <p class="text-xl text-gray-400">Professional Stock Trading Dashboard for Modern Investors</p>
            </div>
            
            <div class="card p-6 mb-8">
                <h2 class="text-2xl font-bold mb-4">Visi & Misi</h2>
                <p class="text-gray-300 mb-4">
                    TradeX dikembangkan dengan visi untuk memberdayakan investor individu dengan alat analisis dan informasi pasar yang setara dengan profesional. Misi kami adalah menyediakan platform yang intuitif, informatif, dan mudah diakses untuk membantu Anda membuat keputusan investasi yang cerdas.
                </p>
                <p class="text-gray-300">
                    Kami percaya bahwa setiap orang berhak memiliki akses ke informasi pasar yang berkualitas tinggi dan alat yang canggih untuk mengelola investasi mereka.
                </p>
            </div>

            <div class="card p-6 mb-8">
                <h2 class="text-2xl font-bold mb-4">Fitur Utama</h2>
                <ul class="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li><i class="fas fa-check-circle text-green-500 mr-2"></i>Dashboard Interaktif & Responsif</li>
                    <li><i class="fas fa-check-circle text-green-500 mr-2"></i>Daftar Saham Pasar dengan Filter & Sorting</li>
                    <li><i class="fas fa-check-circle text-green-500 mr-2"></i>Watchlist Saham Personal dengan Profit/Loss Tracker</li>
                    <li><i class="fas fa-check-circle text-green-500 mr-2"></i>Grafik Saham Interaktif (Chart.js)</li>
                    <li><i class="fas fa-check-circle text-green-500 mr-2"></i>Pusat Edukasi untuk Investor Pemula</li>
                    <li><i class="fas fa-check-circle text-green-500 mr-2"></i>Update Berita Saham Terbaru</li>
                </ul>
            </div>

            <div class="card p-6 mb-8">
                <h2 class="text-2xl font-bold mb-4">Teknologi yang Digunakan</h2>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div class="bg-dark-bg p-4 rounded-lg flex flex-col items-center">
                        <i class="fab fa-html5 text-4xl text-orange-500 mb-2"></i>
                        <span class="text-sm font-medium">HTML5</span>
                    </div>
                    <div class="bg-dark-bg p-4 rounded-lg flex flex-col items-center">
                        <i class="fab fa-css3-alt text-4xl text-blue-500 mb-2"></i>
                        <span class="text-sm font-medium">Tailwind CSS</span>
                    </div>
                    <div class="bg-dark-bg p-4 rounded-lg flex flex-col items-center">
                        <i class="fab fa-js text-4xl text-yellow-500 mb-2"></i>
                        <span class="text-sm font-medium">JavaScript</span>
                    </div>
                    <div class="bg-dark-bg p-4 rounded-lg flex flex-col items-center">
                        <i class="fas fa-chart-area text-4xl text-red-500 mb-2"></i>
                        <span class="text-sm font-medium">Chart.js</span>
                    </div>
                </div>
            </div>

            <div class="text-center text-gray-500 text-sm mt-8">
                <p>&copy; 2024 TradeX by Rayxer. All rights reserved.</p>
                <p>API Key Alpha Vantage (dummy): <code class="text-blue-400">${ALPHA_VANTAGE_API_KEY}</code></p>
            </div>
        </div>
    `;
}

/**
 * Renders the Stock Chart page for a specific stock.
 * @param {string} stockCode - The code of the stock to display.
 */
function renderStockChartPage(stockCode) {
    const stock = stockData.find(s => s.code === stockCode);

    if (!stock) {
        contentArea.innerHTML = `<div class="fade-in card p-6 text-center"><p class="text-red-500 text-xl">Stock with code "${stockCode}" not found.</p></div>`;
        return;
    }

    contentArea.innerHTML = `
        <div class="fade-in space-y-6">
            <div>
                <h1 class="text-3xl font-bold mb-2">Stock Chart: ${stock.name} (${stock.code})</h1>
                <p class="text-gray-400">Analyze historical price movements</p>
            </div>
            
            <div class="card p-6">
                <div class="flex flex-wrap gap-3 mb-4">
                    <button class="chart-timeframe-btn btn btn-secondary active" data-timeframe="1D">1D</button>
                    <button class="chart-timeframe-btn btn btn-secondary" data-timeframe="1W">1W</button>
                    <button class="chart-timeframe-btn btn btn-secondary" data-timeframe="1M">1M</button>
                    <button class="chart-timeframe-btn btn btn-secondary" data-timeframe="1Y">1Y</button>
                </div>
                <div class="h-96">
                    <canvas id="individualStockChart"></canvas>
                </div>
                <p class="text-gray-500 text-sm mt-4">
                    *Chart data is simulated. For real-time data, integrate with an API like Alpha Vantage using API Key: <code class="text-blue-400">${ALPHA_VANTAGE_API_KEY}</code>
                </p>
            </div>
        </div>
    `;

    // Initialize chart after content is in DOM
    setTimeout(() => {
        setupIndividualStockChart(stock.price);
    }, 100);
}

// ============================================
// CHART FUNCTIONS (Chart.js)
// ============================================

/**
 * Sets up the main market overview chart (JCI) on the Home page.
 */
function setupMarketOverviewChart() {
    const ctx = document.getElementById('marketOverviewChart').getContext('2d');
    const { labels, data } = generateChartDataForOverview('1D', 7245.50); // Initial 1D data for JCI

    if (currentChart) {
        currentChart.destroy();
    }

    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'JCI Index',
                data: data,
                borderColor: 'rgb(59, 130, 246)', // Tailwind blue-500
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                x: { grid: { color: '#2a3344' }, ticks: { color: '#94a3b8' } },
                y: { grid: { color: '#2a3344' }, ticks: { color: '#94a3b8' } }
            }
        }
    });

    // Event listeners for timeframe buttons
    document.querySelectorAll('.timeframe-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.timeframe-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const newTimeframe = btn.dataset.timeframe;
            const { labels: newLabels, data: newData } = generateChartDataForOverview(newTimeframe, 7245.50);
            currentChart.data.labels = newLabels;
            currentChart.data.datasets[0].data = newData;
            currentChart.update();
        };
    });
}

/**
 * Generates dummy chart data for the market overview (JCI).
 */
function generateChartDataForOverview(timeframe, baseValue) {
    let labels = [];
    let data = [];
    let fluctuations = 0;

    switch (timeframe) {
        case '1D':
            labels = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
            fluctuations = 30; // Max 30 points fluctuation
            break;
        case '1W':
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
            fluctuations = 50;
            break;
        case '1M':
            labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
            fluctuations = 100;
            break;
        case '1Y':
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            fluctuations = 300;
            break;
    }

    let currentValue = baseValue;
    data = labels.map(() => {
        currentValue += (Math.random() - 0.5) * fluctuations / labels.length;
        return parseFloat(currentValue.toFixed(2));
    });

    return { labels, data };
}

/**
 * Sets up the individual stock chart on the Stock Chart page.
 * @param {number} basePrice - The current price of the stock.
 */
function setupIndividualStockChart(basePrice) {
    const ctx = document.getElementById('individualStockChart').getContext('2d');
    let individualChartInstance = null;

    const generateIndividualChartData = (timeframe) => {
        let labels = [];
        let data = [];
        let fluctuations = 0;

        switch (timeframe) {
            case '1D':
                labels = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
                fluctuations = basePrice * 0.008; // 0.8% fluctuation
                break;
            case '1W':
                labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
                fluctuations = basePrice * 0.015; // 1.5% fluctuation
                break;
            case '1M':
                labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
                fluctuations = basePrice * 0.03; // 3% fluctuation
                break;
            case '1Y':
                labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                fluctuations = basePrice * 0.07; // 7% fluctuation
                break;
        }

        let currentValue = basePrice;
        data = labels.map(() => {
            currentValue += (Math.random() - 0.5) * fluctuations / labels.length;
            return parseFloat(currentValue.toFixed(2));
        });

        return { labels, data };
    };

    const updateChart = (timeframe) => {
        const { labels, data } = generateIndividualChartData(basePrice, timeframe);

        if (individualChartInstance) {
            individualChartInstance.destroy();
        }

        individualChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Price',
                    data: data,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    x: { grid: { color: '#2a3344' }, ticks: { color: '#94a3b8' } },
                    y: { grid: { color: '#2a3344' }, ticks: { color: '#94a3b8' } }
                }
            }
        });

        document.querySelectorAll('.chart-timeframe-btn').forEach(btn => {
            if (btn.dataset.timeframe === timeframe) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    };

    document.querySelectorAll('.chart-timeframe-btn').forEach(btn => {
        btn.addEventListener('click', () => updateChart(btn.dataset.timeframe));
    });

    updateChart('1D'); // Initial chart load for 1D
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Creates an HTML string for a statistic card.
 * @param {string} title - The title of the statistic.
 * @param {string} value - The main value of the statistic.
 * @param {string} valueColorClass - Tailwind class for the value color.
 * @param {string} [change] - Optional change percentage/text.
 * @param {string} [iconClass] - Font Awesome icon class.
 * @returns {string} - HTML string for the card.
 */
function createStatCard(title, value, valueColorClass, change = '', iconClass = '') {
    return `
        <div class="card stat-card p-4 relative">
            <div class="flex items-center justify-between mb-2">
                <span class="text-gray-400 text-sm">${title}</span>
                ${iconClass ? `<i class="fas ${iconClass} text-blue-500"></i>` : ''}
            </div>
            <h3 class="text-2xl font-bold ${valueColorClass}">${value}</h3>
            ${change ? `<p class="text-green-500 text-sm mt-1">${change.startsWith('-') ? '<i class="fas fa-arrow-down"></i>' : '<i class="fas fa-arrow-up"></i>'} ${change}</p>` : ''}
        </div>
    `;
}

/**
 * Formats a raw number into a compact string (e.g., 1.2M, 500K).
 * @param {number} num - The number to format.
 * @returns {string} - Formatted string.
 */
function formatCompactNumber(num) {
    if (num < 1000) {
        return num.toString();
    } else if (num < 1000000) {
        return (num / 1000).toFixed(1) + 'K';
    } else if (num < 1000000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else {
        return (num / 1000000000).toFixed(1) + 'B';
    }
}

/**
 * Updates the current time display on the Home page.
 */
function updateCurrentTimeDisplay() {
    const timeSpan = document.getElementById('current-time');
    if (timeSpan) {
        timeSpan.textContent = getCurrentTimeFormatted();
    }
}

/**
 * Returns the current time formatted.
 */
function getCurrentTimeFormatted() {
    return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Displays or hides the global loader.
 * @param {boolean} show - True to show, false to hide.
 */
function showLoader(show) {
    if (loader) {
        loader.classList.toggle('hidden', !show);
    }
}

/**
 * Debounce function to limit function calls.
 * @param {Function} func - The function to debounce.
 * @param {number} delay - The debounce delay in milliseconds.
 * @returns {Function} - The debounced function.
 */
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

/**
 * Displays a toast notification.
 * @param {string} message - The message to display.
 * @param {'success'|'error'|'info'} type - Type of toast.
 */
function showToast(message, type = 'info') {
    if (!toast || !toastIcon || !toastMessage) return; // Ensure elements exist

    toastMessage.textContent = message;
    toast.className = 'fixed bottom-6 right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-300'; // Reset classes

    switch (type) {
        case 'success':
            toast.classList.add('bg-green-600');
            toastIcon.className = 'fas fa-check-circle mr-2';
            break;
        case 'error':
            toast.classList.add('bg-red-600');
            toastIcon.className = 'fas fa-times-circle mr-2';
            break;
        case 'info':
        default:
            toast.classList.add('bg-blue-600');
            toastIcon.className = 'fas fa-info-circle mr-2';
            break;
    }

    // Show toast
    setTimeout(() => {
        toast.classList.add('translate-y-0', 'opacity-100');
    }, 100);

    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        setTimeout(() => {
            // Clean up type-specific classes after animation
            toast.classList.remove('bg-green-600', 'bg-red-600', 'bg-blue-600');
            toastIcon.className = 'fas';
        }, 300); 
    }, 3000);
}

// Make functions globally accessible if needed by inline HTML (e.g., onclick)
window.navigateTo = navigateTo;
window.removeFromWatchlist = removeFromWatchlist; // Used in watchlist table
window.showToast = showToast; // Global access for testing or other pages