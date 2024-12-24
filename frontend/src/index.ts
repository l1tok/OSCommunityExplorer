// main.ts
import "./styles.css";
import { Graph, GraphConfigInterface } from "@cosmograph/cosmos";
import { CosmosLabels } from "./labels";
import { SearchBox } from './search'; // 根据实际路径调整
import { updateChartData } from './chart';
import { fetchTableData } from './table';
import { loadAndRenderRepoList } from './list';

// 节点和链接类型定义
export type Node = {
  id: string;
  color?: string; // 节点颜色
};

export type Link = {
  source: string;
  target: string;
  weight: string;
  color?: string; // 链接颜色
};

const links: Link[] = [];
const nodes: Node[] = [];
const n = 2708; // 节点总数

// 获取 DOM 元素
const div = document.querySelector("#labels") as HTMLDivElement;
const div1 = document.querySelector("#labelsSelected") as HTMLDivElement;
const div2 = document.querySelector("#labelsHovered") as HTMLDivElement;
const cosmosLabels = new CosmosLabels<Node, Link>(div, div1, div2);
const analysisOptions = document.getElementById('analysis-options') as HTMLSelectElement;

// 获取 canvas 元素并初始化 Graph
const canvas = document.querySelector("canvas") as HTMLCanvasElement;
let graph: Graph<Node, Link>;  // 在外部定义，确保可在整个文件内访问
let isNodeClicked = false;
let isNodeOvered = false;
let overNodeId = "";
let currentNodeId: string | null = null;

const sidebar = document.getElementById('sidebar');
const toggleSidebar = document.getElementById('toggle-sidebar');


