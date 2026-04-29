// Memory Graph Visualization using D3.js

let memorySimulation = null;
let memoryGraphData = { nodes: [], links: [] };

// Initialize memory graph when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initializeMemoryGraph();
});

function initializeMemoryGraph() {
  const container = document.getElementById('memoryGraph');
  if (!container) return;

  // Set up SVG
  const width = container.clientWidth;
  const height = 600;

  const svg = d3.select('#memoryGraph')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height]);

  // Add zoom behavior
  const g = svg.append('g');
  
  const zoom = d3.zoom()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
      g.attr('transform', event.transform);
    });

  svg.call(zoom);

  // Create arrow markers for directed edges
  svg.append('defs').selectAll('marker')
    .data(['end'])
    .enter().append('marker')
    .attr('id', 'arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 20)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#6366f1');

  // Create force simulation
  memorySimulation = d3.forceSimulation()
    .force('link', d3.forceLink().id(d => d.id).distance(100))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(30));

  // Store references for updates
  window.memoryGraphSvg = svg;
  window.memoryGraphG = g;
  window.memoryGraphWidth = width;
  window.memoryGraphHeight = height;

  // Set up search functionality
  setupMemorySearch();

  // Set up reset zoom button
  const resetBtn = document.getElementById('resetZoomBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      svg.transition().duration(750).call(
        zoom.transform,
        d3.zoomIdentity
      );
    });
  }
}

function renderMemoryGraph(graphData) {
  if (!graphData || !window.memoryGraphG) return;

  const g = window.memoryGraphG;
  const width = window.memoryGraphWidth;
  const height = window.memoryGraphHeight;

  // Transform data
  const nodes = graphData.nodes || [];
  const links = graphData.relationships || [];

  // Store for search
  memoryGraphData = { nodes, links };

  // Clear existing elements
  g.selectAll('*').remove();

  // Create links
  const link = g.append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(links)
    .enter().append('line')
    .attr('stroke', '#6366f1')
    .attr('stroke-opacity', 0.6)
    .attr('stroke-width', d => Math.sqrt(d.weight || 1) * 2)
    .attr('marker-end', 'url(#arrow)');

  // Create nodes
  const node = g.append('g')
    .attr('class', 'nodes')
    .selectAll('g')
    .data(nodes)
    .enter().append('g')
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended));

  // Add circles to nodes
  node.append('circle')
    .attr('r', d => 10 + (d.access_count || 0) / 10)
    .attr('fill', d => getNodeColor(d.type))
    .attr('stroke', '#1f2937')
    .attr('stroke-width', 2);

  // Add labels to nodes
  node.append('text')
    .text(d => d.content ? d.content.substring(0, 20) : d.node_id)
    .attr('x', 15)
    .attr('y', 5)
    .attr('font-size', '12px')
    .attr('fill', '#e5e7eb');

  // Add tooltips
  node.append('title')
    .text(d => `${d.type}\n${d.content || ''}\nAccess: ${d.access_count || 0}`);

  // Update simulation
  memorySimulation
    .nodes(nodes)
    .on('tick', ticked);

  memorySimulation.force('link')
    .links(links);

  memorySimulation.alpha(1).restart();

  function ticked() {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    node
      .attr('transform', d => `translate(${d.x},${d.y})`);
  }

  function dragstarted(event, d) {
    if (!event.active) memorySimulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) memorySimulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
}

function getNodeColor(type) {
  const colors = {
    'concept': '#6366f1',
    'entity': '#a855f7',
    'relationship': '#ec4899',
    'context': '#f59e0b',
    'fact': '#10b981',
    'default': '#6b7280'
  };
  return colors[type] || colors.default;
}

function setupMemorySearch() {
  const searchInput = document.getElementById('memorySearch');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    highlightNodes(query);
  });
}

function highlightNodes(query) {
  if (!window.memoryGraphG) return;

  const g = window.memoryGraphG;
  
  g.selectAll('.nodes circle')
    .attr('stroke', d => {
      if (!query) return '#1f2937';
      
      const content = (d.content || '').toLowerCase();
      const nodeId = (d.node_id || '').toLowerCase();
      const type = (d.type || '').toLowerCase();
      
      if (content.includes(query) || nodeId.includes(query) || type.includes(query)) {
        return '#fbbf24';
      }
      return '#1f2937';
    })
    .attr('stroke-width', d => {
      if (!query) return 2;
      
      const content = (d.content || '').toLowerCase();
      const nodeId = (d.node_id || '').toLowerCase();
      const type = (d.type || '').toLowerCase();
      
      if (content.includes(query) || nodeId.includes(query) || type.includes(query)) {
        return 4;
      }
      return 2;
    });
}

// Export for use in other modules
window.renderMemoryGraph = renderMemoryGraph;

// Made with Bob