// SQL Playground - Main Logic
// Author: Claudio Riquelme - DBA Senior

let db = null;
let currentResults = null;

// Query Examples by Category
const queryExamples = {
    basic: [
        "SELECT * FROM employees LIMIT 10;",
        "SELECT name, salary\nFROM employees\nWHERE salary > 60000\nORDER BY salary DESC;",
        "SELECT COUNT(*) as total_employees\nFROM employees\nWHERE status = 'active';"
    ],
    joins: [
        "SELECT e.name, d.name as department\nFROM employees e\nINNER JOIN departments d ON e.department_id = d.id\nLIMIT 15;",
        "SELECT p.name as product, s.name as supplier, s.country\nFROM products p\nLEFT JOIN suppliers s ON p.supplier_id = s.id\nWHERE p.category = 'Electronics'\nLIMIT 15;",
        "SELECT e.name as employee, d.name as department, COUNT(s.id) as total_sales\nFROM employees e\nLEFT JOIN departments d ON e.department_id = d.id\nLEFT JOIN sales s ON e.id = s.employee_id\nGROUP BY e.id, e.name, d.name\nORDER BY total_sales DESC\nLIMIT 10;"
    ],
    aggregations: [
        "SELECT d.name as department, AVG(e.salary) as avg_salary\nFROM employees e\nJOIN departments d ON e.department_id = d.id\nGROUP BY d.id, d.name\nORDER BY avg_salary DESC;",
        "SELECT category, SUM(stock) as total_stock, COUNT(*) as products\nFROM products\nGROUP BY category\nORDER BY total_stock DESC;",
        "SELECT DATE(sale_date) as day, SUM(total_amount) as daily_revenue\nFROM sales\nGROUP BY DATE(sale_date)\nORDER BY day DESC\nLIMIT 10;"
    ],
    advanced: [
        "WITH top_sellers AS (\n  SELECT employee_id, SUM(total_amount) as total\n  FROM sales\n  GROUP BY employee_id\n)\nSELECT e.name, e.position, ts.total as total_sales\nFROM employees e\nJOIN top_sellers ts ON e.id = ts.employee_id\nORDER BY ts.total DESC\nLIMIT 10;",
        "SELECT name, salary,\n       (SELECT AVG(salary) FROM employees) as company_avg\nFROM employees\nWHERE salary > (SELECT AVG(salary) FROM employees)\nORDER BY salary DESC\nLIMIT 10;",
        "SELECT p.name, p.stock,\n       COALESCE(s.name, 'No Supplier') as supplier,\n       CASE\n         WHEN p.stock < 30 THEN 'Low Stock'\n         WHEN p.stock < 100 THEN 'Medium Stock'\n         ELSE 'High Stock'\n       END as stock_status\nFROM products p\nLEFT JOIN suppliers s ON p.supplier_id = s.id\nWHERE p.stock < 50\nORDER BY p.stock ASC\nLIMIT 15;"
    ]
};

// Initialize Database
async function initDatabase() {
    try {
        console.log('Initializing SQL.js...');

        // Load SQL.js
        const SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });

        console.log('SQL.js loaded successfully');

        // Create database in memory
        db = new SQL.Database();
        console.log('Database created in memory');

        // Load data
        const response = await fetch('js/database.json');
        const data = await response.json();
        console.log('Database JSON loaded:', data);

        // Create tables
        data.schema.forEach(sql => {
            db.run(sql);
            console.log('Table created:', sql.substring(0, 50) + '...');
        });

        // Insert data
        for (let tableName in data.data) {
            const rows = data.data[tableName];
            const placeholders = '(' + rows[0].map(() => '?').join(',') + ')';
            const insertSQL = `INSERT INTO ${tableName} VALUES ${placeholders}`;

            rows.forEach(row => {
                db.run(insertSQL, row);
            });

            console.log(`Inserted ${rows.length} rows into ${tableName}`);
        }

        console.log('Database initialized successfully!');

        // Hide loading, show playground
        document.getElementById('loadingIndicator').classList.add('hidden');
        document.getElementById('playgroundContainer').classList.remove('hidden');

        // Populate schema panel
        populateSchemaPanel();

        // Populate quick stats
        populateQuickStats();

        // Set up event listeners
        setupEventListeners();

    } catch (error) {
        console.error('Error initializing database:', error);
        document.getElementById('loadingIndicator').innerHTML = `
            <div class="text-center py-12">
                <div class="text-red-500 text-xl mb-4">Error al cargar la base de datos</div>
                <p class="text-gray-600">${error.message}</p>
            </div>
        `;
    }
}

