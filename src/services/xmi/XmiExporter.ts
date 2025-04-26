import { SysMLModel } from '../../store/sysmlStore';
import { BlockDefinition, PortDefinition, AttributeDefinition, ConnectionDefinition } from '../../model';

/**
 * XMI形式でモデルをエクスポートするクラス
 */
export class XmiExporter {
  /**
   * モデルをXML形式に変換する
   * @param model エクスポートするモデル
   * @returns XML文字列
   */
  exportToXmi(model: SysMLModel): string {
    // XMLヘッダーとルート要素
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<xmi:XMI xmlns:xmi="http://www.omg.org/spec/XMI/20131001" xmlns:sysml="http://www.omg.org/spec/SysML/20230201" xmlns:uml="http://www.omg.org/spec/UML/20161101" xmi:version="2.5.1">\n';
    
    // モデル情報
    xml += `  <sysml:Model xmi:id="${model.id}" name="${this.escapeXml(model.name)}">\n`;
    
    // パッケージ構造
    xml += '    <packagedElement xmi:type="sysml:Package" xmi:id="root_package" name="RootPackage">\n';
    
    // ブロック定義
    xml += this.exportBlocks(model.blocks);
    
    // 接続定義
    xml += this.exportConnections(model.connections);
    
    // ダイアグラム情報
    xml += this.exportDiagrams(model.diagrams);
    
    // パッケージ終了
    xml += '    </packagedElement>\n';
    
    // モデル終了
    xml += '  </sysml:Model>\n';
    
    // XMI終了
    xml += '</xmi:XMI>';
    
    return xml;
  }
  
  /**
   * ブロック定義をXML形式に変換する
   * @param blocks ブロック定義のリスト
   * @returns XML文字列
   */
  private exportBlocks(blocks: BlockDefinition[]): string {
    let xml = '';
    
    blocks.forEach(block => {
      xml += `      <packagedElement xmi:type="sysml:Block" xmi:id="${block.id}" name="${this.escapeXml(block.name)}"`;
      
      if (block.stereotype) {
        xml += ` stereotype="${this.escapeXml(block.stereotype)}"`;
      }
      
      if (block.isAbstract) {
        xml += ' isAbstract="true"';
      }
      
      xml += '>\n';
      
      // 属性をエクスポート
      if (block.attributes.length > 0) {
        xml += this.exportAttributes(block.attributes);
      }
      
      // ポートをエクスポート
      if (block.ports.length > 0) {
        xml += this.exportPorts(block.ports);
      }
      
      xml += '      </packagedElement>\n';
    });
    
    return xml;
  }
  
  /**
   * 属性をXML形式に変換する
   * @param attributes 属性リスト
   * @returns XML文字列
   */
  private exportAttributes(attributes: AttributeDefinition[]): string {
    let xml = '';
    
    attributes.forEach(attr => {
      xml += `        <ownedAttribute xmi:type="sysml:Property" xmi:id="${attr.id}" name="${this.escapeXml(attr.name)}" type="${this.escapeXml(attr.typeName)}"`;
      
      if (attr.multiplicity) {
        xml += ` multiplicity="${this.escapeXml(attr.multiplicity)}"`;
      }
      
      if (attr.isReadOnly) {
        xml += ' isReadOnly="true"';
      }
      
      if (attr.isDerived) {
        xml += ' isDerived="true"';
      }
      
      if (attr.defaultValue !== undefined) {
        xml += '>\n';
        xml += `          <defaultValue xmi:type="sysml:LiteralValue" value="${this.escapeXml(String(attr.defaultValue))}"/>\n`;
        xml += '        </ownedAttribute>\n';
      } else {
        xml += '/>\n';
      }
    });
    
    return xml;
  }
  
