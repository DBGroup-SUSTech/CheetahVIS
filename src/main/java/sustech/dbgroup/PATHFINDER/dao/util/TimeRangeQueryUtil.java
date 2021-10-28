package sustech.dbgroup.PATHFINDER.dao.util;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FSDataInputStream;
import org.apache.hadoop.fs.FileStatus;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.apache.spark.SparkConf;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.deploy.history.LogInfo;
import org.apache.spark.launcher.SparkAppHandle;
import org.apache.spark.launcher.SparkLauncher;
import org.apache.spark.sql.Dataset;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.SQLContext;
import sustech.dbgroup.PATHFINDER.dataStructure.BUS_GPS;


import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URI;
import java.sql.SQLClientInfoException;
import java.sql.Timestamp;
import java.util.*;
import java.util.concurrent.Semaphore;
import java.util.regex.Pattern;

public class TimeRangeQueryUtil {


    public static final String[] TABLE_SCHEME = new String[]{
            "NEW_TRAJ_ID", "PLATE_NUM", "LATITUDE", "LONGITUDE", "TIME", "LINE_ID", "STATION_NUM", "AVG_SPEED", "v1"
    };


    public static final String HDFS_PATH = "hdfs://10.20.126.63:9000";
    String inputPathStr = "/sz_query/input/bus_gps_traj_new";
    String outputPathStr = "/sz_query/output/time_range_query";
    private FileSystem hdfs;
    private Semaphore semaphore;

