# OSCommunityExplorer

本项目是关于GitHub仓库的开源社区检索与分析系统。以2024年OpenRank排名前一万的仓库为例，对仓库关联图进行动态力导向布局可视化展示，并以社区颜色标识属于不同社区的仓库的仓库，还包括节点交互、仓库洞察、子社区检索等功能。
[点击查看视频](复赛/系统演示视频.mp4)

开源项目往往天然存在社区结构，项目的不同部分由不同的开发者或团队负责，形成了基于任务、兴趣或技术栈的社群。以下是本项目的4个可能的适用场景：
- 用户需要想要快速探索GitHub的项目，发现其中仓库中的关联以及各个项目的分布情况。
- 对于仓库的维护和运营者，可以快速了解仓库自己仓库的生态群，同时提升对于组织关联仓库整体情况的感知。
- 对于想要探索一些自己感兴趣方向以及想对其他一些相关仓库作贡献的开发者来说，本项目可以帮助开发者快速找到目标。
- 对于主流开源项目群之间的关联情况会有直观地展示，通过图可视化快速定位到项目协作群，从而可以用社区的视角来洞察开源。

## 本地部署
前端部署
```bash
git clone https://github.com/l1tok/OSCommunityExplorer.git
cd frontend
yarn install
yarn run start
```
后端部署
```bash
cd backend
python app.py
```

## 部分效果展示
<img width="1919" alt="image" src="https://github.com/user-attachments/assets/550e5211-47ce-4ea9-8e3b-b2ae9553f272" />
<img width="1919" alt="image" src="https://github.com/user-attachments/assets/790038bd-8960-4d3b-9f53-83121950dac6" />
<img width="1917" alt="image" src="https://github.com/user-attachments/assets/b699c9bc-60b0-4732-977b-923e4457c32c" />
