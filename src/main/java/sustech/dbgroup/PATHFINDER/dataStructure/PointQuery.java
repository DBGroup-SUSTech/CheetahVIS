package sustech.dbgroup.PATHFINDER.dataStructure;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Lazy;

public class PointQuery {

    private Integer TRAJ_ID;
    private Double LATITUDE;
    private Double longitude;
    private String time;

    public PointQuery(Integer TRAJ_ID, Double LATITUDE, Double LONGITUDE, String time) {
        this.TRAJ_ID = TRAJ_ID;
        this.LATITUDE = LATITUDE;
        this.longitude = LONGITUDE;
        this.time = time;

    }

    public Integer getTRAJ_ID() {
        return TRAJ_ID;
    }

    public void setTRAJ_ID(Integer TRAJ_ID) {
        this.TRAJ_ID = TRAJ_ID;
    }

    public Double getLATITUDE() {
        return LATITUDE;
    }

    public void setLATITUDE(Double LATITUDE) {
        this.LATITUDE = LATITUDE;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }


    public String gettime() {
        return time;
    }

    public void settime(String time) {
        this.time = time.substring(0, time.toString().indexOf('.'));
    }

    @Override
    public String toString() {
        return "PointQuery{" +
                "TRAJ_ID=" + TRAJ_ID +
                ", LATITUDE=" + LATITUDE +
                ", longitude=" + longitude +
                ", timee=" + time +
                '}';
    }

    public String renformat() {
        return "[" + LATITUDE + "," + longitude + "]";

    }
}
