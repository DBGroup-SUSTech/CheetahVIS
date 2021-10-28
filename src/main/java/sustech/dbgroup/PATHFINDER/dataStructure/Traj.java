package sustech.dbgroup.PATHFINDER.dataStructure;

import java.util.HashSet;

public class Traj {
    int id;
    HashSet<Integer> path;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public HashSet<Integer> getPath() {
        return path;
    }

    public void setPath(HashSet<Integer> path) {
        this.path = path;
    }

    @Override
    public String toString() {
        return "Traj{" +
                "id=" + id +
                ", path=" + path +
                '}';
    }
}
