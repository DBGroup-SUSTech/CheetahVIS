package sustech.dbgroup.PATHFINDER.Controller;

import com.ning.compress.BufferRecycler;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import net.sf.json.JsonConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
//import sustech.dbgroup.PATHFINDER.dao.util.SparkSubmit;
import sustech.dbgroup.PATHFINDER.dao.util.RegionRangeQueryUtil;
import sustech.dbgroup.PATHFINDER.dao.util.TimeRangeQueryUtil;
import sustech.dbgroup.PATHFINDER.dao.util.TrajAnalysis;
import sustech.dbgroup.PATHFINDER.dao.JDBCServiceImpl;
import sustech.dbgroup.PATHFINDER.dataStructure.BusStop;
import sustech.dbgroup.PATHFINDER.dataStructure.MBR;
import sustech.dbgroup.PATHFINDER.dataStructure.PointQuery;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.text.ParsePosition;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

@Controller
public class SZBusController {

    @Autowired
    private JDBCServiceImpl jdbcService;
    private ArrayList<String> lineIdList;
    List<Map<String, Object>> res;
    List<Map<String, Object>> Buslines; // 公交线路
    List<Map<String, Object>> runtime; // 运营时间
    List<BusStop> busStops; //当前公交线路的车站信息


    public String getLineIdListStr() {
        String resStr = "";
        for (String str : lineIdList)
            resStr = resStr + str + ";";

        return resStr.substring(0, resStr.length() - 1);

    }

