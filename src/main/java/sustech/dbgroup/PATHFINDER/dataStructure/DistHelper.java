package sustech.dbgroup.PATHFINDER.dataStructure;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.PriorityQueue;

public class DistHelper {
    PriorityQueue<PQElement> pq;
    double[] dist;
    ArrayList<Integer> reset_dist;

    public DistHelper(int numOfNode) {
        this.dist = new double[numOfNode];
        Arrays.fill(this.dist, (double) CHGraph.INFINITY);
        this.reset_dist = new ArrayList<>(numOfNode);
    }
}

