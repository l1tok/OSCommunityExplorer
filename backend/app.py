from flask import Flask, request, jsonify
from flask_cors import CORS
import networkx as nx
from clickhouse_driver import Client
from datetime import datetime
from dateutil.relativedelta import relativedelta
import json

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})  # 启用跨域支持
client = Client(
    host='cc-2ze7189376o5m9759.public.clickhouse.ads.aliyuncs.com',
    port=9000,
    user='xlab',
    password='Xlab2021!',
    database='opensource',
    settings={'use_server_time_zone': True},  # 通过 settings 配置时区
    connect_timeout=15,
    send_receive_timeout=60
)

# 初始化无向图
G = nx.Graph()

def load_graph():
    # 加载节点
    with open("repo_f1.txt", "r") as node_file:
        nodes = node_file.read().splitlines()
        G.add_nodes_from(nodes)  # 添加节点

    # 加载边
    with open("new_dynamic4_filtered_repos_edge_f1.txt", "r") as edge_file:
        edges = []
        for line in edge_file:
            u, v, w = line.strip().split(",")  # 假设每行的数据格式为 "node1,node2"
            edges.append((u, v))
        G.add_edges_from(edges)  # 添加边


# 调用函数以加载数据到图中
load_graph()

@app.route('/api/get-repos', methods=['GET'])
def get_repos():
    try:
        with open('node_color_mapping.json', 'r') as json_file:
            node_color_mapping = json.load(json_file)
        # with open('repo.txt', 'r', encoding='utf-8') as file:
        #     repos = file.read().splitlines()
        #     return jsonify(repos)
        res = {'repo_list': list(G.nodes), 'color_mapping': node_color_mapping}
        return jsonify(res)
    except Exception as e:
        return str(e), 500

@app.route('/api/get-edges', methods=['GET'])
def get_edges():
    try:
        with open('new_dynamic4_filtered_repos_edge_f1.txt', 'r', encoding='utf-8') as file:
            edges = [
                {"repo1": line.strip().split(',')[0], "repo2": line.strip().split(',')[1],
                    "weight": line.strip().split(',')[2]}
                for line in file.readlines() if line.strip()
            ]
            # edges = [
            #     {"repo1": edge[0], "repo2": edge[1], "weight": }
            #     for edge in G.edges
            # ]
            return jsonify(edges)

    except Exception as e:
        return str(e), 500

@app.route('/')
def test():
    return 'Test success!'

# 示例路由

# 定义 k-core 社区搜索 API
@app.route("/api/k-core", methods=["POST"])
def k_core():
    # 获取请求参数
    data = request.json
    node_id = data.get("node_id")
    k = data.get("k")
    print('k-core', node_id, k)
    # 检查参数
    if not node_id:
        return jsonify({"error": "Both node_id and k are required"}), 400

    # 获取从 node_id 出发的邻接子图
    # try:
    # node_subgraph = nx.node_connected_component(G, node_id)
    node_subgraph = nx.ego_graph(G, node_id, radius=1)
    # 计算 k-core
    print(node_subgraph)
    if k is None:
        core_numbers = nx.core_number(node_subgraph)
        max_k = max(core_numbers.values())
        k = max_k
    k_core_graph = nx.k_core(node_subgraph, k=k)
    print(k_core_graph)
    # except Exception as e:
    #     return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    # 检查节点是否在 k-core 子图中
    if node_id not in k_core_graph.nodes:
        return jsonify({"error": f"Node {node_id} is not part of the k-core with k={k}"}), 404

    # 返回 k-core 子图的节点和边
    core_nodes = list(k_core_graph.nodes)
    core_edges = list(k_core_graph.edges)
    return jsonify({
        "nodes": core_nodes,
        "edges": [{"source": edge[0], "target": edge[1]} for edge in core_edges]
    })

# @app.route("/api/k_ecc", methods=["POST"])
# def k_ecc():
#     todo

