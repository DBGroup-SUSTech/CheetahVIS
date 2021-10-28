package sustech.dbgroup.PATHFINDER.dao.distribute;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FileSystem;

import java.net.URI;
import java.util.concurrent.Semaphore;

public abstract class SparkSubmit {
    public static final String HDFS_PATH = "hdfs://10.20.126.63:9000";
    public static final String HDFS_USER_NAME = "spark";
    private FileSystem hdfs;
    private Semaphore semaphore = new Semaphore(1);


    private SparkSubmit() {
        Configuration configuration = new Configuration();
        configuration.set("fs.defaultFS", HDFS_PATH);
        try {
            hdfs = FileSystem.get(new URI(HDFS_PATH), configuration, HDFS_USER_NAME);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    public abstract Object query(String[] args);




}
