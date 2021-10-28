package sustech.dbgroup.PATHFINDER.dataStructure;

import com.github.davidmoten.rtree.Entry;
import com.github.davidmoten.rtree.RTree;
import com.github.davidmoten.rtree.geometry.Geometries;
import com.github.davidmoten.rtree.geometry.Rectangle;
import org.apache.commons.lang.ObjectUtils;

import java.io.*;
import java.lang.reflect.Array;
import java.util.*;

public class CHGraph extends Graph {
    //    ArrayList<Shortcut> shortcuts = new ArrayList<>();
    static final int INFINITY = Integer.MAX_VALUE;
    HashMap<Integer, HashSet<Integer>> invertIdx = new HashMap<>();
    HashMap<Integer, ArrayList<Integer>> trajs = new HashMap<>();
    HashMap<Integer, ArrayList<Integer>> trajEdge = new HashMap<>();
    RTree<Integer, Rectangle> rTree = RTree.create();

    public HashMap<Integer, Integer> calEdgeDiff() {
        HashMap<Integer, Integer> edgeDiffs = new HashMap<>(nodes.size());

        HashMap<Integer, ArrayList<Shortcut>> shortcuts = getShortcutsOfContracting();
        for (int i : shortcuts.keySet()) {
            edgeDiffs.put(i, shortcuts.get(i).size() - nodes.get(i).getNeighborNodes().size());
        }

        return edgeDiffs;
    }

    public RTree<Integer, Rectangle> getrTree() {
        return rTree;
    }

    public void setrTree(RTree<Integer, Rectangle> rTree) {
        this.rTree = rTree;
    }

    public HashMap<Integer, HashSet<Integer>> getInvertIdx() {
        return invertIdx;
    }

    public void setInvertIdx(HashMap<Integer, HashSet<Integer>> invertIdx) {
        this.invertIdx = invertIdx;
    }

    public HashMap<Integer, ArrayList<Integer>> getTrajs() {
        return trajs;
    }

    public void setTrajs(HashMap<Integer, ArrayList<Integer>> trajs) {
        this.trajs = trajs;
    }

    public HashMap<Integer, ArrayList<Shortcut>> getShortcutsOfContracting() {
        int numOfNode = Collections.max(nodes.keySet()) + 1;
        DistHelper distHelper = new DistHelper(numOfNode);
        HashMap<Integer, ArrayList<Shortcut>> shortcuts = new HashMap<>();
        for (int i : nodes.keySet()) {
            shortcuts.put(i, contract(nodes.get(i).getId(), distHelper, false));
        }
        return shortcuts;
    }

    /*
     * ifAdd 表示是否真的执行contract操作，若为false表示只获得生成shortcut，不删去边。
     * **/
    public ArrayList<Shortcut> contract(int node, DistHelper distHelper, boolean ifAdd) {
        ArrayList<Shortcut> shortcuts = new ArrayList<>();
        HashSet<Integer> tmp = new HashSet<>(this.getNodeById(node).getNeighborEdges().values());
        for (int edge : tmp) {
            if (!edgeMap.contains(edge)) continue;
            if (this.getEdgeById(edge).tgt_id == this.getEdgeById(edge).src_id) continue;
            ArrayList<Shortcut> new_shortcuts = calcShortcuts(this.getEdgeById(edge), node, distHelper, ifAdd);
            shortcuts.addAll(new_shortcuts);
        }
        return shortcuts;
    }

