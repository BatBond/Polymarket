// Chart drawing functions

function drawTopWinsChart() {
    const canvas = document.getElementById('topWinsChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const data = [2000, 4500, 6000, 8500, 10000, 11500, 12167];
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(46, 204, 113, 0.3)');
    gradient.addColorStop(1, 'rgba(46, 204, 113, 0.01)');
    
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    
    const stepX = canvas.width / (data.length - 1);
    data.forEach((value, i) => {
        const x = i * stepX;
        const y = canvas.height - (value / 12167) * (canvas.height - 20);
        if (i === 0) ctx.lineTo(x, y);
        else {
            const prevX = (i - 1) * stepX;
            const prevY = canvas.height - (data[i - 1] / 12167) * (canvas.height - 20);
            const cpX = (prevX + x) / 2;
            ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
        }
    });
    
    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    
    ctx.beginPath();
    data.forEach((value, i) => {
        const x = i * stepX;
        const y = canvas.height - (value / 12167) * (canvas.height - 20);
        if (i === 0) ctx.moveTo(x, y);
        else {
            const prevX = (i - 1) * stepX;
            const prevY = canvas.height - (data[i - 1] / 12167) * (canvas.height - 20);
            const cpX = (prevX + x) / 2;
            ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
        }
    });
    
    ctx.strokeStyle = '#2ecc71';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawEdgeDistributionChart() {
    const canvas = document.getElementById('edgeDistributionChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const data = [2, 5, 8, 15, 25, 35, 45, 30, 20, 10, 5];
    const labels = ['-5¢', '-4¢', '-3¢', '-2¢', '-1¢', '0', '+1¢', '+2¢', '+3¢', '+4¢', '+5¢'];
    const barWidth = canvas.width / data.length - 4;
    const maxValue = 50;
    
    data.forEach((value, i) => {
        const isPositive = i >= 6;
        const isZero = i === 5;
        const barHeight = (value / maxValue) * (canvas.height - 30);
        const x = i * (canvas.width / data.length) + 2;
        const y = canvas.height - barHeight - 20;
        
        if (isZero) ctx.fillStyle = 'rgba(138, 154, 138, 0.6)';
        else if (isPositive) ctx.fillStyle = 'rgba(46, 204, 113, 0.6)';
        else ctx.fillStyle = 'rgba(231, 76, 60, 0.6)';
        
        ctx.fillRect(x, y, barWidth, barHeight);
    });
    
    ctx.fillStyle = '#6a7a6a';
    ctx.font = '9px JetBrains Mono';
    ctx.textAlign = 'center';
    labels.forEach((label, i) => {
        const x = i * (canvas.width / labels.length) + (canvas.width / labels.length) / 2;
        ctx.fillText(label, x, canvas.height - 5);
    });
}

function drawProbabilityLattice() {
    const container = document.getElementById('probability-lattice-viz');
    if (!container) return;
    
    // Clear existing canvas
    container.innerHTML = '';
    
    const canvas = document.createElement('canvas');
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    const numGates = 8;
    const gateSpacing = canvas.width / (numGates + 1);
    const startY = 50;
    const endY = canvas.height - 100;
    
    // Draw gates
    for (let i = 0; i <= numGates; i++) {
        const x = gateSpacing * i + gateSpacing / 2;
        const y = startY + i * (endY - startY) / numGates;
        
        ctx.strokeStyle = '#1a2a1a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 30, y);
        ctx.lineTo(x + 30, y);
        ctx.stroke();
        
        ctx.fillStyle = '#6a7a6a';
        ctx.font = '10px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(`G${i + 1}`, x, y - 10);
    }
    
    // Simulate and draw ball paths
    for (let b = 0; b < 50; b++) {
        let xPos = canvas.width / 2;
        const isProfitable = Math.random() > 0.25;
        
        ctx.strokeStyle = isProfitable ? 'rgba(46, 204, 113, 0.3)' : 'rgba(231, 76, 60, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(xPos, startY);
        
        for (let g = 0; g < numGates; g++) {
            const direction = Math.random() > 0.5 ? 1 : -1;
            const bias = isProfitable ? 0.6 : 0.4;
            const actualDir = Math.random() < bias ? direction : -direction;
            xPos += actualDir * gateSpacing * 0.3;
            xPos = Math.max(50, Math.min(canvas.width - 50, xPos));
            
            const yPos = startY + (g + 1) * (endY - startY) / numGates;
            ctx.lineTo(xPos, yPos);
        }
        ctx.stroke();
    }
    
    // Draw histogram
    const bins = 10;
    const binWidth = canvas.width / bins;
    const maxCount = 50;
    const histogramData = [5, 10, 15, 25, 35, 40, 45, 30, 15, 5];
    
    histogramData.forEach((count, i) => {
        const isProfit = i >= bins / 2;
        const height = (count / maxCount) * 100;
        const x = i * binWidth + 2;
        const y = canvas.height - 50 - height;
        
        ctx.fillStyle = isProfit ? 'rgba(46, 204, 113, 0.4)' : 'rgba(231, 76, 60, 0.4)';
        ctx.fillRect(x, y, binWidth - 4, height);
    });
    
    ctx.fillStyle = '#e74c3c';
    ctx.font = '10px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText('LOSS - 24%', canvas.width * 0.25, canvas.height - 30);
    
    ctx.fillStyle = '#2ecc71';
    ctx.fillText('PROFIT - 76%', canvas.width * 0.75, canvas.height - 30);
}

function drawTailProbabilityRidge() {
    const container = document.getElementById('tail-ridge-viz');
    if (!container) return;
    
    // Clear existing canvas
    container.innerHTML = '';
    
    const canvas = document.createElement('canvas');
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    const numRidges = 20;
    const ridgeSpacing = canvas.height / (numRidges + 2);
    
    for (let i = 0; i < numRidges; i++) {
        const y = ridgeSpacing * (i + 1);
        const offset = Math.sin(i * 0.5) * 50;
        
        ctx.strokeStyle = `rgba(46, 204, 113, ${0.6 - i * 0.02})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        
        for (let x = 0; x <= canvas.width; x += 20) {
            const baseY = y;
            const wave = Math.sin((x / canvas.width) * Math.PI * 3) * 30;
            const tailBoost = x > canvas.width * 0.7 ? 40 : 0;
            const yPos = baseY + wave + offset + tailBoost;
            
            if (x === 0) ctx.moveTo(x, yPos);
            else ctx.lineTo(x, yPos);
        }
        ctx.stroke();
    }
    
    // Draw tail zone marker
    const tailX = canvas.width * 0.75;
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(tailX, 20);
    ctx.lineTo(tailX, canvas.height - 20);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.fillStyle = '#e74c3c';
    ctx.font = '10px JetBrains Mono';
    ctx.textAlign = 'left';
    ctx.fillText('TAIL ZONE', tailX + 10, 30);
    
    // Draw strike marker
    const strikeX = canvas.width * 0.6;
    ctx.strokeStyle = '#3ddc84';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(strikeX, 20);
    ctx.lineTo(strikeX, canvas.height - 20);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.fillStyle = '#3ddc84';
    ctx.fillText('STRIKE', strikeX + 10, 30);
}

function drawRelationshipGraph() {
    const container = document.getElementById('relationship-graph-viz');
    if (!container) return;
    
    // Clear existing canvas
    container.innerHTML = '';
    
    const canvas = document.createElement('canvas');
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    // Create clusters
    const clusters = [
        { x: canvas.width * 0.25, y: canvas.height * 0.3, label: 'BEAR_CLUSTER', color: '#e74c3c' },
        { x: canvas.width * 0.75, y: canvas.height * 0.7, label: 'CATALYST_RING', color: '#3ddc84' },
        { x: canvas.width * 0.5, y: canvas.height * 0.5, label: 'HUB_PRIME', color: '#e8f5e8' }
    ];
    
    // Draw edges
    for (let i = 0; i < 40; i++) {
        const source = clusters[Math.floor(Math.random() * clusters.length)];
        const target = clusters[Math.floor(Math.random() * clusters.length)];
        
        ctx.strokeStyle = 'rgba(74, 90, 74, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
    }
    
    // Generate satellite nodes
    const nodes = [];
    for (let i = 0; i < 25; i++) {
        const cluster = clusters[Math.floor(Math.random() * clusters.length)];
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 100;
        const type = Math.random() > 0.5 ? 'bull' : 'bear';
        
        nodes.push({
            x: cluster.x + Math.cos(angle) * distance,
            y: cluster.y + Math.sin(angle) * distance,
            type: type,
            color: type === 'bull' ? '#2ecc71' : '#e74c3c'
        });
    }
    
    // Draw nodes
    clusters.forEach(cluster => {
        ctx.fillStyle = cluster.color;
        ctx.beginPath();
        ctx.arc(cluster.x, cluster.y, 20, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#6a7a6a';
        ctx.font = '9px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(cluster.label, cluster.x, cluster.y + 35);
    });
    
    nodes.forEach(node => {
        ctx.fillStyle = node.color;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    });
    
    // Draw median path
    ctx.strokeStyle = '#8a9a8a';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(clusters[0].x, clusters[0].y);
    ctx.bezierCurveTo(
        canvas.width / 2, canvas.height / 2 - 50,
        canvas.width / 2, canvas.height / 2 - 50,
        clusters[2].x, clusters[2].y
    );
    ctx.bezierCurveTo(
        canvas.width * 0.625, canvas.height * 0.6,
        canvas.width * 0.625, canvas.height * 0.6,
        clusters[1].x, clusters[1].y
    );
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    
    // Draw arrow
    ctx.fillStyle = '#3ddc84';
    ctx.beginPath();
    ctx.moveTo(clusters[1].x - 10, clusters[1].y - 5);
    ctx.lineTo(clusters[1].x + 10, clusters[1].y);
    ctx.lineTo(clusters[1].x - 10, clusters[1].y + 5);
    ctx.fill();
    
    ctx.fillStyle = '#3ddc84';
    ctx.font = '10px JetBrains Mono';
    ctx.textAlign = 'left';
    ctx.fillText('ZERO ▲', clusters[1].x + 15, clusters[1].y);
}

// Initialize all charts
function initializeCharts() {
    drawTopWinsChart();
    drawEdgeDistributionChart();
    drawProbabilityLattice();
    drawTailProbabilityRidge();
    drawRelationshipGraph();
}

// Update charts with new data
function updateCharts(data) {
    // Redraw visualizations with new data
    drawProbabilityLattice();
    drawTailProbabilityRidge();
    drawRelationshipGraph();
}

// Make functions available globally
window.initializeCharts = initializeCharts;
window.updateCharts = updateCharts;