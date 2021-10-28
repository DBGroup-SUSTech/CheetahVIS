package sustech.dbgroup.PATHFINDER.dataStructure;

import static java.lang.Math.*;

public class MBR {
    double lat1;
    double lng1;
    double lat2;
    double lng2;

    //  lat1 <= lat2; lng1 <= lng2

    public MBR(double lat1, double lng1, double lat2, double lng2) {
        this.lat1 = Math.min(lat1, lat2);
        this.lng1 = Math.min(lng1, lng2);
        this.lat2 = Math.max(lat1, lat2);
        this.lng2 = Math.max(lng1, lng2);
    }

    public double getLat1() {
        return lat1;
    }

    public void setLat1(double lat1) {
        this.lat1 = lat1;
    }

    public double getLng1() {
        return lng1;
    }

    public void setLng1(double lng1) {
        this.lng1 = lng1;
    }

    public double getLat2() {
        return lat2;
    }

    public void setLat2(double lat2) {
        this.lat2 = lat2;
    }

    public double getLng2() {
        return lng2;
    }

    public void setLng2(double lng2) {
        this.lng2 = lng2;
    }

    public boolean intersect(MBR m) {
        return min(this.lng2, m.lng2) >= max(this.lng1, m.lng1) && min(this.lat2, m.lat2) >= max(this.lat1, m.lat1);
    }

    public MBR join(MBR m) {
        return new MBR(Math.min(this.lat1, m.lat1), Math.min(this.lng1, m.lng1), Math.max(this.lat2, m.lat2), Math.max(this.lng2, m.lng2));
    }

    public boolean contains(MBR mbr){
        return lat1 <= mbr.lat1 && lat2 >= mbr.lat2 && lng1 <= mbr.lng1 && lng2 >= mbr.lng2;
    }

    @Override
    public String toString() {
        return "MBR{" +
                "lat1=" + lat1 +
                ", lng1=" + lng1 +
                ", lat2=" + lat2 +
                ", lng2=" + lng2 +
                '}';
    }
}