    public ArrayList<Shortcut> calcShortcuts(Edge start_edge, int center_node, DistHelper distHelper, boolean ifAdd) {
        ArrayList<Target> targets = new ArrayList<>(this.getNodeById(center_node).getNeighborEdges().size());
        int start_node = getOtherNode(start_edge, center_node);
        assert (start_node != -1);
        double radius = 0;

        for (int edge : this.getNodeById(center_node).getNeighborEdges().values()) {
            if (this.getEdgeById(edge).tgt_id == this.getEdgeById(edge).src_id) continue;
            int end_node = getOtherNode(this.getEdgeById(edge), center_node);
            if (start_node == end_node) continue; /* don't create loops */

            radius = Math.max(radius, this.getEdgeById(edge).getCost());
            targets.add(new Target(end_node, this.getEdgeById(edge)));
        }
        radius += start_edge.getCost();

        calcShortestDists(distHelper, start_node, radius);

        if (distHelper.dist[center_node] != start_edge.getCost()) return new ArrayList<Shortcut>();

        ArrayList<Shortcut> shortcuts = new ArrayList<>();

        for (Target target : targets) {
            /* we know a path within radius - so _calcShortestDists must have found one */
            assert ((double) INFINITY != distHelper.dist[target.end_node]);

            double center_node_dist = (start_edge.getCost() + target.end_edge.getCost());
            if (distHelper.dist[target.end_node] == center_node_dist) {
                if (ifAdd) {

                    shortcuts.add(createShortcut(start_edge, target.end_edge, center_node));
                } else
                    shortcuts.add(getShortcut(start_edge, target.end_edge, center_node));
            }
        }

        return shortcuts;
    }

    public void calcShortestDists(DistHelper distHelper, int start_node, double radius) {
        distHelper.pq = new PriorityQueue<>();
        for (int i : distHelper.reset_dist) {
            distHelper.dist[i] = (double) INFINITY;
        }
        distHelper.reset_dist.clear();

        distHelper.pq.add(new PQElement(start_node, 0));
        distHelper.dist[start_node] = 0;
        distHelper.reset_dist.add(start_node);

        while (!distHelper.pq.isEmpty() && distHelper.pq.peek().cost <= radius) {
            PQElement top = distHelper.pq.poll();
            if (distHelper.dist[top.node] != top.cost) continue;

            for (int e : this.getNodeById(top.node).getNeighborEdges().values()) {
                Edge edge = this.getEdgeById(e);
                int tgt_node = getOtherNode(edge, top.node);
                double new_dist = top.cost + edge.cost;

                if (new_dist < distHelper.dist[tgt_node]) {
                    if (distHelper.dist[tgt_node] == (double) INFINITY) {
                        distHelper.reset_dist.add(tgt_node);
                    }
                    distHelper.dist[tgt_node] = new_dist;
                    distHelper.pq.add(new PQElement(tgt_node, new_dist));
                }
            }
        }

    }

    /*
     * 将轨迹转换成CHPath
     * **/
    public ArrayList<Integer> toCHPath(ArrayList<Integer> traj) {
        int i = 0;
        while (i + 1 < traj.size()) {
            Edge tmp = getShortCut(traj.get(i), traj.get(i + 1));
            if (tmp != null) {
                traj.remove((int) i);
                traj.set(i, tmp.id);
                i = Math.max(i - 1, 0);
            } else i++;
        }
        return traj;
    }

    /**
     * 返回对一个点的两条边进行contact操作后生成的shortcut， 但不真正执行contract操作
     */
    public Shortcut getShortcut(Edge edge1, Edge edge2, int center_node) {
        int edge1_other = getOtherNode(edge1, center_node);
        int edge2_other = getOtherNode(edge2, center_node);
        if (originRoadNetwork.get(edge1_other).contains(edge2_other)) return null;
        if (edge1_other != edge2_other) {
            return new Shortcut(Graph.id_counter, edge1_other, edge2_other, edge2.cost + edge1.cost, edge1.id, edge2.id, center_node);
        } else {
            System.out.println("yes");
            return null;
        }
    }

    /**
     * 返回对一个点的两条边进行contact操作后生成的shortcut，真正执行contract操作
     */
    public Shortcut createShortcut(Edge edge1, Edge edge2, int center_node) {
        int edge1_other = getOtherNode(edge1, center_node);
        int edge2_other = getOtherNode(edge2, center_node);
        if (originRoadNetwork.get(edge1_other).contains(edge2_other)) return null;
        if (edge1_other != edge2_other && edge1_other != center_node && edge2_other != center_node) {
            deleteContractedEdges(edge1, edge2, center_node);
            Shortcut new_shortcut = new Shortcut(Graph.id_counter++, edge1_other, edge2_other, edge2.cost + edge1.cost, edge1.id, edge2.id, center_node);
            originRoadNetwork.get(edge1_other).add(edge2_other);
            originRoadNetwork.get(edge2_other).add(edge1_other);
            new_shortcut.setPb(edge1.pb.join(edge2.pb));
            new_shortcut.setNe(Math.max(edge1.ne, edge2.ne) + 1);
            this.insertEdge(new_shortcut);
            return new_shortcut;
        } else {
            System.out.println("yes");
            return null;
        }
    }

