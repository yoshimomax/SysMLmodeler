// This file contains utilities for working with JointJS
import * as joint from 'jointjs';

// Initialize a JointJS graph and paper
export function initJointGraph(container: HTMLElement) {
  // Create a JointJS graph
  const graph = new joint.dia.Graph();
  
  // Create a JointJS paper
  const paper = new joint.dia.Paper({
    el: container,
    model: graph,
    width: '100%',
    height: '100%',
    gridSize: 10,
    drawGrid: true,
    background: {
      color: '#f5f5f5',
    },
    interactive: true,
    defaultAnchor: { name: 'center' },
    defaultConnectionPoint: { name: 'boundary' },
    validateConnection: function(cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
      // Prevent linking to itself
      if (cellViewS === cellViewT) return false;
      
      // Prevent linking to a link
      if (cellViewT.model.isLink()) return false;
      
      return true;
    }
  });
  
  // Add panning functionality
  paper.on('blank:pointerdown', function(evt, x, y) {
    const scale = paper.scale();
    
    paper.on('cell:pointerup blank:pointerup', function() {
      paper.off('cell:pointermove blank:pointermove');
      paper.off('cell:pointerup blank:pointerup');
    });
    
    paper.on('cell:pointermove blank:pointermove', function(evt, x, y) {
      const currentScale = paper.scale();
      paper.translate(
        evt.offsetX - x * currentScale.sx,
        evt.offsetY - y * currentScale.sy
      );
    });
  });
  
  // Add zoom functionality
  container.addEventListener('mousewheel', function(evt: any) {
    if (evt.ctrlKey) {
      evt.preventDefault();
      const delta = evt.wheelDelta || -evt.detail;
      const currentScale = paper.scale();
      let newScale = delta > 0 
        ? { sx: currentScale.sx * 1.1, sy: currentScale.sy * 1.1 } 
        : { sx: currentScale.sx / 1.1, sy: currentScale.sy / 1.1 };
      
      // Set bounds for minimum and maximum zoom
      newScale.sx = Math.max(0.2, Math.min(3, newScale.sx));
      newScale.sy = Math.max(0.2, Math.min(3, newScale.sy));
      
      paper.scale(newScale.sx, newScale.sy);
    }
  });
  
  return { graph, paper };
}

// Create a SysML block
export function createSysMLBlock(graph: any, name: string, x: number, y: number, options = {}) {
  const block = new joint.shapes.standard.Rectangle({
    position: { x, y },
    size: { width: 150, height: 100 },
    attrs: {
      body: {
        fill: '#ffffff',
        stroke: '#333333',
        strokeWidth: 2,
        rx: 5,
        ry: 5
      },
      label: {
        text: name,
        fill: '#333333',
        fontSize: 14,
        fontWeight: 'bold',
        refY: '60%',
        textAnchor: 'middle',
        textVerticalAnchor: 'middle'
      },
      stereotype: {
        text: '«block»',
        fill: '#666666',
        fontSize: 12,
        refY: '30%',
        textAnchor: 'middle',
        textVerticalAnchor: 'middle'
      }
    },
    ...options
  });
  
  graph.addCell(block);
  return block;
}

// Create a SysML relationship
export function createSysMLRelationship(graph: any, source: any, target: any, type: string, label = '') {
  let linkOptions = {
    source: { id: source.id },
    target: { id: target.id },
    attrs: {
      line: {
        stroke: '#333333',
        strokeWidth: 2,
        targetMarker: {
          type: 'path',
          d: 'M 10 -5 0 0 10 5 z'
        }
      }
    },
    labels: [{
      position: 0.5,
      attrs: {
        text: {
          text: label,
          fill: '#333333',
          fontSize: 12
        }
      }
    }]
  };
  
  // Customize the link based on the relationship type
  switch (type) {
    case 'composition':
      linkOptions.attrs.line.sourceMarker = {
        type: 'circle',
        fill: '#333333',
        r: 5
      };
      break;
    case 'aggregation':
      linkOptions.attrs.line.sourceMarker = {
        type: 'path',
        d: 'M 10 -5 0 0 10 5 20 0 z',
        fill: '#ffffff',
        stroke: '#333333'
      };
      break;
    case 'inheritance':
      linkOptions.attrs.line.targetMarker = {
        type: 'path',
        d: 'M 10 -5 0 0 10 5 z',
        fill: '#ffffff',
        stroke: '#333333'
      };
      break;
  }
  
  const link = new joint.shapes.standard.Link(linkOptions);
  graph.addCell(link);
  return link;
}
