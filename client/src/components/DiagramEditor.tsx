import { useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import Palette from './Palette';
import { initJointGraph } from '@/utils/joint';
import * as joint from 'jointjs';

export default function DiagramEditor() {
  const { 
    currentDiagram, 
    selectedElement, 
    setSelectedElement,
    currentView
  } = useAppStore();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  
  useEffect(() => {
    if (containerRef.current && !graphRef.current) {
      const { graph, paper } = initJointGraph(containerRef.current);
      graphRef.current = { graph, paper };
      
      // Example: Add event listeners for element selection
      paper.on('element:pointerclick', (elementView: any) => {
        const element = elementView.model;
        const id = element.id;
        const name = element.attr('text/text');
        const type = element.get('type') || 'block';
        
        setSelectedElement({
          id,
          name,
          type,
          stereotype: 'block',
          description: 'The main system component that contains subsystems.',
        });
      });
    }
    
    return () => {
      if (graphRef.current) {
        // Clean up as needed
      }
    };
  }, []);
  
  // Create a mock diagram with sample data for demonstration
  useEffect(() => {
    if (graphRef.current && !currentDiagram) {
      const { graph } = graphRef.current;
      
      // This would normally come from an API or store
      // Setting up a basic example diagram
      
      // Create the system block
      const system = createBlockElement(graph, 'System', 200, 100);
      
      // Create the subsystem block
      const subsystem = createBlockElement(graph, 'Subsystem', 100, 250);
      
      // Create the component block
      const component = createBlockElement(graph, 'Component', 300, 250);
      
      // Create the composition relationship
      createRelationship(graph, system, subsystem, 'composition', 'contains');
      
      // Create the aggregation relationship
      createRelationship(graph, system, component, 'aggregation', 'has');
    }
  }, [graphRef.current]);
  
  // Helper function to create a block element
  const createBlockElement = (graph: any, name: string, x: number, y: number) => {
    const block = new joint.shapes.standard.Rectangle({
      position: { x, y },
      size: { width: 120, height: 80 },
      attrs: {
        body: {
          fill: '#ffffff',
          stroke: '#616161',
          strokeWidth: 1.5,
          rx: 4,
          ry: 4
        },
        label: {
          text: name,
          fill: '#212121',
          fontSize: 14,
          fontWeight: 500,
          fontFamily: 'Roboto',
          textVerticalAnchor: 'middle',
          textAnchor: 'middle',
          refY: 0.6
        }
      }
    });
    
    // Add the stereotype text
    block.attr({
      stereotype: {
        text: '«block»',
        fill: '#212121',
        fontSize: 14,
        fontFamily: 'Roboto',
        textVerticalAnchor: 'middle',
        textAnchor: 'middle',
        refY: 0.3
      }
    });
    
    graph.addCell(block);
    return block;
  };
  
  // Helper function to create a relationship between elements
  const createRelationship = (graph: any, source: any, target: any, type: string, label: string) => {
    let link;
    
    if (type === 'composition') {
      link = new joint.shapes.standard.Link({
        source: { id: source.id },
        target: { id: target.id },
        attrs: {
          line: {
            stroke: '#616161',
            strokeWidth: 1.5,
            targetMarker: {
              type: 'path',
              d: 'M 10 0 L 0 5 L 10 10 z',
              fill: '#616161'
            }
          }
        },
        labels: [
          {
            position: 0.5,
            attrs: {
              text: {
                text: label,
                fill: '#616161',
                fontSize: 12,
                fontFamily: 'Roboto',
                textAnchor: 'middle'
              }
            }
          }
        ]
      });
      
      // Add the filled circle to represent composition
      const sourcePoint = source.getBBox().bottomMiddle();
      link.source(source);
      link.target(target);
      
      // Create a circle at the start of the link
      const circle = new joint.shapes.standard.Circle({
        position: { 
          x: sourcePoint.x - 6, 
          y: sourcePoint.y - 6 
        },
        size: { width: 12, height: 12 },
        attrs: {
          body: {
            fill: '#212121',
            stroke: 'none'
          }
        },
        z: 2 // Ensure it's above the link
      });
      
      graph.addCell(circle);
    } else if (type === 'aggregation') {
      link = new joint.shapes.standard.Link({
        source: { id: source.id },
        target: { id: target.id },
        attrs: {
          line: {
            stroke: '#616161',
            strokeWidth: 1.5,
            targetMarker: {
              type: 'path',
              d: 'M 10 0 L 0 5 L 10 10 z',
              fill: '#616161'
            }
          }
        },
        labels: [
          {
            position: 0.5,
            attrs: {
              text: {
                text: label,
                fill: '#616161',
                fontSize: 12,
                fontFamily: 'Roboto',
                textAnchor: 'middle'
              }
            }
          }
        ]
      });
      
      // Add a diamond to represent aggregation
      const sourcePoint = source.getBBox().bottomMiddle();
      
      // Create a diamond at the start of the link
      const diamond = new joint.shapes.standard.Polygon({
        position: { 
          x: sourcePoint.x - 12, 
          y: sourcePoint.y - 12 
        },
        size: { width: 24, height: 24 },
        attrs: {
          body: {
            fill: '#ffffff',
            stroke: '#616161',
            strokeWidth: 1.5,
            points: '12,0 24,12 12,24 0,12'
          }
        },
        z: 2 // Ensure it's above the link
      });
      
      graph.addCell(diamond);
    }
    
    if (link) {
      graph.addCell(link);
    }
    
    return link;
  };
  
  return (
    <div className="flex-1 bg-white p-4 overflow-auto">
      <div 
        ref={containerRef} 
        className="border border-neutral-300 rounded-lg bg-neutral-50 h-full flex items-center justify-center relative"
      >
        {/* The JointJS paper will be rendered here */}
        <Palette />
      </div>
    </div>
  );
}
