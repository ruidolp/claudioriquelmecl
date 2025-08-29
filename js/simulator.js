// js/simulator.js - Simulador de Fallas de DB

class DatabaseFailureSimulator {
    constructor() {
        this.operationsPerMinute = 1000;
        this.avgOperationValue = 15.50;
        this.isSimulating = false;
        
        // Canvas contexts
        this.haCanvas = null;
        this.noHaCanvas = null;
        this.haCtx = null;
        this.noHaCtx = null;
        
        // Graph data
        this.haGraphData = [];
        this.noHaGraphData = [];
        this.graphUpdateInterval = null;
        
        // Simulation data
        this.haSteps = [
            { text: "⚡ Patroni detecta falla del nodo primario", duration: 2000, type: "warning" },
            { text: "⚙ Patroni ejecuta failover automático", duration: 2000, type: "info" },
            { text: "🔗 HAProxy redirige tráfico al nuevo primario", duration: 2000, type: "info" },
            { text: "🔄 Aplicaciones se reconectan automáticamente", duration: 2000, type: "info" },
            { text: "✓ SERVICIO RESTAURADO", duration: 2000, type: "success" }
        ];
        
        this.noHaSteps = [
            { text: "⚠ Alerta en sistema de monitoreo (+1 min)", duration: 2000, type: "error", minutes: 1 },
            { text: "🔍 Operador identifica alerta (+2 min)", duration: 2000, type: "warning", minutes: 2 },
            { text: "✓ Operador realiza checklist de validación (+5 min)", duration: 2000, type: "warning", minutes: 5 },
            { text: "📱 Escala al DBA de turno (+5 min)", duration: 2000, type: "warning", minutes: 5 },
            { text: "🖥 DBA se levanta, prende PC, se conecta VPN y SSH (+15 min)", duration: 2000, type: "warning", minutes: 15 },
            { text: "⚡ DBA aplica failover manual (+5 min)", duration: 2000, type: "info", minutes: 5 },
            { text: "📤 DBA notifica a Turno Middleware (+5 min)", duration: 2000, type: "info", minutes: 5 },
            { text: "🔄 Turno Middleware cambia datasources (+10 min)", duration: 2000, type: "info", minutes: 10 },
            { text: "✓ SERVICIO RESTAURADO", duration: 2000, type: "success", minutes: 0 }
        ];
        
        this.init();
    }
    
    init() {
        this.setupCanvases();
        this.setupEventListeners();
        this.startGraphUpdates();
        this.updateInputValues();
    }
    
    setupCanvases() {
        this.haCanvas = document.getElementById('haTransactionGraph');
        this.noHaCanvas = document.getElementById('noHaTransactionGraph');
        
        if (this.haCanvas && this.noHaCanvas) {
            this.haCtx = this.haCanvas.getContext('2d');
            this.noHaCtx = this.noHaCanvas.getContext('2d');
            
            // Set canvas size based on container
            this.resizeCanvases();
            window.addEventListener('resize', () => this.resizeCanvases());
        }
    }
    
    resizeCanvases() {
        const containers = [this.haCanvas, this.noHaCanvas];
        containers.forEach(canvas => {
            if (canvas) {
                const rect = canvas.getBoundingClientRect();
                canvas.width = rect.width * window.devicePixelRatio;
                canvas.height = rect.height * window.devicePixelRatio;
                const ctx = canvas.getContext('2d');
                ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            }
        });
    }
    
    setupEventListeners() {
        // Input listeners
        const operationsInput = document.getElementById('operationsPerMinute');
        const valueInput = document.getElementById('avgOperationValue');
        const simulateBtn = document.getElementById('simulateFailure');
        
        if (operationsInput) {
            operationsInput.addEventListener('input', (e) => {
                this.operationsPerMinute = parseFloat(e.target.value) || 0;
                this.updateGraphRanges();
            });
        }
        
        if (valueInput) {
            valueInput.addEventListener('input', (e) => {
                this.avgOperationValue = parseFloat(e.target.value) || 0;
            });
        }
        
        if (simulateBtn) {
            simulateBtn.addEventListener('click', () => this.simulateFailure());
        }
    }
    
