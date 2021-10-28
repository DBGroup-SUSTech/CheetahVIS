package sustech.dbgroup.PATHFINDER.dataStructure;

class PQElement implements Comparable<PQElement> {
    int node;
    double cost;

    public PQElement(int node, double cost) {
        this.node = node;
        this.cost = cost;
    }

    public int getNode() {
        return node;
    }

    public void setNode(int node) {
        this.node = node;
    }

    public double getCost() {
        return cost;
    }

    public void setCost(double cost) {
        this.cost = cost;
    }

    @Override
    public int compareTo(PQElement o) {
        if (this.cost - o.cost > 0)
            return 1;
        else if (this.cost == o.cost)
            return 0;
        else
            return -1;
    }
}
