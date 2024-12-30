import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// 注册必要的组件
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler
);

// 获取 canvas 元素
const ctx = document.getElementById('activityChart') as HTMLCanvasElement;
if (!ctx) {
  console.error('Canvas element with id "activityChart" not found.');
  throw new Error('Canvas element not found.');
}

// 初始化图表
export const myChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'], // X轴月份
    datasets: [
      {
        label: '2024 Monthly OpenRank',
        data: Array(11).fill(0), // 初始OpenRank数据
        borderColor: 'rgba(86, 117, 255, 1)', // 明亮的蓝色
        backgroundColor: 'rgba(76, 110, 245, 0.2)', // 背景色：浅蓝色填充
        fill: true, // 开启填充
        tension: 0.4, // 平滑曲线
        pointBorderColor: 'rgba(86, 117, 255, 1)', // 数据点边框颜色：亮蓝色
        pointBackgroundColor: '#ffffff', // 数据点填充颜色：白色
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        yAxisID: 'y',
      },
      {
        label: '2024 Monthly Activity', // 活跃度变化折线
        data: Array(11).fill(0), // 初始Activity数据
        borderColor: 'rgba(255, 92, 92, 1)', // 明亮的红色
        backgroundColor: 'rgba(255, 107, 107, 0.2)', // 背景色：浅红色填充
        fill: true, // 开启填充
        tension: 0.4, // 平滑曲线
        pointBorderColor: 'rgba(255, 92, 92, 1)', // 数据点边框颜色：亮红色
        pointBackgroundColor: '#ffffff', // 数据点填充颜色：白色
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        yAxisID: 'y1', // 将Activity数据绑定到右侧纵轴
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // 提示框背景色：深色
        titleFont: { size: 14, weight: 'bold'  }, 
        titleColor: '#ffffff',// 字体颜色：白色
        bodyFont: { size: 12 }, // 字体颜色：白色
        bodyColor: '#ffffff',
        padding: 10,
        cornerRadius: 5,
      },
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#ffffff', // 标签文字颜色：白色
          font: { size: 12 },
          usePointStyle: true,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Month',
          color: '#ffffff', // X轴标题颜色：白色
          font: { size: 14, weight: 'bold' },
        },
        ticks: {
          color: '#cccccc', // 刻度颜色：浅灰色
          font: { size: 12 },
        },
        grid: {
          display: false, // 不显示网格线
        },
      },
      y: {
        type: 'linear',
        position: 'left', // 左侧纵坐标
        title: {
          display: true,
          text: 'OpenRank',
          color: 'rgb(96, 103, 141)', // 左侧纵坐标标题颜色：亮蓝色
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        ticks: {
          color: 'rgb(103, 113, 142)', // 刻度颜色：亮蓝色
        },
        grid: {
          color: 'rgba(200, 200, 200, 0.1)', // 网格线颜色：浅灰色
        },
      },
      y1: {
        type: 'linear',
        position: 'right', // 右侧纵坐标
        title: {
          display: true,
          text: 'Activity',
          color: 'rgb(173, 127, 127)', // 右侧纵坐标标题颜色：亮红色
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        ticks: {
          color: 'rgb(173, 127, 127)', // 刻度颜色：亮红色
        },
        grid: {
          drawOnChartArea: false, // 不绘制右侧纵坐标的网格线
        },
      },
    },
  },
});

// 定义 fetchActivityData 函数
export async function fetchActivityData(repoName: string): Promise<number[]> {
  const apiUrl = `https://oss.open-digger.cn/github/${repoName}/activity.json`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch activity data for repository: ${repoName}`);
    }

    const data = await response.json();

    const months = [
      '2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06',
      '2024-07', '2024-08', '2024-09', '2024-10', '2024-11',
    ];

    return months.map((month) => data[month] || 0); // 如果某个月没有数据，返回 0
  } catch (error) {
    console.error(`Error fetching activity data for ${repoName}:`, error);
    return Array(11).fill(0); // 返回一个全为 0 的数组
  }
}

// 定义 fetchChartData 函数
export async function fetchChartData(repoName: string): Promise<number[]> {
  const apiUrl = `https://oss.open-digger.cn/github/${repoName}/openrank.json`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch OpenRank data for repository: ${repoName}`);
    }

    const data = await response.json();

    const months = [
      '2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06',
      '2024-07', '2024-08', '2024-09', '2024-10', '2024-11',
    ];

    return months.map((month) => data[month] || 0); // 如果某个月没有数据，返回 0
  } catch (error) {
    console.error(`Error fetching OpenRank data for ${repoName}:`, error);
    return Array(11).fill(0); // 返回一个全为 0 的数组
  }
}

// 定义 updateChartData 函数
export async function updateChartData(repoName: string) {
  const openRankData = await fetchChartData(repoName);
  const activityData = await fetchActivityData(repoName);

  // 更新 OpenRank 数据
  myChart.data.datasets[0].data = openRankData;

  // 更新 Activity 数据
  myChart.data.datasets[1].data = activityData;

  // 更新图表
  myChart.update();
}
