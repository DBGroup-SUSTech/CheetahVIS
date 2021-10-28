package sustech.dbgroup.PATHFINDER.dataStructure;

import sustech.dbgroup.PATHFINDER.utils.ReadFile;

import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;

public class Graph {
    HashMap<Integer, Node> nodes;
    HashMap<Integer, Edge> edges;
    HashSet<Integer> edgeMap;
    static int id_counter = 0;
    HashMap<Integer, HashSet<Integer>> originRoadNetwork;

    public Graph() {
        nodes = new HashMap<>();
        edges = new HashMap<>();
        edgeMap = new HashSet<>();
        originRoadNetwork = new HashMap<>();
    }

    public HashMap<Integer, Node> getNodes() {
        return nodes;
    }

    public void setNodes(HashMap<Integer, Node> nodes) {
        this.nodes = nodes;
    }

    public HashMap<Integer, Edge> getEdges() {
        return edges;
    }

    public void setEdges(HashMap<Integer, Edge> edges) {
        this.edges = edges;
    }

    public Node getNodeById(int id) {
        return nodes.get(id);
    }

    public Edge getEdgeById(int id) {
        return edges.get(id);
    }

    public HashSet<Integer> getEdgeMap() {
        return edgeMap;
    }

    public void setEdgeMap(HashSet<Integer> edgeMap) {
        this.edgeMap = edgeMap;
    }

    public static int getId_counter() {
        return id_counter;
    }

    public static void setId_counter(int id_counter) {
        Graph.id_counter = id_counter;
    }

    public void init(String vertexFile, String edgeFile) {
        ReadFile.readIdNode(vertexFile, this);
        ReadFile.readIdEdge(edgeFile, this);
        id_counter = Collections.max(getEdges().keySet()) + 1;

    }

    public HashMap<Integer, HashSet<Integer>> getOriginRoadNetwork() {
        return originRoadNetwork;
    }

    public void setOriginRoadNetwork(HashMap<Integer, HashSet<Integer>> originRoadNetwork) {
        this.originRoadNetwork = originRoadNetwork;
    }

    public void insertEdge(Edge edge) {
        getEdges().put(edge.id, edge);
        getEdgeMap().add(edge.id);
        getNodeById(edge.src_id).getNeighborNodes().add(edge.tgt_id);
        getNodeById(edge.src_id).getNeighborEdges().put(edge.tgt_id, edge.id);
        getNodeById(edge.tgt_id).getNeighborNodes().add(edge.src_id);
        getNodeById(edge.tgt_id).getNeighborEdges().put(edge.src_id, edge.id);
    }


    public int getEdgeNumOfNode(int nodeId) {
        return this.getNodeById(nodeId).neighborNodes.size();
    }

}
