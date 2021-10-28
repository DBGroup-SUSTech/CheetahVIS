package sustech.dbgroup.PATHFINDER.utils;

import sustech.dbgroup.PATHFINDER.dataStructure.Edge;
import sustech.dbgroup.PATHFINDER.dataStructure.Graph;
import sustech.dbgroup.PATHFINDER.dataStructure.MBR;
import sustech.dbgroup.PATHFINDER.dataStructure.Node;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.util.HashSet;

public class ReadFile {

    /*
    边必须按照id排好序，边id从1开始。
    * */
    public static void readIdEdge(String filePath, Graph g) {

        String encoding = "UTF-8";
        File file = new File(filePath);
        if (file.isFile() && file.exists()) {
            try (InputStreamReader read = new InputStreamReader(new FileInputStream(file), encoding);
                 BufferedReader bufferedReader = new BufferedReader(read)) {

                String lineTxt;

                while ((lineTxt = bufferedReader.readLine()) != null) {
                    String[] tmp = lineTxt.split(";");
                    if (tmp[0].equals("") || tmp[1].equals("") || tmp[2].equals(""))
                        continue;

                    if (tmp[1].equals(tmp[2])) continue;//在一个点的数据

                    Edge tmp_edge = new Edge(Integer.parseInt(tmp[0]), Integer.parseInt(tmp[1]), Integer.parseInt(tmp[2]), Double.parseDouble(tmp[3]));
                    if (!g.getOriginRoadNetwork().containsKey(Integer.parseInt(tmp[1])))
                        g.getOriginRoadNetwork().put(Integer.parseInt(tmp[1]), new HashSet<>());
                    if (!g.getOriginRoadNetwork().containsKey(Integer.parseInt(tmp[2])))
                        g.getOriginRoadNetwork().put(Integer.parseInt(tmp[2]), new HashSet<>());
                    g.getOriginRoadNetwork().get(Integer.parseInt(tmp[1])).add(Integer.parseInt(tmp[2]));//表示所有能从tmp[1]到的所有的node的id
                    g.getOriginRoadNetwork().get(Integer.parseInt(tmp[2])).add(Integer.parseInt(tmp[1]));
                    Node node1 = g.getNodeById(Integer.parseInt(tmp[1]));
                    Node node2 = g.getNodeById(Integer.parseInt(tmp[2]));
                    MBR pb = new MBR(node1.getLat(), node1.getLng(), node2.getLat(), node2.getLng());
                    tmp_edge.setPb(pb);
                    g.insertEdge(tmp_edge);
                }

            } catch (Exception e) {
                System.out.println("Exception occurs when reading file.");
                e.printStackTrace();
            }
        } else {
            System.out.println("File not exists" + filePath);
        }
    }

    /*
    点必须按照id排好序，点id从0开始。
    * */
    public static void readIdNode(String filePath, Graph g) {

        String encoding = "UTF-8";
        File file = new File(filePath);
        if (file.isFile() && file.exists()) {
            try (InputStreamReader read = new InputStreamReader(new FileInputStream(file), encoding);
                 BufferedReader bufferedReader = new BufferedReader(read)) {

                String lineTxt;

                while ((lineTxt = bufferedReader.readLine()) != null) {
                    String[] tmp = lineTxt.split(";");
                    Node tmp_node = new Node(Integer.parseInt(tmp[0]), Double.parseDouble(tmp[1]), Double.parseDouble(tmp[2]));
                    g.getNodes().put(Integer.parseInt(tmp[0]), tmp_node);

                }
            } catch (Exception e) {
                System.out.println("Exception occurs when reading file.");
                e.printStackTrace();
            }
        } else {
            System.out.println("File not exists" + filePath);
        }
    }



}
