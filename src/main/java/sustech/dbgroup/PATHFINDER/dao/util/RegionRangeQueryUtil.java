package sustech.dbgroup.PATHFINDER.dao.util;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FSDataInputStream;
import org.apache.hadoop.fs.FileStatus;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.apache.spark.launcher.SparkAppHandle;
import org.apache.spark.launcher.SparkLauncher;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URI;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.concurrent.Semaphore;
import java.util.regex.Pattern;

public class RegionRangeQueryUtil {

    public static final String HDFS_PATH = "hdfs://10.20.126.63:9000";
    private FileSystem hdfs;
    private Semaphore semaphore;
    String inputPathStr = "hdfs://10.20.126.63:9000/data/sz_data_clean/traj.txt";
    String outputPathStr = "/tmp/region_range_query";

    private RegionRangeQueryUtil() {
        Configuration configuration = new Configuration();
        configuration.set("fs.defaultFS", HDFS_PATH);
        try {
            hdfs = FileSystem.get(new URI(HDFS_PATH), configuration, "spark");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static RegionRangeQueryUtil instance = new RegionRangeQueryUtil();

    public static RegionRangeQueryUtil getInstance() {
        return instance;
    }


    private void submitRegionRangeQuery(String inputPathStr, String outputPathStr, String querylist) throws IOException, InterruptedException {
        final SparkLauncher spark = new SparkLauncher();
        spark.setAppResource("/home/spark/sz_query/TheQueries-1.0-SNAPSHOT.jar");
        spark.setMainClass("SpatialRangeQuery");
        spark.setMaster("spark://10.20.126.63:7077");
        spark.setConf("spark.local.dir", "/home/spark/tmp");
        spark.setConf(SparkLauncher.DRIVER_MEMORY, "24g");
        spark.setConf(SparkLauncher.EXECUTOR_MEMORY, "30g");
        spark.setConf(SparkLauncher.EXECUTOR_CORES, "6");
        spark.setConf("spark.executor.instances", "4");
        spark.addAppArgs(inputPathStr, outputPathStr, querylist);
        semaphore = new Semaphore(1);
        semaphore.acquire();
        final SparkAppHandle handle = spark.startApplication(new SparkAppHandle.Listener() {
            @Override
            public void stateChanged(SparkAppHandle sparkAppHandle) {
                System.out.println("!!!!!!!!!!!!!!!!!!!!!!!!!!" + sparkAppHandle.getState());
                if (sparkAppHandle.getState() == SparkAppHandle.State.FINISHED) {
                    semaphore.release();
                }
            }

            @Override
            public void infoChanged(SparkAppHandle sparkAppHandle) {
            }
        });
    }

    public void submitRegionRangeQuery(String querylist) throws IOException, InterruptedException {

        Path outputPath = new Path(outputPathStr);

        if (hdfs.exists(outputPath)) {
            hdfs.delete(outputPath, true);
        }
        submitRegionRangeQuery(inputPathStr, outputPathStr, querylist);
    }


    private void fileConcat(String rootPathPos) throws IOException {
        Path rootPath = new Path(rootPathPos);
        FileStatus[] statuses = hdfs.listStatus(rootPath);
        Path dstPath = new Path(rootPathPos + "/result.txt");
        ArrayList<Path> srcPathList = new ArrayList<Path>();
        long maxBlockSize = 0;
        for (FileStatus file : statuses) {
            if (file.getLen() == 0)
                continue;
            Path path = file.getPath();
            String[] pathElem = path.toString().split("/");
            if (Pattern.matches("part-.*", pathElem[pathElem.length - 1])) {
                String srcPath = rootPathPos + "/" + pathElem[pathElem.length - 1];
                srcPathList.add(new Path(srcPath));
                maxBlockSize = Math.max(maxBlockSize, file.getBlockSize());
            }
        }
        Path[] srcPaths = srcPathList.toArray(new Path[0]);

        hdfs.create(dstPath, true, 1024, (short) 1, maxBlockSize, null).close();
        hdfs.concat(dstPath, srcPaths);
    }


    /*
    private void readResult(String outputPathStr) throws IOException, InterruptedException {
        semaphore.acquire();
        fileConcat(outputPathStr);
        FSDataInputStream in = hdfs.open(new Path(outputPathStr + "/result.txt"));
        IOUtils.copyBytes(in, System.out, 1024);
    }

     */

    private HashSet<String> readResult() throws InterruptedException, IOException {
        semaphore.acquire();
        fileConcat(outputPathStr);
        FSDataInputStream in = hdfs.open(new Path(outputPathStr + "/result.txt"));
        BufferedReader br = new BufferedReader(new InputStreamReader(in));
        String lineTxt;
        HashSet<String> trajectoryStrSet = new HashSet<>();
        while ((lineTxt = br.readLine()) != null) {
            trajectoryStrSet.add(lineTxt.substring(12, lineTxt.lastIndexOf(")")));
        }
        return trajectoryStrSet;
    }


    public HashSet<String> query(String queryList) {
        try {
            submitRegionRangeQuery(queryList);
            return readResult();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        return new HashSet<String>();
    }

}
