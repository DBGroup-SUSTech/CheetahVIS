package sustech.dbgroup.PATHFINDER.dataStructure;

public class Edge {
    int id;
    int src_id;
    int tgt_id;
    double cost;
    double ne;
    MBR pb;

    public Edge(int id, int src_id, int tgt_id, double cost) {
        this.id = id;
        this.src_id = src_id;
        this.tgt_id = tgt_id;
        this.cost = cost;
        this.ne = 0;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getSrc_id() {
        return src_id;
    }

    public void setSrc_id(int src_id) {
        this.src_id = src_id;
    }

    public int getTgt_id() {
        return tgt_id;
    }

    public void setTgt_id(int tgt_id) {
        this.tgt_id = tgt_id;
    }

    public double getCost() {
        return cost;
    }

    public void setCost(double cost) {
        this.cost = cost;
    }

    public double getNe() {
        return ne;
    }

    public void setNe(double ne) {
        this.ne = ne;
    }

    public MBR getPb() {
        return pb;
    }

    public void setPb(MBR pb) {
        this.pb = pb;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof Edge){
            return (((Edge) obj).src_id == src_id && ((Edge) obj).tgt_id == tgt_id ) || (((Edge) obj).src_id == tgt_id && ((Edge) obj).tgt_id == src_id );
        }else return false;
    }

    @Override
    public String toString() {
        return "Edge{" +
                "id=" + id +
                ", src_id=" + src_id +
                ", tgt_id=" + tgt_id +
//                ", cost=" + cost +
//                ", ne=" + ne +
//                ", pb=" + pb +
                '}';
    }
}
