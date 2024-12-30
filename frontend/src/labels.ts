import { LabelRenderer, LabelOptions } from "@interacta/css-labels";
import { CosmosInputNode, CosmosInputLink, Graph } from "@cosmograph/cosmos";

export class CosmosLabels<
  N extends CosmosInputNode,
  L extends CosmosInputLink
> {
  private labelRenderer: LabelRenderer;
  private labelRenderer1: LabelRenderer;
  private labelRenderer2: LabelRenderer;
  private labels: LabelOptions[] = new Array();
  private labels1: LabelOptions[] = new Array();
  private selectedNodeId: string | null = null;  // 记录选中的节点 ID

  constructor(div: HTMLDivElement, div1: HTMLDivElement, div2: HTMLDivElement) {
    this.labelRenderer = new LabelRenderer(div, {
      pointerEvents: "none", 
    });
    this.labelRenderer1 = new LabelRenderer(div1, {
      pointerEvents: "none", 
    });
    this.labelRenderer2 = new LabelRenderer(div2, {
      pointerEvents: "none", 
    });
  }

  update(graph: Graph<N, L>): void {
    // Get coordinates of the tracked nodes
    const trackedNodesPositions = graph.getTrackedNodePositionsMap();
    let index = 0;
    trackedNodesPositions.forEach((positions, nodeId) => {
      // Convert coordinates to the screen space
      const screenPosition = graph.spaceToScreenPosition([
        positions?.[0] ?? 0,
        positions?.[1] ?? 0
      ]);

      // Get the node radius and convert it to the screen space value in pixels
      const radius = graph.spaceToScreenRadius(
        graph.getNodeRadiusById(nodeId) as number
      );
      let opacity = 0.8;  // 默认为 0.8
      let filter = "none"; // 默认为无滤镜
      
      if(this.selectedNodeId !== null){
        opacity = 0.2;
        filter = "blur(2px)";  // 其他节点标签模糊          
      }

      // Set label properties
      this.labels[index] = {
        id: nodeId,
        text: nodeId,
        x: screenPosition[0],
        y: screenPosition[1] - (radius + 2),
        opacity: opacity,
        // style: `
        //   filter: filter,   // 使用 CSS filter 来应用模糊效果
        //   opacity: opacity, // 设置透明度
        //   // pointerEvents: "none", // 禁止标签干扰交互
        // `,
        // Style customization
        fontSize: 14,                      // Set font size
        color: '#FFFFFF',                  // Set font color (white)
        // fontWeight: 'bold',                // Make font bold
        // fontFamily: 'Arial',               // Set font family
        // backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black background
        // padding: '5px'                     // Padding around the label
      };

      index += 1;
    });
    // Pass labels configuration to the renderer and draw them
    this.labelRenderer.setLabels(this.labels);
    this.labelRenderer.draw(true);

    // 确保选中节点的标签不被模糊
    this.update1(graph);
  }
  update1(graph: Graph<N, L>): void {
    if(this.selectedNodeId != null){
      const nodeId = this.selectedNodeId;
      const trackedNodesPositions = graph.getTrackedNodePositionsMap();
      const nodePosition =  trackedNodesPositions.get(nodeId);
      const screenPosition = graph.spaceToScreenPosition([
        nodePosition?.[0] ?? 0,
        nodePosition?.[1] ?? 0
      ]);
      const radius = graph.spaceToScreenRadius(
        graph.getNodeRadiusById(nodeId) as number
      );
      this.labels1[0] = {
        id: nodeId,
        text: nodeId,
        x: screenPosition[0],
        y: screenPosition[1] - (radius + 2),
        opacity: 1,
        // style: {
        //   filter: "none",   // 使用 CSS filter 来应用模糊效果
        //   opacity: 1, // 设置透明度
        //   pointerEvents: "none", // 禁止标签干扰交互
        //   zIndex: "100" // 确保选中的标签在最上层
        // },
        // Style customization
        fontSize: 14,                      // Set font size
        color: '#FFFFFF',                  // Set font color (white)
        // fontWeight: 'bold',                // Make font bold
        // fontFamily: 'Arial',               // Set font family
        // backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black background
        // padding: '5px'                     // Padding around the label
      };
      this.labelRenderer1.setLabels(this.labels1);
      this.labelRenderer1.draw(true);
    } else {
      this.labels1 = new Array();
      this.labelRenderer1.setLabels(this.labels1);
    }
  }
  
  update3(graph: Graph<N, L>, nodeId: string, isMouseOver: boolean): void {
    if(isMouseOver === true && nodeId != this.selectedNodeId){
      const trackedNodesPositions = graph.getTrackedNodePositionsMap();
      const nodePosition =  trackedNodesPositions.get(nodeId);
      const screenPosition = graph.spaceToScreenPosition([
        nodePosition?.[0] ?? 0,
        nodePosition?.[1] ?? 0
      ]);
      const radius = graph.spaceToScreenRadius(
        graph.getNodeRadiusById(nodeId) as number
      );
      this.labelRenderer2.setLabels([{
        id: nodeId,
        text: nodeId,
        x: screenPosition[0],
        y: screenPosition[1] - (radius + 2),
        opacity: 1,
        // Style customization
        fontSize: 14,                      // Set font size
        color: '#FFFFFF',                  // Set font color (white)
      }]);
      this.labelRenderer2.draw(true);
    } else {
      this.labelRenderer2.setLabels(new Array());
    }
  }
  // 设置选中的节点 
  setSelectedNode(nodeId: string | null) {
    this.selectedNodeId = nodeId;
  }
}
