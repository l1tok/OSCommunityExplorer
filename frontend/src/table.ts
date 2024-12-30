// 定义接口来描述后端响应数据的结构
interface ApiResponse {
    actor_id: string;
    actor_login: string;
    open_rank: number;
  }
  
  // 定义函数以更新表格
export function updateTable(data: ApiResponse[]): void {
    const tbody = document.querySelector('#data-table tbody') as HTMLTableSectionElement;
    tbody.innerHTML = ''; // 清空表格内容
  
    if (data.length > 0) {
      data.forEach((row, index) => {
        const avatarUrl = `https://avatars.githubusercontent.com/u/${row.actor_id}?v=4`;
        const tableRow = document.createElement('tr');
        tableRow.innerHTML = `
          <td>${index + 1}</td>
          <td><img src="${avatarUrl}" alt="Avatar" style="width: 30px; height: 30px; border-radius: 50%;"></td>
          <td>${row.actor_login}</td>
          <td>${row.open_rank}</td>
        `;
        tbody.appendChild(tableRow);
      });
    } else {
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = `
        <td colspan="4" style="text-align: center;">无数据</td>
      `;
      tbody.appendChild(emptyRow);
    }
  }
  
  // 请求后端 API 数据的函数
  export async function fetchTableData(repoName: string, month: number): Promise<void> {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/repo_actor_openrank", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          node_id: repoName,
          month: month,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data: ApiResponse[] = await response.json();
      console.log("Response data ready");
  
      // 更新表格
      updateTable(data);
    } catch (error) {
      console.error("Error:", error);
  
      const tbody = document.querySelector('#data-table tbody') as HTMLTableSectionElement;
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; color: red;">加载数据失败，请稍后重试。</td>
        </tr>
      `;
    }
  }
  

  