    /**
     * 读取轨迹
     */
    public void readTrajEdges(String filePath) {
        String encoding = "UTF-8";
        File file = new File(filePath);
        if (file.isFile() && file.exists()) {
            try (InputStreamReader read = new InputStreamReader(new FileInputStream(file), encoding);
                 BufferedReader bufferedReader = new BufferedReader(read);) {

                String lineTxt = null;

                while ((lineTxt = bufferedReader.readLine()) != null) {
                    String[] tmp = lineTxt.split(";");
                    ArrayList<Integer> traj = new ArrayList<>();
                    for (int i = 1; i < tmp.length; i++) {
                        if (edges.containsKey(Integer.parseInt(tmp[i]))) {
                            traj.add(Integer.parseInt(tmp[i]));
                            if (!invertIdx.containsKey(Integer.parseInt(tmp[i])))
                                invertIdx.put(Integer.parseInt(tmp[i]), new HashSet<>());
                            invertIdx.get(Integer.parseInt(tmp[i])).add(Integer.parseInt(tmp[0]));
                        }
                    }


                    trajs.put(Integer.parseInt(tmp[0]), toCHPath(traj));
                }
            } catch (Exception e) {
                System.out.println("Exception occurs when reading file.");
                e.printStackTrace();
            }
        } else {
            System.out.println("File not exists " + filePath );
        }
    }

    public HashMap<Integer, ArrayList<Node>> readVertex(HashSet<Integer> trajIds, String filePath) {
        String encoding = "UTF-8";
        File file = new File(filePath);
        HashMap<Integer, ArrayList<Node>> trajs = new HashMap<>();
        if (file.isFile() && file.exists()) {
            try (InputStreamReader read = new InputStreamReader(new FileInputStream(file), encoding);
                 BufferedReader bufferedReader = new BufferedReader(read)) {
                String lineTxt;
                while ((lineTxt = bufferedReader.readLine()) != null) {
                    String[] tmp = lineTxt.split(";");
                    ArrayList<Node> traj = new ArrayList<>();
                    if (trajIds.contains(Integer.parseInt(tmp[0]))) {
                        for (int i = 1; i < tmp.length; i++) {
                            traj.add(getNodeById(Integer.parseInt(tmp[i])));
                        }
                        trajs.put(Integer.parseInt(tmp[0]), traj);
                    }
                }
            } catch (Exception e) {
                System.out.println("Exception occurs when reading file.");
                e.printStackTrace();
            }
        } else {
            System.out.println("File not exists: " + filePath);
        }
        return trajs;
    }


    /**
     * 给所有点计算并存储相邻点和相邻边
     */
    public void calNeighbors() {
        int count = 0;
        for (Edge edge : getEdges().values()) {
            int id1 = edge.src_id;
            int id2 = edge.tgt_id;
            if (id1 != id2) {
                getNodeById(id2).getNeighborNodes().add(id1);
                getNodeById(id1).getNeighborNodes().add(id2);
                getNodeById(id1).getNeighborEdges().put(id2, edge.id);
                getNodeById(id2).getNeighborEdges().put(id1, edge.id);
                count++;
            }
        }
    }

    /**
     * 进行contact时删除边的操作
     */
    public void deleteContractedEdges(Edge edge1, Edge edge2, int center_node) {
        this.edgeMap.remove(edge1.id);
        this.edgeMap.remove(edge2.id);
        this.edgeMap.add(Graph.id_counter);
        int edge1_other = getOtherNode(edge1, center_node);
        int edge2_other = getOtherNode(edge2, center_node);
        getNodeById(edge1_other).getNeighborEdges().remove(center_node);
        getNodeById(edge1_other).getNeighborNodes().remove(center_node);
        getNodeById(edge2_other).getNeighborEdges().remove(center_node);
        getNodeById(edge2_other).getNeighborNodes().remove(center_node);
        getNodeById(center_node).getNeighborEdges().remove(edge1_other);
        getNodeById(center_node).getNeighborEdges().remove(edge2_other);
        getNodeById(center_node).getNeighborNodes().remove(edge1_other);
        getNodeById(center_node).getNeighborNodes().remove(edge2_other);

    }

