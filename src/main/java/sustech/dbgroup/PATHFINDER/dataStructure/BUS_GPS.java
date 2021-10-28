package sustech.dbgroup.PATHFINDER.dataStructure;

import java.sql.Timestamp;

public class BUS_GPS {
    private Timestamp time;
    private String PLATE_NUM;
    private String LINE_ID;
    private double LONGITUDE;
    private double LATITUDE;
    private double DIRECTION;
    private int TRAJ_ID;
    private double v1;
    private double v2;
    private int MOVING;
    private int NEW_TRAJ_ID;
    private int STATION_NUM;
    private double AVG_SPEED;

    public BUS_GPS(Timestamp time, String PLATE_NUM, String LINE_ID, double LONGITUDE, double LATITUDE, double DIRECTION, int TRAJ_ID, double v1, double v2, int MOVING, int NEW_TRAJ_ID, int STATION_NUM, double AVG_SPEED) {
        this.time = time;
        this.PLATE_NUM = PLATE_NUM;
        this.LINE_ID = LINE_ID;
        this.LONGITUDE = LONGITUDE;
        this.LATITUDE = LATITUDE;
        this.DIRECTION = DIRECTION;
        this.TRAJ_ID = TRAJ_ID;
        this.v1 = v1;
        this.v2 = v2;
        this.MOVING = MOVING;
        this.NEW_TRAJ_ID = NEW_TRAJ_ID;
        this.STATION_NUM = STATION_NUM;
        this.AVG_SPEED = AVG_SPEED;
    }

    public Timestamp getTime() {
        return time;
    }

    public void setTime(Timestamp time) {
        this.time = time;
    }

    public String getPLATE_NUM() {
        return PLATE_NUM;
    }

    public void setPLATE_NUM(String PLATE_NUM) {
        this.PLATE_NUM = PLATE_NUM;
    }

    public String getLINE_ID() {
        return LINE_ID;
    }

    public void setLINE_ID(String LINE_ID) {
        this.LINE_ID = LINE_ID;
    }

    public double getLONGITUDE() {
        return LONGITUDE;
    }

    public void setLONGITUDE(double LONGITUDE) {
        this.LONGITUDE = LONGITUDE;
    }

    public double getLATITUDE() {
        return LATITUDE;
    }

    public void setLATITUDE(double LATITUDE) {
        this.LATITUDE = LATITUDE;
    }

    public double getDIRECTION() {
        return DIRECTION;
    }

    public void setDIRECTION(double DIRECTION) {
        this.DIRECTION = DIRECTION;
    }

    public int getTRAJ_ID() {
        return TRAJ_ID;
    }

    public void setTRAJ_ID(int TRAJ_ID) {
        this.TRAJ_ID = TRAJ_ID;
    }

    public double getV1() {
        return v1;
    }

    public void setV1(double v1) {
        this.v1 = v1;
    }

    public double getV2() {
        return v2;
    }

    public void setV2(double v2) {
        this.v2 = v2;
    }

    public int getMOVING() {
        return MOVING;
    }

    public void setMOVING(int MOVING) {
        this.MOVING = MOVING;
    }

    public int getNEW_TRAJ_ID() {
        return NEW_TRAJ_ID;
    }

    public void setNEW_TRAJ_ID(int NEW_TRAJ_ID) {
        this.NEW_TRAJ_ID = NEW_TRAJ_ID;
    }

    public int getSTATION_NUM() {
        return STATION_NUM;
    }

    public void setSTATION_NUM(int STATION_NUM) {
        this.STATION_NUM = STATION_NUM;
    }

    public double getAVG_SPEED() {
        return AVG_SPEED;
    }

    public void setAVG_SPEED(double AVG_SPEED) {
        this.AVG_SPEED = AVG_SPEED;
    }

    @Override
    public String toString() {
        return "BUS_GPS{" +
                "time='" + time + '\'' +
                ", PLATE_NUM='" + PLATE_NUM + '\'' +
                ", LINE_ID='" + LINE_ID + '\'' +
                ", LONGITUDE=" + LONGITUDE +
                ", LATITUDE=" + LATITUDE +
                ", DIRECTION=" + DIRECTION +
                ", TRAJ_ID=" + TRAJ_ID +
                ", v1=" + v1 +
                ", v2=" + v2 +
                ", MOVING=" + MOVING +
                ", NEW_TRAJ_ID=" + NEW_TRAJ_ID +
                ", STATION_NUM=" + STATION_NUM +
                ", AVG_SPEED=" + AVG_SPEED +
                '}';
    }
}