  /**
   * ポートをXML形式に変換する
   * @param ports ポートリスト
   * @returns XML文字列
   */
  private exportPorts(ports: PortDefinition[]): string {
    let xml = '';
    
    ports.forEach(port => {
      xml += `        <ownedPort xmi:type="sysml:Port" xmi:id="${port.id}" name="${this.escapeXml(port.name)}" type="${this.escapeXml(port.typeName)}"`;
      
      if (port.direction) {
        xml += ` direction="${port.direction}"`;
      }
      
      if (port.isConjugated) {
        xml += ' isConjugated="true"';
      }
      
      if (port.isBehavior) {
        xml += ' isBehavior="true"';
      }
      
      xml += '/>\n';
    });
    
    return xml;
  }
  
  /**
   * 接続をXML形式に変換する
   * @param connections 接続リスト
   * @returns XML文字列
   */
  private exportConnections(connections: ConnectionDefinition[]): string {
    let xml = '';
    
    connections.forEach(conn => {
      xml += `      <packagedElement xmi:type="sysml:Connector" xmi:id="${conn.id}" name="${this.escapeXml(conn.name || '')}"`;
      
      if (conn.stereotype) {
        xml += ` stereotype="${this.escapeXml(conn.stereotype)}"`;
      }
      
      xml += '>\n';
      
      // 接続端点
      xml += `        <end xmi:type="sysml:ConnectorEnd" xmi:id="${conn.id}_source" role="${conn.sourcePortId}"/>\n`;
      xml += `        <end xmi:type="sysml:ConnectorEnd" xmi:id="${conn.id}_target" role="${conn.targetPortId}"/>\n`;
      
      // アイテムフロー
      if (conn.itemType) {
        xml += `        <conveyed xmi:type="sysml:ItemFlow" xmi:id="${conn.id}_flow" itemType="${this.escapeXml(conn.itemType)}"/>\n`;
      }
      
      xml += '      </packagedElement>\n';
    });
    
    return xml;
  }
  
  /**
   * ダイアグラム情報をXML形式に変換する
   * @param diagrams ダイアグラムリスト
   * @returns XML文字列
   */
  private exportDiagrams(diagrams: any[]): string {
    let xml = '';
    
    // ダイアグラム情報の開始
    xml += '    <notation:Diagrams xmlns:notation="http://www.eclipse.org/gmf/runtime/1.0.3/notation">\n';
    
    diagrams.forEach(diagram => {
      xml += `      <notation:Diagram xmi:id="${diagram.id}" name="${this.escapeXml(diagram.name)}" type="${diagram.type}">\n`;
      
      // ノード (要素) の情報
      diagram.elements.forEach((element: any) => {
        xml += `        <children xmi:type="notation:Shape" xmi:id="${element.id}_view" element="${element.id}"`;
        if (element.position) {
          xml += ` position="${element.position.x},${element.position.y}"`;
        }
        if (element.size) {
          xml += ` size="${element.size.width},${element.size.height}"`;
        }
        xml += '/>\n';
      });
      
      // エッジ (関係) の情報
      diagram.relationships.forEach((rel: any) => {
        xml += `        <edges xmi:type="notation:Connector" xmi:id="${rel.id}_view" element="${rel.id}" source="${rel.sourceId}_view" target="${rel.targetId}_view"`;
        if (rel.vertices && rel.vertices.length > 0) {
          xml += '>\n';
          xml += '          <bendpoints>\n';
          rel.vertices.forEach((vertex: any, index: number) => {
            xml += `            <point xmi:id="${rel.id}_bp${index}" x="${vertex.x}" y="${vertex.y}"/>\n`;
          });
          xml += '          </bendpoints>\n';
          xml += '        </edges>\n';
        } else {
          xml += '/>\n';
        }
      });
      
      xml += '      </notation:Diagram>\n';
    });
    
    // ダイアグラム情報の終了
    xml += '    </notation:Diagrams>\n';
    
    return xml;
  }
  
  /**
   * XML文字列をエスケープする
   * @param str エスケープする文字列
   * @returns エスケープされた文字列
   */
  private escapeXml(str: string): string {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}