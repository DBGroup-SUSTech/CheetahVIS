package sustech.dbgroup.PATHFINDER.Controller;

import net.sf.json.JSONArray;
import net.sf.json.JsonConfig;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import sustech.dbgroup.PATHFINDER.Processor;
import sustech.dbgroup.PATHFINDER.dataStructure.MBR;
import sustech.dbgroup.PATHFINDER.dataStructure.Node;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.File;
import java.io.FileInputStream;
import java.io.PrintWriter;
import java.net.URLDecoder;
import java.util.*;

@Controller
public class UserController {

    @RequestMapping(value = "/search", method = RequestMethod.GET) //搜索时跳转的路由
    public void search(HttpServletRequest request, HttpServletResponse response) {
        try {
            long starttime = System.currentTimeMillis();
            String[] latlngs = URLDecoder.decode(request.getQueryString(), "UTF-8").split(";");
            ArrayList<MBR> querymbr = new ArrayList<>();
            for (String e : latlngs) {
                String mbrlist[] = e.split(",");
                MBR quer = new MBR(Double.parseDouble(mbrlist[0]),
                        Double.parseDouble(mbrlist[1]), Double.parseDouble(mbrlist[2]), Double.parseDouble(mbrlist[3]));
                querymbr.add(quer);
                System.out.println(quer);
            }
            HashMap<Integer, ArrayList<Node>> trajs = Processor.querySubTrajs(querymbr);
//            HashMap<Integer,ArrayList<Node>> trajs = Processor.multQuery(querymbr);
//            ArrayList<HashMap<Integer,ArrayList<Node>>> trajs = Processor.queryEdgesOfOneMBR(querymbr);
            ArrayList<ArrayList<Node>> traj_node = new ArrayList<>();
            ArrayList<String> trajs_id = new ArrayList<>();



            for (Map.Entry<Integer, ArrayList<Node>> integerArrayListEntry : trajs.entrySet()) {
                Map.Entry element = (Map.Entry) integerArrayListEntry;
                trajs_id.add(String.valueOf(element.getKey()));
                ArrayList<Node> tmptmp = (ArrayList<Node>) element.getValue();
                traj_node.add(tmptmp);
            }
//            ArrayList<ArrayList<Node>> trajs = Processor.query(Double.parseDouble(latlngs[1]), Double.parseDouble(latlngs[0]), Double.parseDouble(latlngs[5]), Double.parseDouble(latlngs[4]));
            JsonConfig jsonConfig = new JsonConfig();
            jsonConfig.setExcludes(new String[]{"id", "neighborNodes", "neighborEdges", "db", "level"});
            PrintWriter printWriter = response.getWriter();
            String final_traj_id = "";
            int num_traj_show = 10; //要展示的轨迹数量，之前defaul是100条，现在20。
            if (traj_node.size() > 0) {
                if (traj_node.size() <= num_traj_show) {
                    for (int i = 0; i < trajs.size(); i++) {
                        final_traj_id = getString(traj_node, trajs_id, jsonConfig, printWriter, final_traj_id, i);
                    }
                } else {
                    for (int i : getRandomNumList(num_traj_show, 0, traj_node.size())) {
                        final_traj_id = getString(traj_node, trajs_id, jsonConfig, printWriter, final_traj_id, i);
                    }
                }
                printWriter.append(final_traj_id).append(String.valueOf(trajs.size()));
            } else {
                printWriter.append("NOTRAJ");
            }

            long endtime = System.currentTimeMillis();
            System.out.println("total time " + (endtime - starttime) / 1000.0 + "s");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    /*
    @RequestMapping(value = "/show_heatmap", method = RequestMethod.GET) //搜索时跳转的路由
    public void show_heatmap(HttpServletRequest request, HttpServletResponse response) {
        long starttime = System.currentTimeMillis();
        try {
            //Add heatmap!!!!!!!!!!!
            Scanner in = new Scanner(new File("data/STRING_20160101.txt"));
            PrintWriter printWriter = response.getWriter();
            System.out.println("enter show_heatmap");
            String teststr = "";
            int count = 0;
            while (count < 20000) {
                System.out.println(count++);
                String str = in.nextLine();
                String[] tmp = str.split(";");
                if(tmp.length > 5) {
                    teststr += String.valueOf(tmp[3] + " " + tmp[4] + "\n");
                }
            }

            printWriter.append(teststr);
        } catch (Exception e) {
            e.printStackTrace();
        }
        long endtime = System.currentTimeMillis();
        System.out.println("Time that shows the heat map: " + (endtime - starttime) / 1000.0 + "s");
    }*/

    private String getString(ArrayList<ArrayList<Node>> traj_node, ArrayList<String> trajs_id, JsonConfig jsonConfig, PrintWriter printWriter, String final_traj_id, int i) {
        JSONArray jsonArray = JSONArray.fromObject(traj_node.get(i), jsonConfig);
        printWriter.append(jsonArray.toString()).append("\n");
        final_traj_id += trajs_id.get(i);
        final_traj_id += ",";
        return final_traj_id;
    }


    public static List<Integer> getRandomNumList(int nums, int start, int end) {
        //1.创建集合容器对象
        List<Integer> list = new ArrayList<Integer>();

        //2.创建Random对象
        Random r = new Random();
        //循环将得到的随机数进行判断，如果随机数不存在于集合中，则将随机数放入集合中，如果存在，则将随机数丢弃不做操作，进行下一次循环，直到集合长度等于nums
        while (list.size() != nums) {
            int num = r.nextInt(end - start) + start;
            if (!list.contains(num)) {
                list.add(num);
            }
        }

        return list;
    }




}