    /**
     * 返回所有topNodes（相邻点都比自己的level低）
     */
    public HashSet<Integer> getTopNodes() {
        HashSet<Integer> result = new HashSet<>();
        for (int nodeId : nodes.keySet()) {
            boolean flag = true;
            for (int id : getNodeById(nodeId).getNeighborNodes()) {
                if (getNodeById(id).level > getNodeById(nodeId).level)
                    flag = false;
            }
            if (flag)
                result.add(nodeId);
        }
        return result;
    }

    /**
     * 计算所有点的DB（downgraph box）
     */
    public void calNodesDB() {
        PriorityQueue<Node> pq = new PriorityQueue<>(nodes.values());
        while (!pq.isEmpty()) {
            Node tmp = pq.poll();
            for (int edgeId : tmp.getNeighborEdges().values()) {
                Edge edge = getEdgeById(edgeId);
                int id_other = getOtherNode(edge, tmp.id);
                Node node_other = getNodeById(id_other);
                if (node_other.level > tmp.level) {
                    node_other.setDb(tmp.db.join(edge.pb).join(node_other.db));
                } else
                    tmp.setDb(node_other.db.join(edge.pb).join(tmp.db));
            }
        }
    }

    public int getOtherNode(Edge e, int node) {
        if (e.tgt_id == node)
            return e.src_id;
        if (e.src_id == node)
            return e.tgt_id;
        else {
            System.err.println(e + " doesn't contain node " + getNodeById(node));
            return -1;
        }
    }

    public Shortcut getShortCut(int e1, int e2) {
        Edge edge1 = getEdgeById(e1);
        Edge edge2 = getEdgeById(e2);
        if (edge1.src_id == edge2.src_id) {
            HashMap<Integer, Integer> tmp = getNodeById(edge1.tgt_id).getNeighborEdges();
            if (tmp.containsKey(edge2.tgt_id))
                if (getEdgeById(tmp.get(edge2.tgt_id)) instanceof Shortcut)
                    return (Shortcut) getEdgeById(tmp.get(edge2.tgt_id));
        } else if (edge1.src_id == edge2.tgt_id) {
            HashMap<Integer, Integer> tmp = getNodeById(edge1.tgt_id).getNeighborEdges();
            if (tmp.containsKey(edge2.src_id))
                if (getEdgeById(tmp.get(edge2.src_id)) instanceof Shortcut)
                    return (Shortcut) getEdgeById(tmp.get(edge2.src_id));
        }
        return null;
    }

    public void createTopNodesRtree() {
        for (int nodeId : getTopNodes()) {
            MBR mbr2 = getNodeById(nodeId).getDb();
            setrTree(getrTree().add(nodeId, Geometries.rectangle(mbr2.getLng1(), mbr2.getLat1(), mbr2.getLng2(), mbr2.getLat2())));
        }
//        getrTree().visualize(600,600)
//                .save("target/mytree.png");
    }

    public HashSet<Integer> findEdgeCandidates(MBR mbr) {
        HashSet<Integer> Eo = new HashSet<>();
        boolean[] visit = new boolean[Collections.max(nodes.keySet()) + 1];
        Arrays.fill(visit, false);

//        for (Entry<Integer, Rectangle> entry : rTree.search(Geometries.rectangle(mbr.getLng1(), mbr.getLat1(), mbr.getLng2(), mbr.getLat2())).toBlocking().toIterable()) {
//            Eo.addAll(findCandidatesForNode(entry.value(), mbr, visit));
//        }

        for (int nodeId : getTopNodes())
            if (getNodeById(nodeId).db.intersect(mbr))
                Eo.addAll(findCandidatesForNode(nodeId, mbr, visit));

        return Eo;
    }

    public void unpackEdge(Edge e, Collection<Integer> edgesSet) {
        if (e instanceof Shortcut) {
            unpackEdge(getEdgeById(((Shortcut) e).child_edge1), edgesSet);
            unpackEdge(getEdgeById(((Shortcut) e).child_edge2), edgesSet);
        } else
            edgesSet.add(e.id);
    }


