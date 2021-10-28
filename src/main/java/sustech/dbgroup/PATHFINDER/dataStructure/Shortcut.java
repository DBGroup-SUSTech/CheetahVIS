package sustech.dbgroup.PATHFINDER.dataStructure;

public class Shortcut extends Edge{
    int centerNode;
    int child_edge1;
    int child_edge2;

    public Shortcut(int id, int src_id, int tgt_id, double cost, int child_edge1, int child_edge2, int centerNode) {
        super(id, src_id, tgt_id, cost);
        this.child_edge1 = child_edge1;
        this.child_edge2 = child_edge2;
        this.centerNode = centerNode;
    }

    @Override
    public String toString() {
        return "Shortcut{" +
                "centerNode=" + centerNode +
                ", child_edge1=" + child_edge1 +
                ", child_edge2=" + child_edge2 +
                ", pb=" + pb +
                ", id=" + id +
                ", src_id=" + src_id +
                ", tgt_id=" + tgt_id +
                ", cost=" + cost +
                ", ne=" + ne +
                '}';
    }
}