    updateInputValues() {
        const operationsInput = document.getElementById('operationsPerMinute');
        const valueInput = document.getElementById('avgOperationValue');
        
        if (operationsInput) {
            this.operationsPerMinute = parseFloat(operationsInput.value) || 1000;
        }
        if (valueInput) {
            this.avgOperationValue = parseFloat(valueInput.value) || 15.50;
        }
    }
    
    updateGraphRanges() {
        // Reset graph data when range changes
        this.haGraphData = [];
        this.noHaGraphData = [];
    }
    
    startGraphUpdates() {
        this.graphUpdateInterval = setInterval(() => {
            if (!this.isSimulating) {
                this.updateGraphs('normal');
            }
        }, 1000); // Update every second
    }
    
    updateGraphs(state = 'normal') {
        // Generate data points
        const baseValue = this.operationsPerMinute;
        const variation = baseValue * 0.1; // 10% variation
        
        let haValue, noHaValue;
        
        switch (state) {
            case 'failure':
                haValue = 0;
                noHaValue = 0;
                break;
            case 'ha-recovery':
                haValue = baseValue + (Math.random() - 0.5) * variation;
                noHaValue = 0;
                break;
            case 'no-ha-recovery':
                haValue = baseValue + (Math.random() - 0.5) * variation;
                noHaValue = baseValue + (Math.random() - 0.5) * variation;
                break;
            default: // normal
                haValue = baseValue + (Math.random() - 0.5) * variation;
                noHaValue = baseValue + (Math.random() - 0.5) * variation;
        }
        
        // Add to data arrays (keep last 60 points)
        this.haGraphData.push(haValue);
        this.noHaGraphData.push(noHaValue);
        
        if (this.haGraphData.length > 60) {
            this.haGraphData.shift();
            this.noHaGraphData.shift();
        }
        
        // Draw graphs
        this.drawGraph(this.haCtx, this.haGraphData, state === 'failure' || (state === 'ha-recovery' && Math.random() > 0.3) ? '#FF5555' : '#00FF88');
        this.drawGraph(this.noHaCtx, this.noHaGraphData, state === 'failure' || state === 'ha-recovery' ? '#FF5555' : '#00FF88');
    }
    
