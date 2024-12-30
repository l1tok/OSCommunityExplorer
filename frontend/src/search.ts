import { CosmosInputNode, CosmosInputLink, Graph } from '@cosmograph/cosmos';
// ./search/search.ts
import Fuse,{ FuseResult } from 'fuse.js';

interface SearchBoxConfig<N> {
  nodes: N[];
  container: HTMLElement;
  onSelect?: (node: N) => void;
  maxVisibleItems?: number;
}

export class SearchBox<N extends { id: string }> {
  private fuse: Fuse<N>;
  private input: HTMLInputElement;
  private list: HTMLUListElement;
  private config: SearchBoxConfig<N>;

  constructor(config: SearchBoxConfig<N>) {
    this.config = config;
    const { nodes, container, maxVisibleItems = 10 } = config;

    // 初始化 Fuse.js
    this.fuse = new Fuse(nodes, {
      keys: ['id'],
      threshold: 0.3, // 调整模糊度
    });

    // 创建输入框
    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.placeholder = '搜索节点...';
    this.input.classList.add('search-input');

    // 创建候选列表
    this.list = document.createElement('ul');
    this.list.classList.add('search-list');

    container.appendChild(this.input);
    container.appendChild(this.list);

    // 添加事件监听器
    this.input.addEventListener('input', this.onInput.bind(this));
    this.list.addEventListener('click', this.onListClick.bind(this));
    document.addEventListener('click', this.onDocumentClick.bind(this));
  }

  private onInput(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    if (value.length === 0) {
      this.list.innerHTML = '';
      return;
    }

    const results: FuseResult<N>[] = this.fuse.search(value).slice(0, this.config.maxVisibleItems);
    this.renderList(results.map((result: FuseResult<N>) => result.item));
  }

  private renderList(items: N[]) {
    this.list.innerHTML = '';
    items.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item.id;
      li.dataset.id = item.id;
      this.list.appendChild(li);
    });
  }

  private onListClick(e: Event) {
    const target = e.target as HTMLElement;
    if (target.tagName.toLowerCase() === 'li') {
      const nodeId = target.dataset.id;
      const node = this.config.nodes.find(n => n.id === nodeId);
      if (node) {
        if (this.config.onSelect) {
          this.config.onSelect(node);
        }
        this.list.innerHTML = '';
        this.input.value = '';
      }
    }
  }

  private onDocumentClick(e: Event) {
    if (!this.config.container.contains(e.target as Node)) {
      this.list.innerHTML = '';
    }
  }
}