    public HashSet<Integer> findCandidatesForNode(int v, MBR mbr, boolean[] visit) {
        HashSet<Integer> C = new HashSet<>();
//        if (visit[v])
//            return new ArrayList<>();
        visit[v] = true;
        for (int nodeId : getNodeById(v).getNeighborEdges().keySet()) {
            if (getNodeById(nodeId).level < getNodeById(v).level) {
                if (getEdgeById(getNodeById(v).getNeighborEdges().get(nodeId)).pb.intersect(mbr)) {
                    Edge edge = getEdgeById(getNodeById(v).getNeighborEdges().get(nodeId));
                    C.add(getNodeById(v).getNeighborEdges().get(nodeId));
                }
                if (!visit[nodeId] && getNodeById(nodeId).db.intersect(mbr))
                    C.addAll(findCandidatesForNode(nodeId, mbr, visit));
            }
        }
        return C;
    }

    public HashSet<Integer> refineEdgeCandidates(MBR mbr, HashSet<Integer> edges) {
        HashSet<Integer> results = new HashSet<>();
        for (int i : edges) {
            Edge edge = getEdgeById(i);
            if (!(edge instanceof Shortcut) && intersectEdge(mbr, edge))
                results.add(i);
            else if (edge instanceof Shortcut) {
                if (!edge.pb.intersect(mbr))
                    continue;
                HashSet<Integer> tmp = new HashSet<>();
                unpackEdge(edge, tmp);
//                if (intersectNode(mbr, getNodeById(edge.src_id)) || intersectNode(mbr, getNodeById(edge.tgt_id))) {
//                    results.addAll(tmp);
//                } else {
                for (int i1 : tmp) {
                    if (intersectEdge(mbr, getEdgeById(i1))) {
                        results.add(i1);
                    }
                }
            }
        }
//        }
        return results;
    }

    public HashSet<Integer> getAssociatedTrajectories(HashSet<Integer> edges) {
        HashSet<Integer> ans = new HashSet<>();
        for (int i : edges) {
            ans.addAll(invertIdx.get(i));
        }
        return ans;
    }

    public HashSet<Integer> pathFinder(MBR mbr) {
        return getAssociatedTrajectories(refineEdgeCandidates(mbr, findEdgeCandidates(mbr)));
    }

    /*
     *返回hashmap为轨迹到edge的map，traj作为key保证唯一性，多个edge时保留一个即可
     */
    public HashMap<Integer, ArrayList<Integer>> getSubTrajEdge(HashSet<Integer> edges) {
        HashMap<Integer, ArrayList<Integer>> ans = new HashMap<>();
        for (int i : edges) {
            HashSet<Integer> trajId = invertIdx.get(i);//边经过的所有的轨迹
            for (int id : trajId) {
                if (!ans.containsKey(id))
                    ans.put(id, new ArrayList<>());
                ans.get(id).add(i);
            }
        }
        return ans;//返回轨迹过框时的边
    }

    public HashMap<Integer, ArrayList<Integer>> subTrajFinder(MBR mbr) {
        return getSubTrajEdge(refineEdgeCandidates(mbr, findEdgeCandidates(mbr)));
    }

    public HashMap<Integer, ArrayList<Node>> subReadTrajVertex(HashMap<Integer, ArrayList<Integer>> subTraj, String filePath) {

        String encoding = "UTF-8";
        File file = new File(filePath);
        HashSet<Integer> trajSet = new HashSet<>(subTraj.keySet());
        HashMap<Integer, ArrayList<Node>> trajs = new HashMap<>();
        for (int key : trajSet) {
            ArrayList<Node> tmp = new ArrayList<>();
            trajs.put(key, tmp);
        }
        if (file.isFile() && file.exists()) {
            try (InputStreamReader read = new InputStreamReader(new FileInputStream(file), encoding);
                 BufferedReader bufferedReader = new BufferedReader(read)) {

                String lineTxt;
                while ((lineTxt = bufferedReader.readLine()) != null) {
                    String[] info = lineTxt.split(";");
                    int trajId = Integer.parseInt(info[0]);
                    if (trajSet.contains(trajId)) {
                        ArrayList<Integer> subEdge = subTraj.get(trajId);
                        for (int i = 1; i < info.length; i++) {
                            if (subEdge.contains(Integer.parseInt(info[i]))) {
                                int flag = subEdge.size();
                                while (flag > 0 && i < info.length) {
                                    if (subEdge.contains(Integer.parseInt(info[i]))) {
                                        subEdge.remove(subEdge.indexOf(Integer.parseInt(info[i])));
                                        flag--;
                                    }
                                    Edge edgeTmp = getEdgeById(Integer.parseInt(info[i]));
                                    if (edgeTmp != null) {
                                        ArrayList<Node> test = trajs.get(trajId);
                                        test.add(getNodeById(edgeTmp.src_id));
                                        test.add(getNodeById(edgeTmp.tgt_id));
                                    }
                                    i++;
                                }
                                break;
                            }
                        }
                    }
                }
            } catch (Exception e) {
                System.out.println("Exception occurs when reading file.");
                e.printStackTrace();
            }
        } else {
            System.out.println("File not exists");
        }
        return trajs;
    }