    drawGraph(ctx, data, color) {
        if (!ctx || data.length === 0) return;
        
        const canvas = ctx.canvas;
        const width = canvas.width / window.devicePixelRatio;
        const height = canvas.height / window.devicePixelRatio;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Background
        ctx.fillStyle = '#0F0F23';
        ctx.fillRect(0, 0, width, height);
        
        // Grid
        ctx.strokeStyle = 'rgba(0, 217, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        
        // Horizontal grid lines
        for (let i = 0; i <= 4; i++) {
            const y = (height / 4) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Vertical grid lines
        for (let i = 0; i <= 6; i++) {
            const x = (width / 6) * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        ctx.setLineDash([]);
        
        // Find max value for scaling
        const maxValue = Math.max(...data, this.operationsPerMinute * 1.2);
        
        // Draw line
        if (data.length > 1) {
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            for (let i = 0; i < data.length; i++) {
                const x = (width / (data.length - 1)) * i;
                const y = height - (data[i] / maxValue) * height;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
            
            // Add glow effect
            ctx.shadowColor = color;
            ctx.shadowBlur = 5;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
        
        // Y-axis labels
        ctx.fillStyle = '#CBD5E1';
        ctx.font = '10px JetBrains Mono';
        ctx.textAlign = 'left';
        
        for (let i = 0; i <= 4; i++) {
            const value = Math.round((maxValue / 4) * (4 - i));
            const y = (height / 4) * i + 12;
            ctx.fillText(value.toString(), 5, y);
        }
    }
    
    async simulateFailure() {
        if (this.isSimulating) return;
        
        this.isSimulating = true;
        
        // Disable button
        const btn = document.getElementById('simulateFailure');
        if (btn) {
            btn.disabled = true;
            btn.textContent = '🔄 SIMULANDO...';
            btn.classList.add('loading-simulation');
        }
        
        // Hide cost analysis
        const costAnalysis = document.getElementById('costAnalysis');
        if (costAnalysis) {
            costAnalysis.classList.add('hidden');
        }
        
        // Start failure state
        this.updateGraphs('failure');
        this.setSystemStatus('failure');
        
        // Run simulations in parallel
        const haPromise = this.runHASimulation();
        const noHaPromise = this.runNoHASimulation();
        
        await Promise.all([haPromise, noHaPromise]);
        
        // Calculate and show costs
        this.calculateCosts();
        
        // Re-enable button
        if (btn) {
            btn.disabled = false;
            btn.textContent = '🔥 SIMULAR FALLA 🔥';
            btn.classList.remove('loading-simulation');
        }
        
        this.isSimulating = false;
    }
    
    async runHASimulation() {
        const terminal = document.getElementById('haTerminalLog');
        const timer = document.getElementById('haTimer');
        const status = document.getElementById('haStatus');
        
        // Clear terminal
        if (terminal) {
            terminal.innerHTML = '<div class="terminal-line">postgres@cluster-01:~$ monitoring failover process...</div>';
        }
        
        let totalTime = 0;
        const totalDuration = 10; // 10 seconds total
        const stepDuration = totalDuration / this.haSteps.length; // Equal time per step
        
        for (let i = 0; i < this.haSteps.length; i++) {
            const step = this.haSteps[i];
            
            // Add step to terminal with typing effect
            if (terminal) {
                const line = document.createElement('div');
                line.className = `terminal-line ${step.type} typing-line`;
                line.textContent = step.text;
                terminal.appendChild(line);
                terminal.scrollTop = terminal.scrollHeight;
            }
            
            // Wait for step duration
            await this.sleep(stepDuration * 1000);
            totalTime += stepDuration;
            
            // Update timer
            if (timer) {
                timer.textContent = `⏱️ Tiempo: ${Math.round(totalTime)} seg`;
            }
            
            // Update status
            if (status) {
                if (i === this.haSteps.length - 1) {
                    status.textContent = '✓ Sistema restaurado';
                    status.className = 'text-lg status-normal';
                    this.updateGraphs('ha-recovery');
                } else if (i === 0) {
                    status.textContent = '⚠ Failover en progreso';
                    status.className = 'text-lg status-failure';
                } else {
                    status.textContent = '⚙ Restaurando servicio';
                    status.className = 'text-lg status-recovery';
                }
            }
        }
        
        // Set final completed state
        this.setContainerState('ha', 'completed');
    }
    
    async runNoHASimulation() {
        const terminal = document.getElementById('noHaTerminalLog');
        const timer = document.getElementById('noHaTimer');
        const status = document.getElementById('noHaStatus');
        
        // Clear terminal
        if (terminal) {
            terminal.innerHTML = '<div class="terminal-line">postgres@db-server:~$ connection lost...</div>';
        }
        
        let totalTime = 0;
        
        for (let i = 0; i < this.noHaSteps.length; i++) {
            const step = this.noHaSteps[i];
            
            // Add step to terminal with typing effect
            if (terminal) {
                const line = document.createElement('div');
                line.className = `terminal-line ${step.type} typing-line`;
                line.textContent = step.text;
                terminal.appendChild(line);
                terminal.scrollTop = terminal.scrollHeight;
            }
            
            // Wait for animation
            await this.sleep(step.duration);
            
            // Add time from this step
            if (step.minutes) {
                totalTime += step.minutes;
            }
            
            // Update timer
            if (timer) {
                timer.textContent = `⏱️ Tiempo: ${totalTime} min`;
            }
            
            // Update status
            if (status) {
                if (i === this.noHaSteps.length - 1) {
                    status.textContent = '✓ Sistema restaurado';
                    status.className = 'text-lg status-normal';
                    this.updateGraphs('no-ha-recovery');
                } else if (i === 0) {
                    status.textContent = '⚠ Sistema caído';
                    status.className = 'text-lg status-failure';
                } else {
                    status.textContent = '⚙ Recuperación manual en progreso';
                    status.className = 'text-lg status-recovery';
                }
            }
        }
        
        // Set final completed state
        this.setContainerState('no-ha', 'completed');
    }
    
    setSystemStatus(state) {
        const containers = document.querySelectorAll('.simulator-container');
        containers.forEach(container => {
            // Skip the input container
            if (!container.querySelector('.terminal-content')) return;
            
            container.classList.remove('simulating', 'failure', 'recovery', 'completed');
            if (state !== 'normal') {
                container.classList.add(state);
            }
        });
    }
    
    setContainerState(type, state) {
        const selector = type === 'ha' ? '#haTransactionGraph' : '#noHaTransactionGraph';
        const container = document.querySelector(selector)?.closest('.simulator-container');
        
        if (container) {
            container.classList.remove('simulating', 'failure', 'recovery', 'completed');
            if (state !== 'normal') {
                container.classList.add(state);
            }
        }
    }
    
    calculateCosts() {
        const haDowntimeMinutes = 10 / 60; // 10 seconds converted to minutes
        const noHaDowntimeMinutes = this.noHaSteps.reduce((total, step) => {
            return total + (step.minutes || 0);
        }, 0); // Sum all minutes from steps
        
        const operationsPerMinute = this.operationsPerMinute;
        const valuePerOperation = this.avgOperationValue;
        
        // Calculate HA costs
        const haDirectLoss = haDowntimeMinutes * operationsPerMinute * valuePerOperation;
        const haOperationalCost = 50; // Minimal operational cost
        const haSlapenalty = haDirectLoss * 0.05; // 5% penalty
        const haReputationalCost = haDirectLoss * 1; // 1x multiplier
        const haProductivityLoss = haDowntimeMinutes * 30 * 50 / 60; // 30 employees * $50/hr
        const haTotal = haDirectLoss + haOperationalCost + haSlapenalty + haReputationalCost + haProductivityLoss;
        
        // Calculate No HA costs
        const noHaDirectLoss = noHaDowntimeMinutes * operationsPerMinute * valuePerOperation;
        const noHaOperationalCost = 4 * 150 + 1000; // 4 hours DBA + infrastructure
        const noHaSlapenalty = noHaDirectLoss * 0.15; // 15% penalty
        const noHaReputationalCost = noHaDirectLoss * 3; // 3x multiplier
        const noHaProductivityLoss = noHaDowntimeMinutes * 50 * 50 / 60; // 50 employees * $50/hr
        const noHaTotal = noHaDirectLoss + noHaOperationalCost + noHaSlapenalty + noHaReputationalCost + noHaProductivityLoss;
        
        // Update UI
        this.updateCostDisplay('ha', {
            direct: haDirectLoss,
            operational: haOperationalCost,
            sla: haSlapenalty,
            reputation: haReputationalCost,
            productivity: haProductivityLoss,
            total: haTotal
        });
        
        this.updateCostDisplay('noHa', {
            direct: noHaDirectLoss,
            operational: noHaOperationalCost,
            sla: noHaSlapenalty,
            reputation: noHaReputationalCost,
            productivity: noHaProductivityLoss,
            total: noHaTotal
        });
        
        // Calculate savings
        const savings = noHaTotal - haTotal;
        const savingsPercentage = ((savings / noHaTotal) * 100).toFixed(1);
        
        document.getElementById('totalSavings').textContent = `${this.formatCurrency(savings)}`;
        document.getElementById('savingsPercentage').textContent = `${savingsPercentage}%`;
        
        // Show cost analysis
        const costAnalysis = document.getElementById('costAnalysis');
        if (costAnalysis) {
            costAnalysis.classList.remove('hidden');
            costAnalysis.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Reset all containers to normal state
        setTimeout(() => {
            this.setSystemStatus('normal');
        }, 1000);
    }
    
    updateCostDisplay(type, costs) {
        const prefix = type === 'ha' ? 'ha' : 'noHa';
        
        document.getElementById(`${prefix}Direct`).textContent = `$${this.formatCurrency(costs.direct)}`;
        document.getElementById(`${prefix}Operational`).textContent = `$${this.formatCurrency(costs.operational)}`;
        document.getElementById(`${prefix}Sla`).textContent = `$${this.formatCurrency(costs.sla)}`;
        document.getElementById(`${prefix}Reputation`).textContent = `$${this.formatCurrency(costs.reputation)}`;
        document.getElementById(`${prefix}Productivity`).textContent = `$${this.formatCurrency(costs.productivity)}`;
        document.getElementById(`${prefix}Total`).textContent = `$${this.formatCurrency(costs.total)}`;
    }
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(Math.round(amount));
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize simulator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DatabaseFailureSimulator();
});
