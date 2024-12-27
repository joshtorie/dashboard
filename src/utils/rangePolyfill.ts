// Safely wrap Range.selectNode to handle cases where node has no parent
const originalSelectNode = Range.prototype.selectNode;
Range.prototype.selectNode = function(node: Node) {
  try {
    if (node && node.parentNode) {
      return originalSelectNode.call(this, node);
    }
  } catch (e) {
    console.warn('Failed to select node:', e);
  }
};

export {};
