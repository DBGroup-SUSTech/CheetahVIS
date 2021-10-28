package sustech.dbgroup.PATHFINDER.utils;

import sustech.dbgroup.PATHFINDER.dataStructure.Edge;
import sustech.dbgroup.PATHFINDER.dataStructure.Graph;
import sustech.dbgroup.PATHFINDER.dataStructure.MBR;
import sustech.dbgroup.PATHFINDER.dataStructure.Node;

import java.io.*;
import java.util.HashMap;
import java.util.HashSet;

/**
 * 对路网图进行预处理，删除没有轨迹的边
 */
public class Preprocess {


    public static void main(String[] args) {
        HashMap<Integer, Edge> edgeHashMap = new HashMap<>();
        HashSet<Integer> edges = getEdgeIds("data/id_edge.txt", edgeHashMap);
        HashSet<Integer> nodes = getNodeIds(56293);
        HashSet<Integer> haveEdges = new HashSet<>();
        HashSet<Integer> haveNodes = new HashSet<>();
        removeEdgesAndNodes(haveEdges, haveNodes, edges, nodes, edgeHashMap);
        System.out.println(haveEdges.size());
        System.out.println(haveNodes.size());
        writeFile("data/id_edge.txt", "data/id_edge_processed.txt", haveEdges);
        writeFile("data/id_vertex.txt", "data/id_vertex_processed.txt", haveNodes);
    }

    public static void writeFile(String readFilePath, String writeFilePath, HashSet<Integer> ids) {
        String encoding = "UTF-8";
        File file = new File(readFilePath);
        File file2 = new File(writeFilePath);
        if (file.isFile() && file.exists()) {
            try (InputStreamReader read = new InputStreamReader(new FileInputStream(file), encoding);
                 BufferedReader bufferedReader = new BufferedReader(read);
                 OutputStreamWriter write = new OutputStreamWriter(new FileOutputStream(file2), encoding);
                 BufferedWriter bufferedWriter = new BufferedWriter(write);) {

                String lineTxt = null;

                while ((lineTxt = bufferedReader.readLine()) != null) {
                    String[] tmp = lineTxt.split(";");
                    if (ids.contains(Integer.parseInt(tmp[0]))) {
                        bufferedWriter.write(lineTxt + '\n');
                    }
                }
                bufferedWriter.flush();
            } catch (Exception e) {
                System.out.println("Exception occurs when reading file.");
                e.printStackTrace();
            }
        } else {
            System.out.println("File not exists " + readFilePath);
        }
    }

    public static HashSet<Integer> getEdgeIds(String filePath, HashMap<Integer, Edge> edgeHashMap) {
        String encoding = "UTF-8";
        File file = new File(filePath);
        HashSet<Integer> results = new HashSet<>();
        if (file.isFile() && file.exists()) {
            try (InputStreamReader read = new InputStreamReader(new FileInputStream(file), encoding);
                 BufferedReader bufferedReader = new BufferedReader(read);) {
                String lineTxt = null;
                while ((lineTxt = bufferedReader.readLine()) != null) {
                    String[] tmp = lineTxt.split(";");
                    results.add(Integer.parseInt(tmp[0]));
                    try {
                        edgeHashMap.put(Integer.parseInt(tmp[0]), new Edge(Integer.parseInt(tmp[0]), Integer.parseInt(tmp[1]), Integer.parseInt(tmp[2]), Double.parseDouble(tmp[3])));
                    } catch (Exception e) {
                    }
                }

            } catch (Exception e) {
                System.out.println("Exception occurs when reading file.");
                e.printStackTrace();
            }
        } else {
            System.out.println("File not exists " + filePath);
        }
        return results;
    }

    public static HashSet<Integer> getNodeIds(int n) {
        HashSet<Integer> results = new HashSet<>();
        for (int i = 0; i < n; i++)
            results.add(i);
        return results;
    }

    public static void removeEdgesAndNodes(HashSet<Integer> haveEdges, HashSet<Integer> haveNodes, HashSet<Integer> edges, HashSet<Integer> nodes, HashMap<Integer, Edge> edgeHashMap) {
        String encoding = "UTF-8";
        File file = new File("data/trajectory_edge.txt");
        if (file.isFile() && file.exists()) {
            try (InputStreamReader read = new InputStreamReader(new FileInputStream(file), encoding);
                 BufferedReader bufferedReader = new BufferedReader(read);) {

                String lineTxt = null;

                while ((lineTxt = bufferedReader.readLine()) != null) {
                    String[] tmp = lineTxt.split(";");
                    for (int i = 1; i < tmp.length; i++) {
                        haveEdges.add(Integer.parseInt(tmp[i]));

                        if (edgeHashMap.containsKey(Integer.parseInt(tmp[i])))
                            haveNodes.add(edgeHashMap.get(Integer.parseInt(tmp[i])).getSrc_id());

                        if (edgeHashMap.containsKey(Integer.parseInt(tmp[i])))
                            haveNodes.add(edgeHashMap.get(Integer.parseInt(tmp[i])).getTgt_id());

                    }
                }
            } catch (Exception e) {
                System.out.println("Exception occurs when reading file.");
                e.printStackTrace();
            }
        } else {
            System.out.println("File not exists");
        }
    }

    public static void readIdEdge(String filePath1, String filePath2, String filePath3) {

        String encoding = "UTF-8";
        HashMap<Integer, String> vertices = new HashMap<>();
        File file = new File(filePath1);
        if (file.isFile() && file.exists()) {
            try (InputStreamReader read = new InputStreamReader(new FileInputStream(file), encoding);
                 BufferedReader bufferedReader = new BufferedReader(read)) {
                String lineTxt;
                while ((lineTxt = bufferedReader.readLine()) != null) {
                    String[] tmp = lineTxt.split(";");
                    vertices.put(Integer.parseInt(tmp[0]), tmp[1] + "," + tmp[2]);
                }

            } catch (Exception e) {
                System.out.println("Exception occurs when reading file.");
                e.printStackTrace();
            }
        } else {
            System.out.println("File not exists");
        }

        File file2 = new File(filePath2);
        File file3 = new File(filePath3);
        if (file2.isFile() && file2.exists()) {
            try (InputStreamReader read = new InputStreamReader(new FileInputStream(file2), encoding);
                 BufferedReader bufferedReader = new BufferedReader(read);
                 OutputStreamWriter write = new OutputStreamWriter(new FileOutputStream(file3), encoding);
                 BufferedWriter bufferedWriter = new BufferedWriter(write)) {
                String lineTxt;
                while ((lineTxt = bufferedReader.readLine()) != null) {
                    String[] tmp = lineTxt.split(";");

                }

            } catch (Exception e) {
                System.out.println("Exception occurs when reading file.");
                e.printStackTrace();
            }
        } else {
            System.out.println("File not exists");
        }
    }

}
