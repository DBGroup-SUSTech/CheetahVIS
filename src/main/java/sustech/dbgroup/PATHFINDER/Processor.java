package sustech.dbgroup.PATHFINDER;

import sustech.dbgroup.PATHFINDER.dataStructure.*;

import java.util.*;
import java.io.*;

public class Processor {
    static CHGraph g = new CHGraph();

    public static void calculateCHGraph() {
        g.init("/home/spark/data/pathfinder/id_vertex_processed.txt", "/home/spark/data/pathfinder/id_edge_processed.txt");
        HashMap<Integer, Integer> t = g.calEdgeDiff();
        for (Node node : g.getNodes().values()) {
            node.setLevel(t.get(node.getId()));
        }
        PriorityQueue<Node> nodePriorityQueue = new PriorityQueue<>(g.getNodes().values());
        DistHelper distHelper = new DistHelper(Collections.max(g.getNodes().keySet()) + 1);
        int init_level = 0;
        while (!nodePriorityQueue.isEmpty()) {
            g.contract(nodePriorityQueue.peek().getId(), distHelper, true);
            nodePriorityQueue.poll().setLevel(++init_level);
        }

        g.calNeighbors();
        g.calNodesDB();
        g.readTrajEdges("/home/spark/data/pathfinder/trajectory_edge.txt");
        g.createTopNodesRtree();


    }

    public static HashMap<Integer, ArrayList<Node>> query(double lat1, double lng1, double lat2, double lng2) {

        long start = System.currentTimeMillis();
        MBR query = new MBR(lat1, lng1, lat2, lng2);
        System.out.println("Query Range: " + query);
//        System.out.println("(" + Math.min(lng1, lng2) + ", " + Math.max(lng1, lng2) + ", " + Math.min(lat1, lat2) + ", " + Math.max(lat1, lat2));
//        System.out.println("(" + Math.min(lng1, lng2) + ", " + Math.max(lng1, lng2) + ", " + Math.min(lat1, lat2) + ", " + Math.max(lat1, lat2)
//                + ")");

        HashSet<Integer> tmp = new HashSet<>();
        int nQueries = 1;
        for (int i = 0; i < nQueries; i++) {
            tmp = g.pathFinder(query);
        }
        long end = System.currentTimeMillis();

        System.out.println("Query time: " + (end - start) / 1000.0 / nQueries + " s / query");
        System.out.println("Average query time: " + (end - start) * 1000.0 / nQueries / tmp.size() + " microseconds / traj");
        System.out.println("Trajectory number: " + tmp.size());
        System.out.println();
        System.out.println("Query Range: " + query);
//        Edge edgeWithProblem = g.getEdgeById(25802);
//        System.out.println("Edge:" + edgeWithProblem);
//        System.out.println("One node of this edge: " + g.getNodeById(edgeWithProblem.getSrc_id()));
//        System.out.println("The other node of this edge: " + g.getNodeById(edgeWithProblem.getTgt_id()));
//        System.out.println("If intersection: " + g.intersectEdge(query, edgeWithProblem));
        System.out.println();

        HashMap<Integer, ArrayList<Node>> results = g.readVertex(tmp, "/home/spark/data/pathfinder/trajectory_vertex.txt");
        return results;
    }

    public static HashMap<Integer, ArrayList<Node>> multQuery(ArrayList<MBR> queryMbr) {
        long starttime = System.currentTimeMillis();
        HashMap<Integer, ArrayList<Node>> result = new HashMap<>();
        HashSet<Integer> tmp = new HashSet<>();
        MBR query = queryMbr.get(0);
        int nQueries = 1;
        for (int i = 0; i < nQueries; i++) {
            tmp = g.pathFinder(query);
        }
        for (int i = 1; i < queryMbr.size(); i++) {
            query = queryMbr.get(i);
            tmp.retainAll(g.pathFinder(query));
        }
        long endtime = System.currentTimeMillis();
        result = g.readVertex(tmp, "/home/spark/data/pathfinder/trajectory_vertex.txt");
        System.out.println("Query time: " + (endtime - starttime) / 1000.0 / nQueries + " s / query");
        System.out.println("Trajectory number: " + tmp.size());
        return result;
    }

    /*
    返回子轨迹中包含的edge
    */
    public static HashMap<Integer, ArrayList<Integer>> getTrajEdgeSets(ArrayList<MBR> queryMbr) {
        HashMap<Integer, ArrayList<Integer>> resultMap = new HashMap<>();
        HashMap<Integer, ArrayList<Integer>> tmp = new HashMap<>();//轨迹id和对应的一条边
        MBR query = queryMbr.get(0);
        int nQueries = 1;
        for (int i = 0; i < nQueries; i++) {
            tmp = g.subTrajFinder(query);
        }
        for (int key : tmp.keySet()) {//初始化
            resultMap.put(key, new ArrayList<>());
            resultMap.get(key).addAll(tmp.get(key));
        }

        /*找到所有包含的edge*/
        for (int i = 1; i < queryMbr.size(); i++) {
            query = queryMbr.get(i);
            HashMap<Integer, ArrayList<Integer>> tmp_2 = g.subTrajFinder(query);
            Iterator<Map.Entry<Integer, ArrayList<Integer>>> tmpKey = tmp.entrySet().iterator();
            while (tmpKey.hasNext()) {
                Map.Entry<Integer, ArrayList<Integer>> entry = tmpKey.next();
                Integer key = entry.getKey();
                if (tmp_2.containsKey(key)) {
                    ArrayList<Integer> tmp_2_list = tmp_2.get(key);
                    for (int id_2 : tmp_2_list)
                        if (!resultMap.get(key).contains(id_2)) {
                            resultMap.get(key).add(id_2);
                        }
                } else {
                    tmpKey.remove();
                    resultMap.remove(key);
                }
            }
        }
        return resultMap;
    }


    public static HashMap<Integer, ArrayList<Node>> querySubTrajs(ArrayList<MBR> queryList) {
        HashMap<Integer, ArrayList<Node>> reslutTraj = new HashMap<>();
        HashMap<Integer, ArrayList<Integer>> trajEdge = getTrajEdgeSets(queryList);//储存所有经过的轨迹在框中的边
        reslutTraj = g.subReadTrajVertex(trajEdge, "/home/spark/data/pathfinder/trajectory_edge.txt");
        return reslutTraj;
    }


    public static ArrayList<HashMap<Integer, ArrayList<Node>>> queryEdgesOfOneMBR(ArrayList<MBR> queryMbr) {
        ArrayList<HashMap<Integer, ArrayList<Node>>> result = new ArrayList<>();
        HashSet<Integer> edges = g.refineEdgeCandidates(queryMbr.get(0), g.findEdgeCandidates(queryMbr.get(0)));

        for (int j : edges) {
            System.out.println("Edge " + j + ": " + g.intersectEdge(queryMbr.get(0), g.getEdgeById(j)));
            HashMap<Integer, ArrayList<Node>> tmp = new HashMap<>();
            ArrayList<Node> tra = new ArrayList<>();
            tra.add(g.getNodeById(g.getEdgeById(j).getSrc_id()));
            tra.add(g.getNodeById(g.getEdgeById(j).getTgt_id()));
            tmp.put(j, tra);
            result.add(tmp);
        }

        return result;
    }

}
