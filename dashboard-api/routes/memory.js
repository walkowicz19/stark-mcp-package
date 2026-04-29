const express = require('express');
const router = express.Router();

// Get all memory nodes
router.get('/nodes', (req, res) => {
  try {
    const { db } = req.app.locals;
    const nodes = db.getAllMemoryNodes();
    
    res.json({
      success: true,
      data: nodes,
      count: nodes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get specific memory node
router.get('/nodes/:nodeId', (req, res) => {
  try {
    const { db } = req.app.locals;
    const node = db.getMemoryNode(req.params.nodeId);
    
    if (!node) {
      return res.status(404).json({
        success: false,
        error: 'Memory node not found'
      });
    }
    
    // Get relationships for this node
    const relationships = db.getMemoryRelationships(req.params.nodeId);
    
    // Increment access count
    db.incrementNodeAccess(req.params.nodeId);
    
    res.json({
      success: true,
      data: {
        ...node,
        relationships
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create or update memory node
router.post('/nodes', (req, res) => {
  try {
    const { db, broadcast } = req.app.locals;
    const { node_id, type, content, metadata } = req.body;
    
    // Validate required fields
    if (!node_id || !type || !content) {
      return res.status(400).json({
        success: false,
        error: 'node_id, type, and content are required'
      });
    }
    
    db.saveMemoryNode(node_id, type, content, metadata || {});
    
    // Broadcast update
    broadcast({
      type: 'memory_node_updated',
      data: {
        node_id,
        type,
        action: 'created'
      },
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'Memory node saved successfully',
      data: { node_id, type }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all relationships
router.get('/relationships', (req, res) => {
  try {
    const { db } = req.app.locals;
    const nodeId = req.query.node_id;
    
    const relationships = db.getMemoryRelationships(nodeId || null);
    
    res.json({
      success: true,
      data: relationships,
      count: relationships.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create relationship between nodes
router.post('/relationships', (req, res) => {
  try {
    const { db, broadcast } = req.app.locals;
    const { source_node_id, target_node_id, relationship_type, weight } = req.body;
    
    // Validate required fields
    if (!source_node_id || !target_node_id || !relationship_type) {
      return res.status(400).json({
        success: false,
        error: 'source_node_id, target_node_id, and relationship_type are required'
      });
    }
    
    // Check if nodes exist
    const sourceNode = db.getMemoryNode(source_node_id);
    const targetNode = db.getMemoryNode(target_node_id);
    
    if (!sourceNode || !targetNode) {
      return res.status(404).json({
        success: false,
        error: 'One or both nodes not found'
      });
    }
    
    db.saveMemoryRelationship(source_node_id, target_node_id, relationship_type, weight || 1.0);
    
    // Broadcast update
    broadcast({
      type: 'memory_relationship_created',
      data: {
        source_node_id,
        target_node_id,
        relationship_type
      },
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'Relationship created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get memory graph data (for visualization)
router.get('/graph', (req, res) => {
  try {
    const { db } = req.app.locals;
    
    const nodes = db.getAllMemoryNodes();
    const relationships = db.getMemoryRelationships();
    
    // Format for graph visualization
    const graphData = {
      nodes: nodes.map(node => ({
        id: node.node_id,
        node_id: node.node_id,
        label: node.type,
        type: node.type,
        content: node.content,
        access_count: node.access_count,
        created_at: node.created_at,
        updated_at: node.updated_at
      })),
      relationships: relationships.map(rel => ({
        source: rel.source_node_id,
        target: rel.target_node_id,
        source_node_id: rel.source_node_id,
        target_node_id: rel.target_node_id,
        relationship_type: rel.relationship_type,
        weight: rel.weight
      }))
    };
    
    res.json({
      success: true,
      ...graphData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Search memory nodes
router.get('/search', (req, res) => {
  try {
    const { db } = req.app.locals;
    const query = req.query.q;
    const type = req.query.type;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query (q) is required'
      });
    }
    
    let nodes = db.getAllMemoryNodes();
    
    // Filter by type if specified
    if (type) {
      nodes = nodes.filter(node => node.type === type);
    }
    
    // Search in content
    const searchResults = nodes.filter(node => 
      node.content.toLowerCase().includes(query.toLowerCase()) ||
      node.node_id.toLowerCase().includes(query.toLowerCase())
    );
    
    res.json({
      success: true,
      data: searchResults,
      count: searchResults.length,
      query
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get memory statistics
router.get('/stats', (req, res) => {
  try {
    const { db } = req.app.locals;
    
    const nodes = db.getAllMemoryNodes();
    const relationships = db.getMemoryRelationships();
    
    // Calculate statistics
    const typeCount = {};
    let totalAccessCount = 0;
    
    nodes.forEach(node => {
      typeCount[node.type] = (typeCount[node.type] || 0) + 1;
      totalAccessCount += node.access_count || 0;
    });
    
    const stats = {
      total_nodes: nodes.length,
      total_relationships: relationships.length,
      total_access: totalAccessCount,
      avg_access: nodes.length > 0 ? totalAccessCount / nodes.length : 0,
      nodes_by_type: typeCount,
      most_accessed: nodes
        .sort((a, b) => (b.access_count || 0) - (a.access_count || 0))
        .slice(0, 10)
        .map(node => ({
          node_id: node.node_id,
          type: node.type,
          access_count: node.access_count || 0
        }))
    };
    
    res.json({
      success: true,
      ...stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

// Made with Bob
