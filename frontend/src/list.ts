import { Link } from "./index";
export function loadAndRenderRepoList(nodeId: string, selectedNodes: string[] | undefined, links: Link[]): void {
    // 获取目标的列表容器元素
    const repoListContainer = document.getElementById('repo-list') as HTMLUListElement;
    if (!repoListContainer) return;
  
    // 清空当前列表内容
    repoListContainer.innerHTML = '';
    
    const headerItem = document.createElement('li');
    headerItem.classList.add('repo-header');
    headerItem.innerHTML = '<span>相关仓库</span><span>以及共同参与者数量</span>';
    repoListContainer.appendChild(headerItem);

    // 遍历 links 数组，动态生成每一项
    links.forEach(link => {
      const { source, target, weight } = link;
  
      // 判断该 link 是否与当前节点相关，假设 nodeId 是当前节点的 ID
      // 如果你想限制渲染仅与 selectedNodes 或 nodeId 相关的链接，可以做筛选
      if ( source == nodeId || target == nodeId) {
        // 创建列表项元素



        const repoItem = document.createElement('li');
        repoItem.classList.add('repo-item');
  
  
        // 创建 repo-name 和 repo-comm 元素
        const repoName = document.createElement('span');
        repoName.classList.add('repo-name');
        
        // 创建超链接元素
        const hlink = document.createElement('a');
        hlink.classList.add('repo-link'); // 可选：用于设置超链接的样式
        hlink.target = '_blank';  // 使链接在新窗口中打开
        hlink.href = source === nodeId ? `https://github.com/${target}` : `https://github.com/${source}`; // 根据源或目标设置链接
        hlink.textContent = source === nodeId ? `${target}` : `${source}`;
        
        // 将超链接包裹在 repoName 中
        repoName.appendChild(hlink);

        const repoComm = document.createElement('span');
        repoComm.classList.add('repo-comm');
        repoComm.textContent = `${weight}`;
  
        // 将两个元素添加到 repo-item 中
        repoItem.appendChild(repoName);
        repoItem.appendChild(repoComm);
  
        // 将生成的 repo-item 添加到 repo-list 中
        repoListContainer.appendChild(repoItem);
      }
    });
  }
  