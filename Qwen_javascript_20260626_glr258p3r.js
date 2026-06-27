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
            const actualDir =