@app.route("/api/k-truss", methods=["POST"])
def k_truss():
    # 获取请求参数
    data = request.json
    node_id = data.get("node_id")
    k = data.get("k")
    print('k-truss', node_id, k)

    # 检查参数
    if not node_id:
        return jsonify({"error": "Both node_id and k are required"}), 400

    # 获取从 node_id 出发的邻接子图
    node_subgraph = nx.ego_graph(G, node_id, radius=1)


    print(node_subgraph)
    if k is None:
        core_numbers = nx.core_number(node_subgraph)
        max_k = max(core_numbers.values())
        k = max_k
    k_truss_graph = nx.k_core(node_subgraph, k=k)
    print(k_truss_graph)
    # 返回 k-truss 子图的节点和边
    truss_nodes = list(k_truss_graph.nodes)
    truss_edges = list(k_truss_graph.edges)

    return jsonify({
        "nodes": truss_nodes,
        "edges": [{"source": edge[0], "target": edge[1]} for edge in truss_edges]
    })

@app.route("/api/repo_openrank", methods=["POST"])
def get_repo_openrank():
    data = request.json
    repo_name = data.get("node_id")
    # 如果没有传递 repo_name，返回错误提示
    if not repo_name:
        return jsonify({"error": "Missing 'repo_name' parameter"}), 400
    # SQL 查询
    query = f"""
        SELECT 
            toStartOfMonth(created_at) AS month,
            repo_name, 
            round(avg(openrank), 2) AS avg_openrank -- 按月计算平均 openrank
        FROM 
            opensource.global_openrank t
        WHERE 
            repo_name = '{repo_name}'
            AND toDate(created_at) >= toDate('2024-01-01')
            AND toDate(created_at) < toDate('2025-01-01')
        GROUP BY 
            month, repo_name
        ORDER BY 
            month ASC
    """
    # 执行查询
    try:
        res = client.execute(query)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    # 将结果格式化为 JSON 格式
    result = [
        {
            "month": row[0].strftime('%Y-%m-%d'),  # 将日期格式化为字符串
            "repo_name": row[1],
            "avg_openrank": row[2]
        }
        for row in res
    ]
    # 返回 JSON 响应
    return jsonify(result)

@app.route("/api/repos_openrank", methods=["POST"])
def get_repos_openrank():
    data = request.get_json()
    repo_names = data.get("repoNames", [])
    repo_names_str = ", ".join([f"'{repo_name}'" for repo_name in repo_names])
    # 获取当前时间
    now = datetime.now()

    # 获取上个月的时间
    last_month_num = (now - relativedelta(months=1)).month

    query = f"""
        SELECT 
            repo_name, 
            round(openrank, 2) AS openrank 
        FROM 
            opensource.global_openrank t
        WHERE 
            repo_name in ({repo_names_str})
            AND toDate(created_at) = toDate('2024-{last_month_num}-01')
    """
    # 执行查询
    try:
        res = client.execute(query)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    # 将结果格式化为 JSON 格式
    result = [
        {
            "repo_name": row[0],
            "openrank": row[1]
        }
        for row in res
    ]
    # 返回 JSON 响应
    return jsonify(result)

@app.route("/api/repo_actor_openrank", methods=["POST"])
def get_repo_actor_openrank():
    data = request.json
    repo_name = data.get("node_id")
    month = data.get("month")
    if not repo_name:
        return jsonify({"error": "Missing 'repo_name' parameter"}), 400
    if not month:
        month = 11
    # SQL 查询
    query = f"""
        SELECT
            actor_id,
            actor_login,
            round(sum(openrank), 2) AS open_rank 
        FROM
            opensource.community_openrank t
        WHERE
            repo_name =  '{repo_name}'
            AND actor_id > 0
            AND toDate(created_at) >= toDate('2024-{month}-01')
            AND toDate(created_at) < addMonths(toDate('2024-{month}-01'),1)
        GROUP BY
            actor_id,actor_login
        ORDER BY
            open_rank DESC
        LIMIT 500
    """
    try:
        res = client.execute(query)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    # 将结果格式化为 JSON 格式
    result = [
        {
            "actor_id": row[0],
            "actor_login": row[1],
            "open_rank": row[2]
        }
        for row in res
    ]
    # 返回 JSON 响应
    return jsonify(result)

if __name__ == '__main__':
    app.run()

