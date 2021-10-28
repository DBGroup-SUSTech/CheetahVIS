package sustech.dbgroup.PATHFINDER.dataStructure;

import java.util.HashMap;
import java.util.HashSet;

public class Node implements Comparable<Node> {
    int id;
    double lat;
    double lng;
    HashSet<Integer> neighborNodes;
    HashMap<Integer, Integer> neighborEdges; // key: end_node,  value: edge id
    MBR db;
    int level;

    public Node(int id, double lat, double lng) {
        this.id = id;
        this.lat = lat;
        this.lng = lng;
        neighborNodes = new HashSet<>();
        neighborEdges = new HashMap<>();
        db = new MBR(lat, lng, lat, lng);//?
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public double getLat() {
        return lat;
    }

    public void setLat(double lat) {
        this.lat = lat;
    }

    public double getLng() {
        return lng;
    }

    public void setLng(double lng) {
        this.lng = lng;
    }

    public HashSet<Integer> getNeighborNodes() {
        return neighborNodes;
    }

    public void setNeighborNodes(HashSet<Integer> neighborNodes) {
        this.neighborNodes = neighborNodes;
    }

    public HashMap<Integer, Integer> getNeighborEdges() {
        return neighborEdges;
    }

    public void setNeighborEdges(HashMap<Integer, Integer> neighborEdges) {
        this.neighborEdges = neighborEdges;
    }

    public MBR getDb() {
        return db;
    }

    public void setDb(MBR db) {
        this.db = db;
    }

    public int getLevel() {
        return level;
    }

    public void setLevel(int level) {
        this.level = level;
    }

    @Override
    public String toString() {
        return "Node{" +
                "id=" + id +
                ", lat=" + lat +
                ", lng=" + lng +
//                ", neighborNodes=" + neighborNodes +
//                ", neighborEdges=" + neighborEdges +
//                ", db=" + db +
//                ", level=" + level +
                '}';
    }

    @Override
    public int compareTo(Node o) {
        return this.level - o.level;
    }
}