// 点击箭头按钮切换侧边栏显示与隐藏
toggleSidebar?.addEventListener('click', () => {
  if(sidebar != null){
    if (sidebar.style.display === 'none' || sidebar.classList.contains('hidden')) {
      sidebar.style.display = 'block'; // 显示侧边栏
      sidebar.classList.remove('hidden');
    } else {
      sidebar.style.display = 'none'; // 隐藏侧边栏
      sidebar.classList.add('hidden');
    }
  }
});
function handleNodeCheck(node: Node | undefined, i: number | undefined) {
  if (node) {
    let selected_nodes: string[] | undefined;
    
    if(analysisOptions.value == '1-hop') {
      if(i!= undefined){
        graph.selectNodeByIndex(i, true);
        graph.zoomToNodeByIndex(i);
      }
      selected_nodes = graph.getAdjacentNodes(node.id)?.map(node => node.id)
      selected_nodes?.push(node.id);
      
    }
    else {
      fetch(`http://127.0.0.1:5000/api/${analysisOptions.value}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          node_id: node.id,
          k: null }),
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        selected_nodes = data;
        graph.selectNodesByIds(data.nodes); //data.edges
      })
      .catch((error) => console.error("Error:", error));
    }
    loadAndRenderRepoList(node.id, selected_nodes, links);
    currentNodeId = node.id;
    cosmosLabels.setSelectedNode(node.id);
    const repositoryIcon = document.getElementById('repositoryIcon') as HTMLImageElement;
    const repositoryName = document.getElementById('repositoryName');
    const repositoryLink = document.getElementById('repositoryLink') as HTMLAnchorElement;
    if(repositoryIcon != null){
      repositoryIcon.src = '';
      repositoryIcon.src = `https://avatars.githubusercontent.com/${node.id.split('/')[0]}`;
    }
    if (repositoryName) {
      repositoryName.textContent = node.id;
      repositoryName.addEventListener('click', function () {
      });
    }
    if(repositoryLink) {
      console.log( `https://github.com/${node.id}`);
      repositoryLink.href = `https://github.com/${node.id}`; 
    }
    updateChartData(node.id);

    // 显示侧边栏
    if(sidebar != null){
          // 显示侧边栏
      sidebar.classList.add('visible');
      sidebar.style.display = 'block';
    }
    fetchTableData(node.id, 11);
  } 
}
const config: GraphConfigInterface<Node, Link> = {
  backgroundColor: "#151515",
  nodeSize: 6,
  nodeColor: (node) => node.color || "#4B5BBF",  // 使用节点的颜色
  nodeGreyoutOpacity: 0.2,
  linkWidth: 0.07,
  linkColor: "#5F74C2",
  // linkColor: 'rgb(255, 255, 255)',
  linkArrows: false,
  linkGreyoutOpacity: 0,
  curvedLinks: false,
  renderHoveredNodeRing: true,
  hoveredNodeRingColor: 'rgb(225, 231, 255)',
  simulation: {
    linkDistance: 10, //边的最小距离，设置为 10，控制边的长度。
    linkSpring: 0.05,  //边的弹性系数，设置为 1，控制边在模拟中返回到原始长度的强度。
    repulsion: 1, //0.5，排斥力系数，较小的值表示节点间的排斥力较弱
    gravity: 0.05, // 引力系数，设置为 0.1，使节点聚拢的力较弱
    decay: 100000,
    onTick: () => {
      if (graph) {
        cosmosLabels.update(graph);  // 更新第一个标签
        if(isNodeOvered){
          cosmosLabels.update3(graph, overNodeId, isNodeOvered); // 更新第二个标签
        }
      }
    }
  },
  events: {
    onClick: (node, i, pos, event) => {
      if (node && i !== undefined) {
        isNodeClicked = true;
        handleNodeCheck(node, i);
        cosmosLabels.update(graph);
      } else {
        graph.unselectNodes();
        cosmosLabels.setSelectedNode(null);
        cosmosLabels.update(graph);
        isNodeClicked = false;
      }
      console.log("Clicked node: ", node);
    },
    onNodeMouseOver: (node, i, pos, event) => {
      if (node && i !== undefined) {
        isNodeOvered = true;
        overNodeId = node.id;
        cosmosLabels.update3(graph, overNodeId, isNodeOvered);
      }
    },
    onNodeMouseOut: () => {
      isNodeOvered = false;
      overNodeId = "";
      cosmosLabels.update3(graph, overNodeId, isNodeOvered);
    },
    // onZoom: () => graph && cosmosLabels.update(graph)
    onZoom: () => {
      if (graph) {
        cosmosLabels.update(graph);  // 更新第一个标签
        if(isNodeOvered){
          cosmosLabels.update3(graph, overNodeId, isNodeOvered); // 更新第二个标签
        }
      }
    }
  }
};

const nodeNames: string[] = [];

// 加载标签数据
fetch('http://127.0.0.1:5000/api/get-repos')
  .then(response => response.json())
  .then(data => {
    // 创建节点
    for (let i = 0; i < data.repo_list.length; i++) {
      const nodeId = data.repo_list[i];
      nodes.push({ id: nodeId});
      nodeNames.push(nodeId);
    }

    // 根据标签为每个节点设置颜色
    nodes.forEach(node => {
      const color = data.color_mapping[node.id];   // 根据标签选择颜色
      node.color = color;  // 设置节点颜色
    });

    // 加载图数据并初始化图表
    fetch('http://127.0.0.1:5000/api/get-edges')
      .then(response => response.json())
      .then(data => {
        for (let i = 0; i < data.length; i++) {
          const item = data[i];  // 获取当前项
          links.push({ source: `${item.repo1}`, target: `${item.repo2}` , weight:`${item.weight}`});
        }

        // 初始化图表
        graph = new Graph(canvas, config);
        graph.setData(nodes, links);

        // 初始化 SearchBox
        const searchContainer = document.getElementById("search") as HTMLElement;
        const searchBox = new SearchBox<Node>({
          nodes,
          container: searchContainer,
          onSelect: (node) => {
            handleNodeCheck(node, undefined);
            console.log("Selected node:", node);
            graph.zoomToNodeById(node.id);
            graph.selectNodeById(node.id, true);
            cosmosLabels.setSelectedNode(node.id);
            cosmosLabels.update(graph);
          },
          maxVisibleItems: 20,
        });

        graph.zoom(0.9);
        graph.fitView();
        graph.trackNodePositionsByIds(nodeNames);
      })
      .catch(err => console.error('Error loading graph data:', err));
  })
  .catch(err => console.error('Error loading labels:', err));

/* ~ Demo Actions ~ */
// Start / Pause
let isPaused = false;

function pause() {
  isPaused = true;
  graph.pause();
}

function start() {
  isPaused = false;
  graph.start();
}

// Zoom and Select
function getRandomNodeId() {
  return nodes[Math.floor(Math.random() * nodes.length)].id;
}

function getRandomInRange([min, max]: [number, number]): number {
  return Math.random() * (max - min) + min;
}

function fitView() {
  graph.fitView();
}

function zoomIn() {
  const nodeId = getRandomNodeId();
  graph.zoomToNodeById(nodeId);
  graph.selectNodeById(nodeId);
  pause();
}

function selectPointsInArea() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const left = getRandomInRange([w / 4, w / 2]);
  const right = getRandomInRange([left, (w * 3) / 4]);
  const top = getRandomInRange([h / 4, h / 2]);
  const bottom = getRandomInRange([top, (h * 3) / 4]);
  pause();
  graph.selectNodesInRange([
    [left, top],
    [right, bottom]
  ]);
}

const toggleLabels = document.getElementById('toggleLabels') as HTMLInputElement;
const labels = document.getElementById('labels');

// 初始化标签显示状态（假设默认显示）
if (labels) {
  labels.style.display = toggleLabels.checked ? 'block' : 'none';
}

// 监听开关按钮的变化事件
toggleLabels.addEventListener('change', () => {
  if (labels) {
    labels.style.display = toggleLabels.checked ? 'block' : 'none';
  }
});

document.getElementById('playPause')?.addEventListener('click', function () {
  const button = this;
  const label = button.querySelector('.label');

  // 切换状态
  if(label!=null){
    if (button.classList.contains('paused')) {
      button.classList.remove('paused');
      label.textContent = 'Pause';
      start(); 
    } else {
      button.classList.add('paused');
      label.textContent = 'Play';
      pause()
    }
  }
});

document.getElementById("fit-view")?.addEventListener("click", fitView);
document.getElementById("zoom")?.addEventListener("click", zoomIn);

document
  .getElementById("select-points-in-area")
  ?.addEventListener("click", selectPointsInArea);


const monthSelect = document.getElementById('month-select') as HTMLSelectElement;
monthSelect.addEventListener('change', () => {
  const selectedMonth = parseInt(monthSelect.value, 10);
  if (currentNodeId) {
    // 发起请求
    fetchTableData(currentNodeId, selectedMonth);  
  }

});