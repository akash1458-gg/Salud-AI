(function() {
  const COLORS = {
    primary: '#2F6F63',
    secondary: '#C9DBCF',
    accent: '#4C8F5B',
    danger: '#E2604F',
    warning: '#D9A441',
    text: '#1C2B2A',
    textDim: '#4B5C58',
    surface: '#FFFFFF',
    grid: '#DCE3DD'
  };

  const SVG_NS = "http://www.w3.org/2000/svg";

  function createSVGElement(tag, attributes) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [key, value] of Object.entries(attributes || {})) {
      el.setAttribute(key, value);
    }
    return el;
  }

  function createBezierPath(points) {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const cp1x = p1.x + (p2.x - p1.x) / 3;
      const cp1y = p1.y;
      const cp2x = p1.x + 2 * (p2.x - p1.x) / 3;
      const cp2y = p2.y;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  }

  window.Charts = {
    createLineChart(svgElement, data, options) {
      if (typeof svgElement === 'string') svgElement = document.getElementById(svgElement);
      if (!svgElement) return;
      
      const config = {
        color: COLORS.primary,
        fillGradient: true,
        showDots: true,
        showGrid: true,
        showLabels: true,
        animate: true,
        yMin: Math.min(...data.map(d => d.value)) * 0.9,
        yMax: Math.max(...data.map(d => d.value)) * 1.1,
        unit: '',
        ...options
      };

      svgElement.innerHTML = '';
      
      const width = svgElement.clientWidth || 800;
      const height = svgElement.clientHeight || 400;
      svgElement.setAttribute('viewBox', `0 0 ${width} ${height}`);
      
      const padding = { top: 20, right: 20, bottom: 40, left: 50 };
      if (!config.showLabels) {
        padding.bottom = 10;
        padding.left = 10;
      }

      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;

      // Defs (gradients)
      const defs = createSVGElement('defs');
      const gradientId = 'grad-' + Math.random().toString(36).substr(2, 9);
      const gradient = createSVGElement('linearGradient', {
        id: gradientId, x1: '0', y1: '0', x2: '0', y2: '1'
      });
      const stop1 = createSVGElement('stop', { offset: '0%', 'stop-color': config.color, 'stop-opacity': '0.4' });
      const stop2 = createSVGElement('stop', { offset: '100%', 'stop-color': config.color, 'stop-opacity': '0' });
      gradient.appendChild(stop1);
      gradient.appendChild(stop2);
      defs.appendChild(gradient);
      
      const filterId = 'glow-' + Math.random().toString(36).substr(2, 9);
      const filter = createSVGElement('filter', { id: filterId });
      const blur = createSVGElement('feGaussianBlur', { stdDeviation: '3', result: 'coloredBlur' });
      const merge = createSVGElement('feMerge');
      merge.appendChild(createSVGElement('feMergeNode', { in: 'coloredBlur' }));
      merge.appendChild(createSVGElement('feMergeNode', { in: 'SourceGraphic' }));
      filter.appendChild(blur);
      filter.appendChild(merge);
      defs.appendChild(filter);
      
      svgElement.appendChild(defs);

      // Grid & Labels
      const gridGroup = createSVGElement('g', { class: 'grid-lines' });
      const labelsGroup = createSVGElement('g', { class: 'axis-labels' });

      if (config.showGrid || config.showLabels) {
        const ySteps = 4;
        for (let i = 0; i <= ySteps; i++) {
          const yVal = config.yMin + (config.yMax - config.yMin) * (i / ySteps);
          const yPos = height - padding.bottom - (chartHeight * (i / ySteps));

          if (config.showGrid) {
            const line = createSVGElement('line', {
              x1: padding.left, y1: yPos, x2: width - padding.right, y2: yPos,
              stroke: COLORS.grid, 'stroke-width': '1'
            });
            gridGroup.appendChild(line);
          }

          if (config.showLabels) {
            const label = createSVGElement('text', {
              x: padding.left - 10, y: yPos + 4,
              fill: COLORS.textDim, 'font-size': '12px', 'text-anchor': 'end',
              'font-family': 'sans-serif'
            });
            label.textContent = Math.round(yVal) + config.unit;
            labelsGroup.appendChild(label);
          }
        }
      }
      
      svgElement.appendChild(gridGroup);
      svgElement.appendChild(labelsGroup);

      // Data points mapping
      const points = data.map((d, i) => {
        const xPos = padding.left + (chartWidth * (i / (data.length - 1 || 1)));
        const yPos = height - padding.bottom - chartHeight * ((d.value - config.yMin) / (config.yMax - config.yMin || 1));
        return { x: xPos, y: yPos, d };
      });

      // Path
      const pathString = createBezierPath(points);
      
      // Fill
      if (config.fillGradient) {
        const fillPathString = `${pathString} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`;
        const fillPath = createSVGElement('path', {
          d: fillPathString,
          fill: `url(#${gradientId})`,
          opacity: config.animate ? '0' : '1',
          class: 'chart-fill'
        });
        
        if (config.animate) {
          fillPath.style.transition = 'opacity 1s ease 0.5s';
          setTimeout(() => { fillPath.style.opacity = '1'; }, 50);
        }
        svgElement.appendChild(fillPath);
      }

      // Line
      const pathElement = createSVGElement('path', {
        d: pathString,
        fill: 'none',
        stroke: config.color,
        'stroke-width': '3',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        class: 'chart-line',
        filter: `url(#${filterId})`
      });

      if (config.animate) {
        const length = 2000; // approximation
        pathElement.setAttribute('stroke-dasharray', length);
        pathElement.setAttribute('stroke-dashoffset', length);
        pathElement.style.transition = 'stroke-dashoffset 1.5s ease-out';
        setTimeout(() => { pathElement.setAttribute('stroke-dashoffset', '0'); }, 50);
      }
      
      svgElement.appendChild(pathElement);

      // X-axis Labels
      if (config.showLabels) {
        const xLabelsGroup = createSVGElement('g', { class: 'x-labels' });
        points.forEach((p, i) => {
          if (i === 0 || i === points.length - 1 || i % Math.ceil(points.length / 5) === 0) {
            const label = createSVGElement('text', {
              x: p.x, y: height - padding.bottom + 20,
              fill: COLORS.textDim, 'font-size': '12px', 'text-anchor': 'middle',
              'font-family': 'sans-serif'
            });
            label.textContent = p.d.date;
            xLabelsGroup.appendChild(label);
          }
        });
        svgElement.appendChild(xLabelsGroup);
      }

      // Dots
      if (config.showDots) {
        const dotsGroup = createSVGElement('g', { class: 'chart-dots' });
        
        // Tooltip container
        const tooltip = document.createElement('div');
        tooltip.style.position = 'absolute';
        tooltip.style.display = 'none';
        tooltip.style.backgroundColor = 'rgba(21, 26, 36, 0.9)';
        tooltip.style.border = `1px solid ${config.color}`;
        tooltip.style.color = COLORS.text;
        tooltip.style.padding = '8px 12px';
        tooltip.style.borderRadius = '6px';
        tooltip.style.fontSize = '12px';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.backdropFilter = 'blur(4px)';
        tooltip.style.zIndex = '100';
        tooltip.style.boxShadow = `0 4px 12px rgba(0,0,0,0.5), 0 0 8px ${config.color}40`;
        tooltip.style.transform = 'translate(-50%, -120%)';
        
        const svgContainer = svgElement.parentElement;
        if (svgContainer) {
          if(getComputedStyle(svgContainer).position === 'static') {
            svgContainer.style.position = 'relative';
          }
          svgContainer.appendChild(tooltip);
        }

        points.forEach(p => {
          const dot = createSVGElement('circle', {
            cx: p.x, cy: p.y, r: '4',
            fill: COLORS.surface,
            stroke: config.color,
            'stroke-width': '2',
            opacity: config.animate ? '0' : '1',
            style: 'transition: all 0.3s ease; cursor: pointer;'
          });

          if (config.animate) {
            dot.style.transition = 'opacity 0.5s ease 1.5s, r 0.2s ease, fill 0.2s ease';
            setTimeout(() => { dot.style.opacity = '1'; }, 50);
          }

          dot.addEventListener('mouseenter', (e) => {
            dot.setAttribute('r', '6');
            dot.setAttribute('fill', config.color);
            if (svgContainer) {
              const rect = svgContainer.getBoundingClientRect();
              const svgRect = svgElement.getBoundingClientRect();
              const scaleX = svgRect.width / width;
              const scaleY = svgRect.height / height;
              
              tooltip.innerHTML = `<strong>${p.d.value}${config.unit}</strong><br><span style="color:${COLORS.textDim}">${p.d.date}</span>`;
              tooltip.style.display = 'block';
              tooltip.style.left = `${p.x * scaleX}px`;
              tooltip.style.top = `${p.y * scaleY}px`;
            }
          });
          
          dot.addEventListener('mouseleave', () => {
            dot.setAttribute('r', '4');
            dot.setAttribute('fill', COLORS.surface);
            tooltip.style.display = 'none';
          });

          dotsGroup.appendChild(dot);
        });
        svgElement.appendChild(dotsGroup);
      }
      
      // Store config for updates
      svgElement.__chartConfig = config;
    },

    updateLineChart(svgElement, newData, options) {
      if (typeof svgElement === 'string') svgElement = document.getElementById(svgElement);
      if (!svgElement) return;
      const oldConfig = svgElement.__chartConfig || {};
      const config = { ...oldConfig, ...options, animate: true };
      this.createLineChart(svgElement, newData, config);
    },

    createCircularProgress(svgElement, value, max, options) {
      if (typeof svgElement === 'string') svgElement = document.getElementById(svgElement);
      if (!svgElement) return;
      
      const config = {
        color: COLORS.primary,
        trackColor: 'rgba(255,255,255,0.05)',
        size: 180,
        strokeWidth: 12,
        animate: true,
        label: '',
        showText: true,
        ...options
      };

      svgElement.innerHTML = '';
      svgElement.setAttribute('viewBox', `0 0 ${config.size} ${config.size}`);
      svgElement.style.width = `${config.size}px`;
      svgElement.style.height = `${config.size}px`;

      const center = config.size / 2;
      const radius = center - config.strokeWidth;
      const circumference = 2 * Math.PI * radius;
      
      // Filter for glow
      const defs = createSVGElement('defs');
      const filterId = 'glow-circ-' + Math.random().toString(36).substr(2, 9);
      const filter = createSVGElement('filter', { id: filterId });
      const blur = createSVGElement('feGaussianBlur', { stdDeviation: '4', result: 'coloredBlur' });
      const merge = createSVGElement('feMerge');
      merge.appendChild(createSVGElement('feMergeNode', { in: 'coloredBlur' }));
      merge.appendChild(createSVGElement('feMergeNode', { in: 'SourceGraphic' }));
      filter.appendChild(blur);
      filter.appendChild(merge);
      defs.appendChild(filter);
      svgElement.appendChild(defs);

      // Track
      const track = createSVGElement('circle', {
        cx: center, cy: center, r: radius,
        fill: 'none',
        stroke: config.trackColor,
        'stroke-width': config.strokeWidth
      });
      svgElement.appendChild(track);

      // Progress
      const progressValue = Math.min(Math.max(value, 0), max);
      const percentage = progressValue / max;
      const dashoffset = circumference - (percentage * circumference);

      const progress = createSVGElement('circle', {
        cx: center, cy: center, r: radius,
        fill: 'none',
        stroke: config.color,
        'stroke-width': config.strokeWidth,
        'stroke-linecap': 'round',
        'stroke-dasharray': circumference,
        'stroke-dashoffset': config.animate ? circumference : dashoffset,
        filter: `url(#${filterId})`,
        transform: `rotate(-90 ${center} ${center})`
      });

      if (config.animate) {
        progress.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
        setTimeout(() => { progress.setAttribute('stroke-dashoffset', dashoffset); }, 50);
      }
      
      svgElement.appendChild(progress);

      // Center Text
      if (config.showText) {
        const textGroup = createSVGElement('g', { 'text-anchor': 'middle' });
        
        const valueText = createSVGElement('text', {
          x: center, y: center + (config.label ? -5 : 10),
          fill: COLORS.text,
          'font-size': '36px',
          'font-weight': 'bold',
          'font-family': 'sans-serif'
        });
        
        if (config.animate) {
          let current = 0;
          const duration = 1500;
          const startTime = performance.now();
          
          function updateNumber(time) {
            const elapsed = time - startTime;
            const p = Math.min(elapsed / duration, 1);
            // ease out cubic
            const ease = 1 - Math.pow(1 - p, 3);
            current = Math.round(ease * progressValue);
            valueText.textContent = current;
            if (p < 1) requestAnimationFrame(updateNumber);
            else valueText.textContent = progressValue;
          }
          requestAnimationFrame(updateNumber);
        } else {
          valueText.textContent = progressValue;
        }
        textGroup.appendChild(valueText);

        if (config.label) {
          const labelText = createSVGElement('text', {
            x: center, y: center + 25,
            fill: COLORS.textDim,
            'font-size': '14px',
            'font-family': 'sans-serif'
          });
          labelText.textContent = config.label;
          textGroup.appendChild(labelText);
        }

        svgElement.appendChild(textGroup);
      }
      
      svgElement.__circConfig = { ...config, value, max };
    },

    updateCircularProgress(svgElement, newValue, max) {
      if (typeof svgElement === 'string') svgElement = document.getElementById(svgElement);
      if (!svgElement || !svgElement.__circConfig) return;
      const config = { ...svgElement.__circConfig, animate: true };
      this.createCircularProgress(svgElement, newValue, max || config.max, config);
    }
  };
})();
