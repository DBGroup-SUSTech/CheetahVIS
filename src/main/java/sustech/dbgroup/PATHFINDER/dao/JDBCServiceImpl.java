package sustech.dbgroup.PATHFINDER.dao;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sustech.dbgroup.PATHFINDER.dao.util.TimeRangeQueryUtil;
import sustech.dbgroup.PATHFINDER.dataStructure.BusStop;
import sustech.dbgroup.PATHFINDER.dataStructure.MBR;
import sustech.dbgroup.PATHFINDER.dataStructure.PointQuery;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class JDBCServiceImpl {
    @Autowired
    JdbcTemplate jdbcTemplate;
    ArrayList<PointQuery> srcPoint = new ArrayList<>();
    ArrayList<PointQuery> dstPoint = new ArrayList<>();
    boolean srcflagst = true;
    boolean dstflagst = true;

    public ArrayList<PointQuery> getsrcPoint() {
        return srcPoint;
    }

    public ArrayList<PointQuery> getdstPoint() {
        return dstPoint;
    }

    @Transactional
    public List<BusStop> getStops(String lineId) {
        String sql = "SELECT * FROM LINES_STOPS_INFO WHERE LINE_ID = ? ORDER BY SEQUENCE";
        List<BusStop> stops = jdbcTemplate.query(sql, new BeanPropertyRowMapper(BusStop.class), lineId);
//        System.out.println( lineId + "stops: ");
//        stops.forEach(System.out::println);
        return stops;
    }

    //画每条轨迹对应的直方图, 从BUS_TIME_DISTRI取数据
    @Transactional
    public List<Map<String, Object>> getBuslineInfo() {
        String sql = "SELECT * FROM BUS_TIME_DISTRI";
        List<Map<String, Object>> list = jdbcTemplate.queryForList(sql);
        return list;
    }


    @Transactional
    public List<Map<String, Object>> selectSubTraj(String startTime, String endTime) {
        //String sql = "SELECT NEW_TRAJ_ID, PLATE_NUM, LATITUDE, LONGITUDE, TIME, LINE_ID, STATION_NUM, AVG_SPEED FROM BUS_GPS_TRAJ_NEW WHERE time " +
        //        "BETWEEN ? AND ? and MOVING = 1 ORDER BY PLATE_NUM, time limit 300000";
        //List<Map<String, Object>> list = jdbcTemplate.queryForList(sql, startTime, endTime);
        //List<Map<String, Object>> list = jdbcTemplate.queryForList(sql, startTime, endTime);
        List<Map<String, Object>> list = new TimeRangeQueryUtil().query(startTime, endTime);
        return list;
    }

    @Transactional
    public List<Map<String, Object>> bus_run_time() {
        String sql = "SELECT LINE_ID, TI_INTERVAL, AVG(RUN_TIME) FROM BUS_RUN_TIME GROUP BY LINE_ID, TI_INTERVAL";
        List<Map<String, Object>> list = jdbcTemplate.queryForList(sql);

        return list;
    }

    @Transactional
    public List<Map<String, Object>> selectStation() {
        //String sql = "SELECT LATITUDE, LONGITUDE, STATION FROM METRO_STATION_84 GROUP BY LATITUDE, LONGITUDE";
        String sql = "SELECT LATITUDE, LONGITUDE, STATION FROM METRO_STATION_84 GROUP BY LATITUDE, LONGITUDE";
        List<Map<String, Object>> list = jdbcTemplate.queryForList(sql);
        return list;
    }

    public List<Map<String, Object>> selectLines() {
        String sql = "SELECT KEYWORD, POLYLINE FROM BUS_LINES_84";
        List<Map<String, Object>> list = jdbcTemplate.queryForList(sql);
        return list;
    }

    public List<Map<String, Object>> getbusStationInfo() {
        String sql = "SELECT * FROM BUS_STATION_INFO";
        List<Map<String, Object>> list = jdbcTemplate.queryForList(sql);
        return list;
    }

    @Transactional
    public List<Map<String, Object>> selectMultTrang(ArrayList<MBR> queryList, String timeId) {
        String sql = "select distinct(TRAJ_ID) from BUS_GPS_TRAJ where (LONGITUDE BETWEEN ? AND ?) AND (LATITUDE BETWEEN ? AND ?) AND TRAJ_ID in" + timeId + ";";

        String[] listmp = {String.valueOf(queryList.get(0).getLng1()), String.valueOf(queryList.get(0).getLng2()), String.valueOf(queryList.get(0).getLat1()), String.valueOf(queryList.get(0).getLat2())};
        List<Map<String, Object>> list = jdbcTemplate.queryForList(sql, listmp);
        ArrayList<String> idtmp = new ArrayList<>();
        for (Map<String, Object> m : list) {
            idtmp.add(m.get("TRAJ_ID").toString());
        }
        for (int i = 1; i < queryList.size(); i++) {
//            System.out.println("***" + idtmp.size());
            MBR mbrtmp = queryList.get(i);
            listmp = new String[]{String.valueOf(mbrtmp.getLng1()), String.valueOf(mbrtmp.getLng2()), String.valueOf(mbrtmp.getLat1()), String.valueOf(mbrtmp.getLat2())};
            list = jdbcTemplate.queryForList(sql, listmp);
            ArrayList<String> tmplisttraj = new ArrayList<>();
            for (Map<String, Object> m : list) {

                String strID = (m.get("TRAJ_ID").toString());
                if (idtmp.contains(strID)) {
                    tmplisttraj.add(strID);
                }
            }
            idtmp.clear();
            idtmp.addAll(tmplisttraj);
        }
        String idstr = "(";
        if (idtmp.size() > 0) {
            for (int i = 0; i < idtmp.size() - 1; i++) {
                idstr += idtmp.get(i);
                idstr += ",";
            }
            idstr += idtmp.get(idtmp.size() - 1);
            idstr += ")";
        } else {
            idstr = "(-1)";
        }
        String sqlres = "SELECT TRAJ_ID, LATITUDE, LONGITUDE, time, LINE_ID FROM BUS_GPS_TRAJ WHERE TRAJ_ID in " + idstr + " ORDER BY PLATE_NUM, time LIMIT 100000";
//        List<PointQuery> res = jdbcTemplate.query(sql, new BeanPropertyRowMapper(PointQuery.class));
        List<Map<String, Object>> res = jdbcTemplate.queryForList(sqlres);
        return res;
    }


    @Transactional
    public String timeTrajId(String startTime, String endTime) {
        String sql = "SELECT distinct(TRAJ_ID) FROM BUS_GPS_TRAJ WHERE time " +
                "BETWEEN ? AND ? ORDER BY PLATE_NUM, time LIMIT 100000";
        List<Map<String, Object>> list = jdbcTemplate.queryForList(sql, startTime, endTime);
        StringBuilder idstr = new StringBuilder("(");
        if (list.size() > 0) {
            for (int i = 0; i < list.size() - 1; i++) {
                Map<String, Object> m = list.get(i);
                String strID = (m.get("TRAJ_ID").toString());
                idstr.append(strID);
                idstr.append(",");
            }
            idstr.append(list.get(list.size() - 1).get("TRAJ_ID").toString()).append(")");
            return idstr.toString();
        }
        return "(-1)";
    }


    public StringBuilder subTraj(ArrayList<MBR> queryList, String startime, String endtime) {
        srcPoint.clear();
        dstPoint.clear();
        String timeTrajid = timeTrajId(startime, endtime);
        List<Map<String, Object>> Traj = selectMultTrang(queryList, timeTrajid);
//        System.out.println(Traj.size());
        if (Traj.size() == 0)
            return null;
        for (Map<String, Object> m : Traj) {
            System.out.println(m.get("LINE_ID").toString());
        }
        String curId = String.valueOf(Traj.get(0).get("TRAJ_ID"));
        ArrayList<ArrayList<PointQuery>> res = new ArrayList<>();
        ArrayList<PointQuery> tmp = new ArrayList<>();
        DateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        for (Map<String, Object> m : Traj) {
            if (!(m.get("TRAJ_ID").toString().equals(curId))) {
//                    if(count >= 300)
//                        break;
                tmp.sort((o1, o2) -> {
                    Date dt1;
                    Date dt2;
                    int ret = 0;
                    try {
                        dt1 = df.parse(o1.gettime());
                        dt2 = df.parse(o2.gettime());
                        if (dt1.before(dt2))
                            ret = 1;
                        else ret = -1;
                    } catch (ParseException e) {
                        e.printStackTrace();
                    }
                    return ret;
                });
                curId = m.get("TRAJ_ID").toString();
                res.add(tmp);
                ArrayList<PointQuery> tmp_2 = new ArrayList<>();
                tmp = tmp_2;
            }
            tmp.add(new PointQuery(Integer.valueOf(m.get("TRAJ_ID").toString()), Double.valueOf(m.get("LATITUDE").toString()), Double.valueOf(m.get("LONGITUDE").toString()), m.get("time").toString()));
        }


        StringBuilder dir = new StringBuilder();//储存最终的结果
        StringBuilder opdir = new StringBuilder();
        boolean dirflag = true;//正方向
        dir.append("[");
        opdir.append("[");
        for (ArrayList<PointQuery> trajtmp : res) {

            dirflag = true;
            srcflagst = true;
            dstflagst = true;
            ;
            int count = 0;
            for (PointQuery p : trajtmp) {
                if (isIntect(p, queryList))
                    count++;
            }
            for (int i = 0; i < trajtmp.size(); i++) {
                if (isIntectSingle(trajtmp.get(i), queryList.get(0))) {//起点第一个框
                    if (isIntect(trajtmp.get(i), queryList)) {
                        while (count > 0) {
                            dir.append("[").append(trajtmp.get(i).getLATITUDE().toString()).append(",")
                                    .append(trajtmp.get(i).getLongitude().toString()).append("]").append(",");
                            if (isIntect(trajtmp.get(i), queryList)) {
                                count--;
                            }
                            i++;
                        }
                        dir.deleteCharAt(dir.length() - 1);
                        break;
                    }
                } else {//反向
                    dirflag = false;
                    if (isIntect(trajtmp.get(i), queryList)) {
                        while (count > 0) {
                            opdir.append("[").append(trajtmp.get(i).getLATITUDE().toString()).append(",")
                                    .append(trajtmp.get(i).getLongitude().toString()).append("]").append(",");
                            if (isIntect(trajtmp.get(i), queryList)) {
                                count--;
                            }
                            i++;
                        }
                        opdir.deleteCharAt(opdir.length() - 1);
                        break;
                    }

                }
            }
            if (dirflag) {
                dir.append("]\n[");
            } else opdir.append("]\n[");
        }

        dir.deleteCharAt(dir.length() - 1);
        opdir.deleteCharAt(opdir.length() - 1);

        System.out.println(srcPoint.size() + "--" + dstPoint.size());
//        System.out.println(sb);
        if (srcPoint.size() == 0)
            dir = new StringBuilder("NO_TRAJ");
        if (dstPoint.size() == 0)
            opdir = new StringBuilder("NO_TRAJ");
        return dir.append("--").append(opdir);
    }

    private boolean isIntectSingle(PointQuery p, MBR m) {
        if (p.getLATITUDE() >= m.getLat1() && p.getLATITUDE() <= m.getLat2()) {
            if (p.getLongitude() <= m.getLng2() && p.getLongitude() >= m.getLng1())
                return true;
        }
        return false;

    }

    private boolean isIntect(PointQuery p, ArrayList<MBR> querylist) {
//        System.out.println(p);
        boolean res = false;
        for (MBR m : querylist) {
            if (p.getLATITUDE() >= m.getLat1() && p.getLATITUDE() <= m.getLat2()) {
                if (p.getLongitude() <= m.getLng2() && p.getLongitude() >= m.getLng1())
                    res = true;
                break;
            }
        }
        if (srcflagst && p.getLongitude() <= querylist.get(0).getLng2() && p.getLongitude() >= querylist.get(0).getLng1()) {
            if (p.getLATITUDE() >= querylist.get(0).getLat1() && p.getLATITUDE() <= querylist.get(0).getLat2()) {
                srcPoint.add(p);
                srcflagst = false;
            }
        }
        if (querylist.size() > 1) {
            int size = querylist.size() - 1;
            if (dstflagst && p.getLongitude() <= querylist.get(size).getLng2() && p.getLongitude() >= querylist.get(size).getLng1()) {
                if (p.getLATITUDE() >= querylist.get(size).getLat1() && p.getLATITUDE() <= querylist.get(size).getLat2()) {
                    dstPoint.add(p);
                    dstflagst = false;
                }


            }
        }
        return res;
    }


    //    @Transactional
//    public List<Map<String, Object>> selectMultTrang(ArrayList<MBR>queryList) {
//
//
//
//        String sql = "SELECT TRAJ_ID, LATITUDE, LONGITUDE FROM BUS_GPS_TRAJ WHERE time " +
//                "BETWEEN ? AND ? ORDER BY PLATE_NUM, time LIMIT 100000";
//        List<Map<String, Object>> list = jdbcTemplate.queryForList(sql, startTime, endTime);
//        return list;
//    }


//    @Transactional
//    public List<Map<String, Object>> selectMultTrang(ArrayList<MBR>queryList) {
//
//
//
//        String sql = "SELECT TRAJ_ID, LATITUDE, LONGITUDE FROM BUS_GPS_TRAJ WHERE time " +
//                "BETWEEN ? AND ? ORDER BY PLATE_NUM, time LIMIT 100000";
//        List<Map<String, Object>> list = jdbcTemplate.queryForList(sql, startTime, endTime);
//        return list;
//    }
}