    //取出数据画每个公交站点的每个小时的临近车辆数。给定站点, 画出他的分布
    @RequestMapping(value = "/getbusStationInfo", method = RequestMethod.GET)
    public void getbusStationInfo(HttpServletRequest request, HttpServletResponse response) {
        try {
            List<Map<String, Object>> lines = jdbcService.getbusStationInfo();
            PrintWriter printWriter = response.getWriter();
            StringBuilder sb = new StringBuilder("");
            for (Map<String, Object> m : lines) {
                sb.append(m.get("LATITUDE").toString()).append(",").append(m.get("LONGITUDE").toString()).append(",");
                sb.append(m.get("NAME").toString()).append(",").append(m.get("INFO").toString()).append("\n");
            }
            // System.out.println(sb);
            printWriter.append(sb);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }


    //取出数据画直方图。给定line_id, 画出他的分布
    @RequestMapping(value = "/getbusline", method = RequestMethod.GET)
    public void getbusline(HttpServletRequest request, HttpServletResponse response) {
        try {
            List<Map<String, Object>> lines = jdbcService.getBuslineInfo();
            PrintWriter printWriter = response.getWriter();
            StringBuilder sb = new StringBuilder("");
            String curId = lines.get(0).get("LINE_ID").toString();
            sb.append(lines.get(0).get("LINE_ID").toString());
            sb.append(":");
            for (Map<String, Object> m : lines) {
                if (!(m.get("LINE_ID").toString().equals(curId))) {
                    sb.deleteCharAt(sb.length() - 1);
                    sb.append("\n");
                    curId = m.get("LINE_ID").toString();
                    sb.append(m.get("LINE_ID").toString());
                    sb.append(":");
                }
                sb.append(m.get("TIME").toString()).append(",").append(m.get("COUNT").toString()).append(";");

            }
            sb.deleteCharAt(sb.length() - 1);
            // System.out.println(sb);
            printWriter.append(sb);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @RequestMapping(value = "/getLineInfo", method = RequestMethod.GET)
    public void getLineInfo(HttpServletRequest request, HttpServletResponse response) throws IOException {
        PrintWriter printWriter = response.getWriter();
        printWriter.append(this.getLineIdListStr());
    }

    @RequestMapping(value = "/get_Station", method = RequestMethod.GET) //搜索时跳转的路由
    public void get_Station(HttpServletRequest request, HttpServletResponse response) {
//        long starttime = System.currentTimeMillis();
        try {
            List<Map<String, Object>> get_Station = jdbcService.selectStation();
            PrintWriter printWriter = response.getWriter();
            StringBuilder remstr = new StringBuilder("");
            for (Map<String, Object> m : get_Station) {
                remstr.append(m.get("LATITUDE").toString()).append(" ").append(m.get("LONGITUDE")).append(" ").append(m.get("STATION")).append("\n");
            }
            printWriter.append(URLEncoder.encode(remstr.toString(), "UTF-8"));

        } catch (Exception e) {
            e.printStackTrace();
        }
//        long endtime = System.currentTimeMillis();
//        System.out.println("Time that shows the heat map: " + (endtime - starttime) / 1000.0 + "s");
    }

    @RequestMapping(value = "/getLines", method = RequestMethod.GET)
    public void getLines(HttpServletRequest request, HttpServletResponse response) {
        try {
            Buslines = jdbcService.selectLines();
            PrintWriter printWriter = response.getWriter();
            for (Map<String, Object> m : Buslines) {
                printWriter.append(URLEncoder.encode(m.get("KEYWORD").toString(), "UTF-8")).append("\t");
                printWriter.append(m.get("POLYLINE").toString()).append("\n");
            }
            runtime = jdbcService.bus_run_time();
            printWriter.append("++++");
            for (Map<String, Object> m : runtime) {
                printWriter.append(m.get("LINE_ID").toString()).append("\t");
                printWriter.append(URLEncoder.encode(m.get("TI_INTERVAL").toString(), "UTF-8")).append("\t");
                printWriter.append(m.get("avg(RUN_TIME)").toString()).append("\n");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    //    @RequestMapping(value = "/bus_run_time", method = RequestMethod.GET)
//    public void bus_run_time(HttpServletRequest request, HttpServletResponse response) {
//        try {
//            lines = jdbcService.selectLines();
//            PrintWriter printWriter = response.getWriter();
//            for (Map<String, Object> m : lines) {
//                printWriter.append(URLEncoder.encode(m.get("TI_INTERVAL").toString(), "UTF-8")).append("\t");
//                printWriter.append(m.get("avg(RUN_TIME)").toString()).append("\n");
//            }
//        } catch (Exception e) {
//            e.printStackTrace();
//        }
//    }
    @RequestMapping("querysub")
    public void querySub(HttpServletRequest request, HttpServletResponse response) { //Time Search
        try {
            String final_str = URLDecoder.decode(request.getQueryString(), "UTF-8");
            System.out.println(final_str);
            String[] fin = final_str.split(";");
//            res = jdbcService.selectSubTraj(fin[0], fin[1]);
//            res = TimeRangeQueryUtil.getInstance().query(fin[0], fin[1]);
            res = TimeRangeQueryUtil.getInstance().query(fin[0], fin[1]);
            lineIdList = new ArrayList<>();
            for (Map<String, Object> m : res) {
                String lineid = m.get("LINE_ID").toString();
                if (!lineIdList.contains(lineid))
                    lineIdList.add(lineid);
            }
            lineIdList.add("81");
            System.out.println(lineIdList);
            PrintWriter printWriter = response.getWriter();
            fontendTrans(printWriter, res);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

//    @RequestMapping("querysub")
//    public void querySub(HttpServletRequest request, HttpServletResponse response) {
////        String startTime = "2016-01-01 00:00:00";
////        String endTime = "2016-01-01 23:59:59";
//        long starttime = System.currentTimeMillis();
//        try {
//            String final_str = URLDecoder.decode(request.getQueryString(), "UTF-8");
//            System.out.println(final_str);
//            if (final_str.split(";").length != 2) { //clear the res
//                res.clear();
//                return;
//            }
//            Set<String> line_onshow = new HashSet<>();
//            String[] fin = final_str.split(";");
////            System.out.println("************"+final_str);
//            res = jdbcService.selectSubTraj(fin[0], fin[1]);
////            System.out.println(res.get(0));
//            lineIdList = new ArrayList<>();
//            for (Map<String, Object> m : res) {
//                String lineid = m.get("LINE_ID").toString();
//                if (!lineIdList.contains(lineid))
//                    lineIdList.add(lineid);
//            }
//            PrintWriter printWriter = response.getWriter();
//            fontendTrans(printWriter, res);
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
//        long endtime = System.currentTimeMillis();
//        System.out.println("Query time: " + (endtime - starttime) / 1000.0 + "s");
//    }

    @RequestMapping(value = "/show_heatmap", method = RequestMethod.GET) //搜索时跳转的路由
    public void show_heatmap(HttpServletRequest request, HttpServletResponse response) {
        long starttime = System.currentTimeMillis();
        try {
            PrintWriter printWriter = response.getWriter();
            if (res == null || res.size() == 0) {
                printWriter.append("NO_POINT");
                return;
            }
            StringBuilder remstr = new StringBuilder("");
            for (Map<String, Object> m : res) {
                remstr.append(m.get("LATITUDE").toString()).append(" ").append(m.get("LONGITUDE")).append("\n");
            }
            printWriter.append(remstr);
        } catch (Exception e) {
            e.printStackTrace();
        }
        long endtime = System.currentTimeMillis();
        System.out.println("Time that shows the heat map: " + (endtime - starttime) / 1000.0 + "s");
    }


    @RequestMapping(value = "/queryline", method = RequestMethod.GET) //搜索时跳转的路由
    public void queryline(HttpServletRequest request, HttpServletResponse response) {
        try {
            PrintWriter printWriter = response.getWriter();
            if (res == null || res.size() == 0) {
                printWriter.append("NO_this_Line");
                return;
            }

            String queryLineId = URLDecoder.decode(request.getQueryString(), "UTF-8");
            busStops = jdbcService.getStops(queryLineId);
            if (busStops == null || busStops.size() == 0) {
                printWriter.append("NO_this_Line");
                return;
            }

            JSONObject jsonObject = new JSONObject();
            List<Map<String, Object>> queryLine = Buslines.parallelStream()
                    .filter(e -> e.get("KEYWORD").equals(queryLineId))
                    .collect(Collectors.toList());
            if (queryLine.size() == 0) {
                printWriter.append("NO_this_Line");
                return;
            } else {
                Map<String, Object> m = queryLine.get(0);
                jsonObject.put("lineid", m.get("KEYWORD").toString());
                jsonObject.put("polyline", m.get("POLYLINE").toString().trim());
            }
            JsonConfig jsonConfig = new JsonConfig();
            jsonConfig.setExcludes(new String[]{"LINE_ID"});
            jsonObject.put("busstops", JSONArray.fromObject(busStops, jsonConfig));

            int[] busConutMap = new int[busStops.size()];
            Arrays.fill(busConutMap, 0);

            List<Map<String, Object>> stationNumsByLine = res.parallelStream()
                    .filter(e -> e.get("LINE_ID").equals(queryLineId))
                    .collect(Collectors.toList());
//            stationNumsByLine.forEach(System.out::println);
            List<Long>[] runtimeList = new LinkedList[busStops.size()];
            for (int i = 0; i < busStops.size(); i++)
                runtimeList[i] = new LinkedList<>();

            String curPlate = "";
            String curStation = "";
            String curTime = "";
            for (Map<String, Object> m : stationNumsByLine) {
                if (!curPlate.equals(m.get("PLATE_NUM").toString())) {
                    curStation = m.get("STATION_NUM").toString();
                    curPlate = m.get("PLATE_NUM").toString();
                    curTime = m.get("TIME").toString();
                } else {
                    int minStation = Math.min(Integer.parseInt(curStation), Integer.parseInt(m.get("STATION_NUM").toString()));
                    int maxStation = Math.max(Integer.parseInt(curStation), Integer.parseInt(m.get("STATION_NUM").toString()));
                    if (maxStation - minStation < 3)
                        for (int i = minStation + 1; i <= maxStation; i++) {
                            ++busConutMap[i];
                        }
                    SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.S");
                    if (!curStation.equals(m.get("STATION_NUM").toString())) {
                        if (maxStation - minStation == 1) {
                            runtimeList[minStation]
                                    .add(format.parse(m.get("TIME").toString(), new ParsePosition(0)).getTime() / 1000
                                            - format.parse(curTime, new ParsePosition(0)).getTime() / 1000);
                            curTime = m.get("TIME").toString();
                        } else {
                            curTime = m.get("TIME").toString();
                        }
                    }
                    curStation = m.get("STATION_NUM").toString();
                    curPlate = m.get("PLATE_NUM").toString();
                }
            }
            int[] intervalRuntime = new int[busStops.size()];
            for (int i = 0; i < busStops.size(); i++) {
                intervalRuntime[i] = (int) (runtimeList[i].parallelStream().mapToDouble(a -> a).average().orElse(0));
            }

            jsonObject.element("busCount", JSONArray.fromObject(Arrays.copyOfRange(busConutMap, 0, busConutMap.length - 2)));
            jsonObject.element("runtimeData", JSONArray.fromObject(intervalRuntime));
            printWriter.append(URLEncoder.encode(jsonObject.toString(), "UTF-8"));


        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @RequestMapping(value = "/queryid", method = RequestMethod.GET) //搜索时跳转的路由
    public void queryid(HttpServletRequest request, HttpServletResponse response) {
        long starttime = System.currentTimeMillis();
        try {
            PrintWriter printWriter = response.getWriter();
            InputStream inputStream = getClass().getResourceAsStream("/static/path81_clear.txt");
                 BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
                String contents = reader.lines()
                        .collect(Collectors.joining(System.lineSeparator()));
//                System.out.println(contents);
            printWriter.append(contents);
            /*
            List<Map<String, Object>> res_line = new ArrayList<>();
            PrintWriter printWriter = response.getWriter();
            if (res == null || res.size() == 0) {
                printWriter.append("NO_this_Line");
                return;
            }
            String lineId = URLDecoder.decode(request.getQueryString(), "UTF-8");
            int flag1 = 0;
            for (Map<String, Object> m : Buslines) {
                if (lineId.equals(m.get("KEYWORD"))) {
                    printWriter.append(URLEncoder.encode(m.get("KEYWORD").toString(), "UTF-8")).append("\t");
                    printWriter.append(m.get("POLYLINE").toString()).append("\n");
                    flag1 = 1;
                }
            }
            if (flag1 == 0) {
                printWriter.append("NO_this_Line");
                return;
            }


            int flag = 0;
            for (Map<String, Object> m : res) {
                if (lineId.equals(m.get("LINE_ID").toString())) {
                    flag = 1;
                    res_line.add(m);
                }
            }
            System.out.println("res size: " + res.size());
            System.out.println("res line size:" + res_line.size());
            if (flag == 0) {
                printWriter.append("NO_this_Line");
                return;
            }
            int count = 0;
            StringBuilder sb = new StringBuilder("");
            String curId = res_line.get(0).get("PLATE_NUM").toString();
            for (Map<String, Object> m : res_line) {
                if (!(m.get("PLATE_NUM").toString().equals(curId))) {
                    count++;
                    sb.deleteCharAt(sb.length() - 1);
                    sb.append("\n");
                    curId = m.get("PLATE_NUM").toString();
                }
                long time = (new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss")).parse(m.get("TIME").toString(), new ParsePosition(0)).getTime();
                sb.append(m.get("LATITUDE").toString()).append(",")
                        .append(m.get("LONGITUDE").toString())
                        .append(",").append(time)
                        .append(",").append(URLEncoder.encode(m.get("PLATE_NUM").toString(), "UTF-8"))
                        .append(",").append(m.get("v1").toString()).append(";");
            }
            System.out.println(count);
            sb.deleteCharAt(sb.length() - 1);
            printWriter.append(sb);
             */
        } catch (Exception e) {
            e.printStackTrace();
        }
        long endtime = System.currentTimeMillis();
        System.out.println("Time that Query line id: " + (endtime - starttime) / 1000.0 + "s");
    }

    @RequestMapping(value = "/trajTran", method = RequestMethod.GET)
    public void trajTran(HttpServletRequest request, HttpServletResponse response) throws IOException, InterruptedException { // Region Search
        String restr = URLDecoder.decode(request.getQueryString(), "UTF-8");
        String[] querylist = restr.split("--")[0].split("p");
        StringBuilder quertRes = new StringBuilder();
        for (String e : querylist) {
            String[] mbrlist = e.split(",");
            MBR quer = new MBR(Double.parseDouble(mbrlist[0]),
                    Double.parseDouble(mbrlist[1]), Double.parseDouble(mbrlist[2]), Double.parseDouble(mbrlist[3]));
            quertRes.append(quer.getLng1()).append(",").append(quer.getLng2()).append(",").append(quer.getLat1()).append(",").append(quer.getLat2()).append("p");
        }
        quertRes.deleteCharAt(quertRes.length() - 1);
        HashSet<String> result = RegionRangeQueryUtil.getInstance().query(quertRes.toString());
        ArrayList<String> trajRes = new TrajAnalysis(new ArrayList<>(result)).AnalysisTraj();
        StringBuilder res = new StringBuilder();
        int countFlag = 1000;
        for (String s : trajRes) {
            res.append(s);
            countFlag--;
            if (countFlag < 0)
                break;
        }
//        JSONObject jsonObject = new JSONObject();
//        jsonObject.put("trajectory", JSONArray.fromObject(trajRes));
        PrintWriter printWriter = response.getWriter();
        printWriter.append(res.toString());


        //SparkSubmit spark = SparkSubmit.getInstance();
        //spark.submitRegionRangeQuery(quertRes);

//        } catch (Exception e) {
//            e.printStackTrace();
//        }
    }

    @RequestMapping(value = "/src_dstPoint", method = RequestMethod.GET) //搜索时跳转的路由
    public void srcDst(HttpServletRequest request, HttpServletResponse response) {
        try {
            ArrayList<PointQuery> src = jdbcService.getsrcPoint();
            ArrayList<PointQuery> dst = jdbcService.getdstPoint();
            StringBuilder res = new StringBuilder();
            for (PointQuery p : src) {
                res.append(p.renformat());
                res.append(";");
            }
            if (res.length() > 0)
                res.deleteCharAt(res.length() - 1);
            res.append("--");
            for (PointQuery p : dst) {
                res.append(p.renformat());
                res.append(";");
            }
            if (res.length() > 2)
                res.deleteCharAt(res.length() - 1);
//            res = jdbcService.selectMultTrang(querymbr);
            PrintWriter printWriter = response.getWriter();
//            fontendTrans(printWriter, res);
            if (res.equals(""))
                printWriter.append("NO_TRAJ");
            else
                printWriter.append(res);
            System.out.println("send successfully");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void fontendTrans(PrintWriter printWriter, List<Map<String, Object>> res) {
        if (res.size() == 0) {
            printWriter.append("NO_TRAJ");
            return;
        }
        String curId = String.valueOf(res.get(0).get("NEW_TRAJ_ID"));
        int count = 0;
        StringBuilder sb = new StringBuilder("[");
        for (Map<String, Object> m : res) {
            if (!(m.get("NEW_TRAJ_ID").toString().equals(curId))) {
                count++;
                if (count >= 1000)
                    break;
                sb.deleteCharAt(sb.length() - 1);
                sb.append("]\n[");
                curId = m.get("NEW_TRAJ_ID").toString();
            }
            sb.append("[").append(String.valueOf(m.get("LATITUDE"))).append(",")
                    .append(m.get("LONGITUDE")).append("]").append(",");
        }
        System.out.println(count);
        long starttran = System.currentTimeMillis();
        sb.deleteCharAt(sb.length() - 1);
        sb.append("]");
        printWriter.append(sb);
        System.out.println("发送时间：" + (System.currentTimeMillis() - starttran) + "ms");

    }

//    @RequestMapping(value = "/sparktimerange", method = RequestMethod.GET) //搜索时跳转的路由
//    public void sparktimerange(HttpServletRequest request, HttpServletResponse response) throws IOException, InterruptedException {
//        String querylist = URLDecoder.decode(request.getQueryString(), "UTF-8");
//        SparkSubmit spark = SparkSubmit.getInstance();
//        spark.submitTimeRangeQuery(querylist);
//    }


}