// Populate Schema Panel
function populateSchemaPanel() {
    const schemaPanel = document.getElementById('schemaPanel');

    // Get all tables
    const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");

    if (tables.length === 0) return;

    const tableNames = tables[0].values.map(row => row[0]);

    let html = '';
    tableNames.forEach(tableName => {
        // Get table info
        const tableInfo = db.exec(`PRAGMA table_info(${tableName})`);
        const columns = tableInfo[0].values;

        // Get row count
        const countResult = db.exec(`SELECT COUNT(*) FROM ${tableName}`);
        const rowCount = countResult[0].values[0][0];

        html += `
            <div class="schema-table bg-gray-700/50 rounded-lg p-3 border border-cyan-400/20 hover:border-cyan-400/50 transition-all cursor-pointer" data-table="${tableName}">
                <div class="flex items-center justify-between mb-2">
                    <h4 class="text-cyan-400 font-bold">${tableName}</h4>
                    <span class="text-xs text-gray-400">${rowCount} rows</span>
                </div>
                <div class="text-xs text-gray-300 space-y-1">
                    ${columns.map(col => {
                        const isPK = col[5] === 1;
                        return `<div class="flex items-center gap-1">
                            ${isPK ? '<span class="text-yellow-400">🔑</span>' : '<span class="text-gray-500">▸</span>'}
                            <span class="${isPK ? 'text-yellow-400 font-bold' : ''}">${col[1]}</span>
                            <span class="text-gray-500">${col[2]}</span>
                        </div>`;
                    }).join('')}
                </div>
            </div>
        `;
    });

    schemaPanel.innerHTML = html;

    // Add click listeners to tables
    document.querySelectorAll('.schema-table').forEach(el => {
        el.addEventListener('click', () => {
            const tableName = el.dataset.table;
            const query = `SELECT * FROM ${tableName} LIMIT 20;`;
            document.getElementById('sqlEditor').value = query;
            executeQuery();
        });
    });
}

// Populate Quick Stats
function populateQuickStats() {
    const statsPanel = document.getElementById('quickStats');

    try {
        const stats = [
            {
                label: 'Total Employees',
                query: "SELECT COUNT(*) FROM employees WHERE status='active'",
                icon: '👥'
            },
            {
                label: 'Total Products',
                query: "SELECT COUNT(*) FROM products",
                icon: '📦'
            },
            {
                label: 'Total Sales',
                query: "SELECT COUNT(*) FROM sales",
                icon: '💳'
            },
            {
                label: 'Total Revenue',
                query: "SELECT ROUND(SUM(total_amount), 2) FROM sales",
                icon: '💰',
                prefix: '$'
            },
            {
                label: 'Avg Salary',
                query: "SELECT ROUND(AVG(salary), 0) FROM employees",
                icon: '💵',
                prefix: '$'
            },
            {
                label: 'Departments',
                query: "SELECT COUNT(*) FROM departments",
                icon: '🏢'
            }
        ];

        let html = '';
        stats.forEach(stat => {
            const result = db.exec(stat.query);
            const value = result[0]?.values[0][0] || 0;
            const formattedValue = stat.prefix ? `${stat.prefix}${Number(value).toLocaleString()}` : value.toLocaleString();

            html += `
                <div class="flex items-center justify-between">
                    <span class="text-gray-400">${stat.icon} ${stat.label}:</span>
                    <span class="text-cyan-400 font-bold">${formattedValue}</span>
                </div>
            `;
        });

        statsPanel.innerHTML = html;
    } catch (error) {
        statsPanel.innerHTML = '<p class="text-red-400 text-xs">Error loading stats</p>';
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Execute button
    document.getElementById('btnExecute').addEventListener('click', executeQuery);

    // Clear button
    document.getElementById('btnClear').addEventListener('click', () => {
        document.getElementById('sqlEditor').value = '';
        document.getElementById('sqlEditor').focus();
    });

    // Format button (basic formatting)
    document.getElementById('btnFormat').addEventListener('click', formatQuery);

    // Export CSV button
    document.getElementById('btnExportCSV').addEventListener('click', exportToCSV);

    // Editor line count
    const editor = document.getElementById('sqlEditor');
    editor.addEventListener('input', updateEditorInfo);

    // Example buttons
    document.querySelectorAll('.example-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const category = e.target.dataset.category;
            const index = parseInt(e.target.dataset.index);
            const query = queryExamples[category][index];
            document.getElementById('sqlEditor').value = query;
            executeQuery();
        });
    });

    // Keyboard shortcuts
    editor.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to execute
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            executeQuery();
        }

        // Tab to insert 2 spaces
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = editor.selectionStart;
            const end = editor.selectionEnd;
            editor.value = editor.value.substring(0, start) + '  ' + editor.value.substring(end);
            editor.selectionStart = editor.selectionEnd = start + 2;
        }
    });
}

