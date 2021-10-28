package sustech.dbgroup.PATHFINDER.utils;

import java.io.*;
import java.util.*;

public class CalConCom {
    //bfs algorithm: find the connected component of a graph(length && vertex info)
    public static ArrayList<String[]> bfs(int[][] data, int[] tag) {
        Queue<Integer> q = new LinkedList<Integer>();
        int[] visit = new int[tag.length];
        ArrayList<Integer>[] nodelist = new ArrayList[tag.length];
        for (int i = 0; i < tag.length; i++) {
            nodelist[i] = new ArrayList<Integer>();
        }
        //System.out.println(data.length);
        for (int i = 0; i < data.length; i++) {
            System.out.println(data[i][0]);
            nodelist[data[i][0]].add(data[i][1]);
            nodelist[data[i][1]].add(data[i][0]);
        }
        ArrayList<String[]> result = new ArrayList<>();
        for (int i = 0; i < tag.length; i++) {
            System.out.println("i: " + i);
            if (tag[i] == 1 && visit[i] == 0) {
                int count = 0;
                //For each connected component, create a Arraylist to record the vertex in this connected component.
                ArrayList<String> connection = new ArrayList<>();
                q.offer(i);
                visit[i] = 1;
                while (!q.isEmpty()) {
                    count += 1;
                    int tmp = q.poll();
                    connection.add(String.valueOf(tmp));
                    System.out.print("count : " + count + "q.size: " + q.size());
                    for (int j = 0; j < nodelist[tmp].size(); j++) {
                        if (visit[nodelist[tmp].get(j)] == 0) {
                            q.offer(nodelist[tmp].get(j));
                            visit[nodelist[tmp].get(j)] = 1;
                        }
                    }
                }
                result.add((String[]) connection.toArray(new String[connection.size()]));
            }
        }
        return result;
    }

    public static void initial(String path_Node, String path_edge, int maxnodeid, String path_writeresult_to) {
        //find the number of edges in this graph. viriable 'count' record the total number.
        int count = 0;
        try {
            Scanner in = new Scanner(new File(path_edge));
            while (in.hasNextLine()) {
                String str = in.nextLine();
                System.out.println("str: " + str + "count: " + count);
                count++;
            }
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
        //test count
        //System.out.println(count);

        //traverse the vertex file and find which vertex are in the graph. if node x in graph, corresponding
        //tag[x] equals to 1.
        int[] tag = new int[maxnodeid];
        try {
            Scanner in = new Scanner(new File(path_Node));

            while (in.hasNextLine()) {
                String str = in.nextLine();
                tag[Integer.parseInt(str.split(";")[0])] = 1;// 第零位，即id，tag对应标1
            }
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }

        //use two dimensional array data to store the graph.
        int[][] data = new int[count][2]; //data 这个二维数组存边
        int counter = 0;
        try {
            Scanner in = new Scanner(new File(path_edge));

            while (in.hasNextLine()) {
                String str = in.nextLine();
                String[] tmp = str.split(";");
                data[counter][0] = Integer.parseInt(tmp[1]);
                data[counter][1] = Integer.parseInt(tmp[2]);
                counter++;
            }
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }

        /*调用bfs，得到最终连通分量
          Result.size():  get the number of connected component
        */
        ArrayList<String[]> Result = bfs(data, tag);

        //test result: print the vertex of each connected component
        System.out.println("resultlength: " + Result.size());
        for (int i = 0; i < Result.size(); i++) {
            for (int j = 0; j < Result.get(i).length; j++) {
                System.out.print(Result.get(i)[j] + " ");
            }
            System.out.println();
        }

        //print the result to the target path(if not exist, create a new one)
        try {
            File file = new File(path_writeresult_to);
            PrintStream ps = new PrintStream(new FileOutputStream(file));
            for (int i = 0; i < Result.size(); i++) {
                for (int j = 0; j < Result.get(i).length; j++) {
                    ps.print(Result.get(i)[j] + " ");// 往文件里写入字符串
                }
                ps.println();
                ps.println();
            }
        } catch (FileNotFoundException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        //input the vertex file
        String path_node = "/Users/zhouzhiyuan/Desktop/id_vertex_processed.txt";
        //input the edge info file
        String path_edge = "/Users/zhouzhiyuan/Desktop/id_edge_processed.txt";
        //input the maxid of node
        int maxnodeid = 56293;
        //input the filepath you want to store
        String path_writeresult_to = "/Users/zhouzhiyuan/Desktop/result.txt";

        //invoking function
        initial(path_node, path_edge, maxnodeid, path_writeresult_to);
    }
}
