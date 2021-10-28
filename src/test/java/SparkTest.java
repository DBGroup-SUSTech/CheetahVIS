import org.apache.spark.SparkConf;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.sql.Dataset;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.SQLContext;
import org.apache.spark.sql.DataFrameReader;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;
import java.util.Properties;

public class SparkTest {

    //public static org.apache.log4j.Logger logger = org.apache.log4j.Logger.getLogger(SparkTest.class);

    @Test
    public void test() {
        JavaSparkContext sparkContext = new JavaSparkContext(new SparkConf().setAppName("SparkMysql").setMaster("local[2]"));
        SQLContext sqlContext = new SQLContext(sparkContext);
        readMySQL(sqlContext);
        sparkContext.stop();


    }


    private static void readMySQL(SQLContext sqlContext) {

        String url = "jdbc:mysql://10.20.126.63:3306/sz_data";
        String table = "METRO_STATION_84";
        Properties connectionProperty = new Properties();

        connectionProperty.put("user", "root");
        connectionProperty.put("password", "spark-123456");
        connectionProperty.put("driver", "com.mysql.jdbc.Driver");
        Dataset<Row> dataset = sqlContext.read().jdbc(url, table, connectionProperty).select("*");
        dataset.show();


    }


}