// Execute Query
function executeQuery() {
    const query = document.getElementById('sqlEditor').value.trim();

    if (!query) {
        showError('Por favor ingresa una query SQL');
        return;
    }

    const resultsPanel = document.getElementById('resultsPanel');
    const errorPanel = document.getElementById('errorPanel');
    const queryInfo = document.getElementById('queryInfo');

    // Hide error panel
    errorPanel.classList.add('hidden');

    try {
        const startTime = performance.now();
        const results = db.exec(query);
        const endTime = performance.now();
        const execTime = (endTime - startTime).toFixed(2);

        // Check if it's a SELECT query
        if (results.length === 0) {
            // Query executed but no results (INSERT, UPDATE, DELETE, etc.)
            resultsPanel.innerHTML = `
                <div class="text-center py-12">
                    <div class="text-green-400 text-4xl mb-4">✓</div>
                    <p class="text-green-400 text-lg font-bold">Query ejecutada exitosamente</p>
                    <p class="text-gray-400 text-sm mt-2">Tiempo: ${execTime}ms</p>
                </div>
            `;
            queryInfo.classList.add('hidden');
            currentResults = null;

            // Refresh stats if data was modified
            populateQuickStats();
            return;
        }

        currentResults = results[0];
        const rowCount = currentResults.values.length;

        // Show query info
        document.getElementById('rowCount').textContent = rowCount;
        document.getElementById('execTime').textContent = execTime + 'ms';
        queryInfo.classList.remove('hidden');

        // Render results table
        renderResultsTable(currentResults);

    } catch (error) {
        showError(error.message);
    }
}

// Render Results Table
function renderResultsTable(result) {
    const resultsPanel = document.getElementById('resultsPanel');

    const columns = result.columns;
    const rows = result.values;

    if (rows.length === 0) {
        resultsPanel.innerHTML = '<div class="text-center py-12 text-gray-500">No se encontraron resultados</div>';
        return;
    }

    // Create table HTML
    let html = `
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-cyan-400/30">
                        ${columns.map(col => `
                            <th class="text-left p-2 font-bold text-cyan-400 whitespace-nowrap">${col}</th>
                        `).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${rows.map((row, idx) => `
                        <tr class="border-b border-gray-700/30 hover:bg-gray-700/30 transition-colors ${idx % 2 === 0 ? 'bg-gray-800/20' : ''}">
                            ${row.map(cell => {
                                let value = cell;
                                if (value === null) value = '<span class="text-gray-500 italic">NULL</span>';
                                else if (typeof value === 'number') value = `<span class="text-emerald-400">${value.toLocaleString()}</span>`;
                                else if (typeof value === 'string' && value.length > 100) value = value.substring(0, 100) + '...';
                                else value = `<span class="text-gray-200">${value}</span>`;

                                return `<td class="p-2 whitespace-nowrap">${value}</td>`;
                            }).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    resultsPanel.innerHTML = html;
}

// Show Error
function showError(message) {
    const errorPanel = document.getElementById('errorPanel');
    const errorMessage = document.getElementById('errorMessage');
    const resultsPanel = document.getElementById('resultsPanel');
    const queryInfo = document.getElementById('queryInfo');

    errorMessage.textContent = message;
    errorPanel.classList.remove('hidden');
    queryInfo.classList.add('hidden');

    resultsPanel.innerHTML = '<div class="text-center py-12 text-gray-500">Corrige el error para ver los resultados</div>';
}

// Format Query (basic)
function formatQuery() {
    const editor = document.getElementById('sqlEditor');
    let query = editor.value;

    // Basic SQL formatting
    query = query
        .replace(/\s+/g, ' ')
        .replace(/SELECT/gi, 'SELECT')
        .replace(/FROM/gi, '\nFROM')
        .replace(/WHERE/gi, '\nWHERE')
        .replace(/JOIN/gi, '\nJOIN')
        .replace(/LEFT JOIN/gi, '\nLEFT JOIN')
        .replace(/INNER JOIN/gi, '\nINNER JOIN')
        .replace(/GROUP BY/gi, '\nGROUP BY')
        .replace(/ORDER BY/gi, '\nORDER BY')
        .replace(/HAVING/gi, '\nHAVING')
        .replace(/LIMIT/gi, '\nLIMIT')
        .replace(/AND/gi, '\n  AND')
        .replace(/OR/gi, '\n  OR')
        .trim();

    editor.value = query;
}

// Update Editor Info
function updateEditorInfo() {
    const editor = document.getElementById('sqlEditor');
    const lines = editor.value.split('\n').length;
    document.getElementById('editorInfo').textContent = `Líneas: ${lines}`;
}

// Export to CSV
function exportToCSV() {
    if (!currentResults) {
        alert('Ejecuta una query primero para exportar resultados');
        return;
    }

    const columns = currentResults.columns;
    const rows = currentResults.values;

    // Create CSV content
    let csv = columns.join(',') + '\n';
    rows.forEach(row => {
        csv += row.map(cell => {
            if (cell === null) return '';
            if (typeof cell === 'string' && cell.includes(',')) return `"${cell}"`;
            return cell;
        }).join(',') + '\n';
    });

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `query_results_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', initDatabase);
