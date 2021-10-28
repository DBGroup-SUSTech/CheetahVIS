package sustech.dbgroup.PATHFINDER.dataStructure;

public class GeoPoint {
    String plateNum;
    String time;
    double lat;
    double lng;

    public GeoPoint(String plateNum, String time, double lat, double lng) {
        this.plateNum = plateNum;
        this.time = time;
        this.lat = lat;
        this.lng = lng;
    }

    public GeoPoint() {
    }

    @Override
    public String toString() {
        return "GeoPoint{" +
                "plateNum='" + plateNum + '\'' +
                ", time='" + time + '\'' +
                ", lat=" + lat +
                ", lng=" + lng +
                '}';
    }
}
