/*
  DEMANDIQ MiniChart Engine (Offline)
  Compatible API: new Chart(ctx, config)
  Supports: line + multi dataset
*/

class MiniChart {
  constructor(ctx, config) {
    this.ctx = ctx;
    this.type = config.type || "line";
    this.labels = config.data.labels;
    this.datasets = config.data.datasets;
    this.options = config.options || {};
    this.canvas = ctx.canvas;

    this.width = this.canvas.width || 800;
    this.height = this.canvas.height || 400;

    this.margin = 40;
    this.draw();
  }

  destroy() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
  }

  _minmax() {
    let all = [];
    for (const ds of this.datasets) all = all.concat(ds.data);
    return {
      min: Math.min(...all),
      max: Math.max(...all)
    };
  }

  _xy(idx, val, min, max) {
    const x = this.margin + (idx / (this.labels.length - 1)) *
      (this.width - 2 * this.margin);
    const y = this.margin + (1 - (val - min) / (max - min)) *
      (this.height - 2 * this.margin);
    return { x, y };
  }

  drawAxes() {
    const ctx = this.ctx;
    ctx.strokeStyle = "#444";
    ctx.beginPath();
    ctx.moveTo(this.margin, this.margin);
    ctx.lineTo(this.margin, this.height - this.margin);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(this.margin, this.height - this.margin);
    ctx.lineTo(this.width - this.margin, this.height - this.margin);
    ctx.stroke();
  }

  drawGrid() {
    const ctx = this.ctx;
    ctx.fillStyle = "#f8f8f8";
    ctx.fillRect(0, 0, this.width, this.height);
  }

  drawLabels() {
    const ctx = this.ctx;
    ctx.font = "10px Arial";
    ctx.fillStyle = "#444";
    ctx.textAlign = "center";

    this.labels.forEach((lab, i) => {
      const x = this.margin + (i / (this.labels.length - 1)) *
        (this.width - 2 * this.margin);
      ctx.fillText(lab, x, this.height - 6);
    });
  }

  drawLine() {
    const ctx = this.ctx;
    const { min, max } = this._minmax();

    for (const ds of this.datasets) {
      ctx.beginPath();
      ctx.strokeStyle = ds.borderColor || "blue";
      ctx.lineWidth = ds.borderWidth || 2;

      ds.data.forEach((v, i) => {
        const { x, y } = this._xy(i, v, min, max);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }
  }

  draw() {
    this.drawGrid();
    this.drawAxes();
    this.drawLabels();
    this.drawLine();
  }
}

function Chart(ctx, config) {
  return new MiniChart(ctx, config);
}