    public TimeRangeQueryUtil() {
        Configuration configuration = new Configuration();
        try {
            hdfs = FileSystem.get(new URI(HDFS_PATH), configuration, "spark");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static TimeRangeQueryUtil instance = new TimeRangeQueryUtil();

    public static TimeRangeQueryUtil getInstance() {
        return instance;
    }


    private void submitTimeRangeQuery(String startTime, String endTime) throws IOException, InterruptedException {
        Path outputPath = new Path(outputPathStr);
        if (hdfs.exists(outputPath)) {
            hdfs.delete(outputPath, true);
        }
        final SparkLauncher spark = new SparkLauncher();
        spark.setAppResource("/home/spark/sz_query/TheQueries-1.0-SNAPSHOT.jar");
        spark.setMainClass("TimeRangeQuery");
        spark.setMaster("spark://10.20.126.63:7077");
        spark.setConf("spark.local.dir", "/home/spark/tmp");
        spark.setConf("spark.executor.instances", "4");
        spark.setConf(SparkLauncher.DRIVER_MEMORY, "24g");
        spark.setConf(SparkLauncher.EXECUTOR_MEMORY, "36g");
        spark.setConf(SparkLauncher.EXECUTOR_CORES, "4");
        spark.addAppArgs(inputPathStr, outputPathStr, startTime, endTime);
        System.out.println("The Query has been sent to the cluster......");
        semaphore = new Semaphore(1);
        semaphore.acquire();
        final SparkAppHandle handle = spark.startApplication(new SparkAppHandle.Listener() {
            @Override
            public void stateChanged(SparkAppHandle sparkAppHandle) {
                System.out.println("Spark App State: " + sparkAppHandle.getState());
                if (sparkAppHandle.getState() == SparkAppHandle.State.FINISHED) {
                    semaphore.release();
                    System.out.println("The Query finishes!");
                }
            }

            @Override
            public void infoChanged(SparkAppHandle sparkAppHandle) {
            }
        });

    }

    private void fileConcat(String rootPathPos) throws IOException {
        Path rootPath = new Path(rootPathPos);
        FileStatus[] statuses = hdfs.listStatus(rootPath);
        Path dstPath = new Path(rootPathPos + "/result.csv");
        ArrayList<Path> srcPathList = new ArrayList<Path>();
        long maxBlockSize = 0;
        for (FileStatus file : statuses) {
            if (file.getLen() == 0)
                continue;
            Path path = file.getPath();
            String[] pathElem = path.toString().split("/");
            if (Pattern.matches("part-.*\\.csv", pathElem[pathElem.length - 1])) {
                String srcPath = rootPathPos + "/" + pathElem[pathElem.length - 1];
                srcPathList.add(new Path(srcPath));
                maxBlockSize = Math.max(maxBlockSize, file.getBlockSize());
            }
        }
        Path[] srcPaths = srcPathList.toArray(new Path[0]);
//        for (int i = 0; i < srcPaths.length; i++) {
//            System.out.println(srcPaths[i].toString());
//        }
        hdfs.create(dstPath, true, 1024, (short) 1, maxBlockSize, null).close();
        hdfs.concat(dstPath, srcPaths);
    }

    private List<Map<String, Object>> readResult() throws IOException, InterruptedException {
        semaphore.acquire();
        List<Map<String, Object>> resultList = new LinkedList<Map<String, Object>>();
        fileConcat(outputPathStr);
        FSDataInputStream in = hdfs.open(new Path(outputPathStr + "/result.csv"));
        BufferedReader br = new BufferedReader(new InputStreamReader(in));
        String lineTxt;
        while ((lineTxt = br.readLine()) != null) {
            String[] lineElem = lineTxt.split(",");
            Map<String, Object> map = new HashMap<String, Object>();
            //System.out.println("elem length: " + lineElem.length);
            //System.out.println("table scheme length: " + TABLE_SCHEME.length);
            int elemLength = lineElem.length;
            if (elemLength != TABLE_SCHEME.length) {
                System.out.println("Error Scheme");
                break;
            }
            for (int i = 0; i < elemLength; i++) {
                map.put(TABLE_SCHEME[i], lineElem[i]);
            }
            //System.out.println(lineTxt);
            resultList.add(map);
        }
        //System.out.println("Query Finished! result count: " + resultList.size());
        return resultList;
    }

    public List<Map<String, Object>> query(String startTime, String endTime) {
        try {
            submitTimeRangeQuery(startTime, endTime);
            return readResult();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return new LinkedList<Map<String, Object>>();
    }

    public List<Map<String, Object>> timeSearch(String startStr, String endStr) {
        SparkConf conf = new SparkConf().setAppName("Time Search").setMaster("spark://10.20.126.63:7077")
                .set("spark.hadoop.fs.defaultFS", "hdfs://10.20.126.63:9000");
        JavaSparkContext sc = new JavaSparkContext(conf);

        SQLContext sqlContext = new SQLContext(sc);
        List<String> list=new ArrayList<String>();
        list.add("a");
        list.add("b");
        list.add("c");
        JavaRDD<String> temp = sc.parallelize(list);



        JavaRDD<String> lines = sc.textFile("hdfs://10.20.126.63:9000/sz_query/input/bus_gps_traj_new", 1024);
        JavaRDD<BUS_GPS> gpsJavaRDD = lines.map(line -> {
            String[] str = line.split(";");
            return new BUS_GPS(Timestamp.valueOf(str[0]), str[1], str[2], Double.parseDouble(str[3]), Double.parseDouble(str[4]), Double.parseDouble(str[5]),
                    Integer.parseInt(str[6]), Double.parseDouble(str[7]), Double.parseDouble(str[8]), Integer.parseInt(str[9]),
                    Integer.parseInt(str[10]), Integer.parseInt(str[11]), Double.parseDouble(str[12]));
        });
        Dataset<Row> df = sqlContext.createDataFrame(gpsJavaRDD, BUS_GPS.class);
        List<Row> rows = df.select("NEW_TRAJ_ID", "PLATE_NUM", "LATITUDE", "LONGITUDE", "TIME", "LINE_ID", "STATION_NUM", "AVG_SPEED", "v1")
                .where(df.col("time").
                        between(Timestamp.valueOf(startStr), Timestamp.valueOf(endStr)))
                .sort(df.col("PLATE_NUM"), df.col("time")).collectAsList();


        List<Map<String, Object>> lists = new ArrayList<>();
        for (Row row : rows) {
            Map<String, Object> map = new HashMap<String, Object>();
            for (int i = 0; i < TABLE_SCHEME.length; i++) {
                map.put(TABLE_SCHEME[i], row.get(i));
            }
            lists.add(map);
        }
        System.out.println(lists);
        return lists;
    }
}