    public double eps = 1e-7;

    public int dcmp(double x) {
        if (Math.abs(x) < eps) return 0;
        return x < 0 ? -1 : 1;
    }

    public double crossProduct(Node p1, Node p2) {
        return p1.lng * p2.lat - p1.lat * p2.lng;
    }

    public boolean segSegIntersection(Node s1, Node t1, Node s2, Node t2) {
        Node s1t1 = new Node(0, t1.lat - s1.lat, t1.lng - s1.lng);
        Node s1s2 = new Node(0, s2.lat - s1.lat, s2.lng - s1.lng);
        Node s1t2 = new Node(0, t2.lat - s1.lat, t2.lng - s1.lng);
        Node s2t2 = new Node(0, t2.lat - s2.lat, t2.lng - s2.lng);
        Node s2s1 = new Node(0, s1.lat - s2.lat, s1.lng - s2.lng);
        Node s2t1 = new Node(0, t1.lat - s2.lat, t1.lng - s2.lng);
        return dcmp(crossProduct(s1t1, s1s2)) * dcmp(crossProduct(s1t1, s1t2)) < 0 && dcmp(crossProduct(s2t2, s2s1) * dcmp(crossProduct(s2t2, s2t1))) < 0;
    }

    public boolean intersectEdge(MBR mbr, Edge e) {
        Node node1 = getNodeById(e.src_id);
        Node node2 = getNodeById(e.tgt_id);
        Node A = new Node(0, mbr.lat1, mbr.lng1);
        Node B = new Node(0, mbr.lat2, mbr.lng1);
        Node C = new Node(0, mbr.lat2, mbr.lng2);
        Node D = new Node(0, mbr.lat1, mbr.lng2);
        if (segSegIntersection(node1, node2, A, B)) return true;
        if (segSegIntersection(node1, node2, B, C)) return true;
        if (segSegIntersection(node1, node2, C, D)) return true;
        if (segSegIntersection(node1, node2, D, A)) return true;
        if (intersectNode(mbr, node1) || intersectNode(mbr, node2)) return true;
        return false;
    }

    public boolean intersectEdge_old(MBR mbr, Edge e) {
        Node node1 = getNodeById(e.src_id);
        Node node2 = getNodeById(e.tgt_id);
        double k = (node1.lat - node2.lat) / (node1.lng - node2.lng);
        double b = node1.lat - k * node1.lng;

        if (k * mbr.lng1 + b <= mbr.lat2 && k * mbr.lng1 + b >= mbr.lat1) return true;
        else if (k * mbr.lng2 + b <= mbr.lat2 && k * mbr.lng2 + b >= mbr.lat1) return true;
        else if ((mbr.lat1 - b) / k >= mbr.lng1 && (mbr.lat1 - b) / k <= mbr.lng2) return true;
        else return ((mbr.lat2 - b) / k >= mbr.lng1 && (mbr.lat2 - b) / k <= mbr.lng2);

    }

    public boolean intersectNode(MBR mbr, Node n) {
        return (n.lat >= mbr.lat1 && n.lat <= mbr.lat2 && n.lng >= mbr.lng1 && n.lng <= mbr.lng2);
    }

    class Target {
        int end_node;
        Edge end_edge;

        public Target(int end_node, Edge end_edge) {
            this.end_node = end_node;
            this.end_edge = end_edge;
        }
    }

}
