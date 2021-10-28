package sustech.dbgroup.PATHFINDER.dataStructure;

public class BusStop {
    private String LINE_ID;
    private String NAME;
    private int SEQUENCE;
    private double LONGITUDE;
    private double LATITUDE;
    private int DESTINATION;

    public String getLINE_ID() {
        return LINE_ID;
    }

    public void setLINE_ID(String LINE_ID) {
        this.LINE_ID = LINE_ID;
    }

    public String getNAME() {
        return NAME;
    }

    public void setNAME(String NAME) {
        this.NAME = NAME;
    }

    public int getSEQUENCE() {
        return SEQUENCE;
    }

    public void setSEQUENCE(int SEQUENCE) {
        this.SEQUENCE = SEQUENCE;
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

    public int getDESTINATION() {
        return DESTINATION;
    }

    public void setDESTINATION(int DESTINATION) {
        this.DESTINATION = DESTINATION;
    }

    @Override
    public String toString() {
        return "BusStop{" +
                "LINE_ID='" + LINE_ID + '\'' +
                ", NAME='" + NAME + '\'' +
                ", SEQUENCE=" + SEQUENCE +
                ", LONGITUDE=" + LONGITUDE +
                ", LATITUDE=" + LATITUDE +
                ", DESTINATION=" + DESTINATION +
                '}';
    }
}
