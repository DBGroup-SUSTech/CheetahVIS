package sustech.dbgroup.PATHFINDER.dao.util;

import java.util.ArrayList;

public class TrajAnalysis {
    private ArrayList<String> TrajList;
    private ArrayList<String> TrajRes;

    public TrajAnalysis(ArrayList<String> TrajList) {
        this.TrajList = TrajList;
        TrajRes = new ArrayList<>();
    }

    public ArrayList<String> getTrajList() {
        return TrajList;
    }

    public ArrayList<String> getTrajRes() {
        return TrajRes;
    }

    public void setTrajList(ArrayList<String> trajList) {
        TrajList = trajList;
    }

    public ArrayList<String> AnalysisTraj() {
        for (String Traj : this.TrajList) {
            String[] infoList = Traj.split(", ");
            StringBuilder traj = new StringBuilder("[");
            for (String lalnInfo : infoList) {
                String[] tempAry = lalnInfo.split(" ");
                traj.append("[").append(tempAry[1]).append(",").append(tempAry[0]).append("],");
            }
            traj.deleteCharAt(traj.length() - 1);
            traj.append("]\n");
            this.TrajRes.add(traj.toString());
        }
        return this.TrajRes;
    }
}
