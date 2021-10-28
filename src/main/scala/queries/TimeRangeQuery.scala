package sustech.dbgroup.PATHFINDER.dao.queries_scala

import java.text.SimpleDateFormat
import java.sql.{Date, Timestamp}

import org.apache.spark.sql.SparkSession

object TimeRangeQuery {

  System.setProperty("HADOOP_USER_NAME", "spark")

  /*
  val input_path = "hdfs://10.20.126.63:9000/data/sz_data_clean/bus_gps_traj"
  val output_path = "hdfs://10.20.126.63:9000/tmp/time_range_test"

  val start_time_str = "2016-01-01 06:18:43"
  val end_time_str = "2016-01-01 08:18:28"

   */

  val date_format = new SimpleDateFormat("yyyy-mm-dd hh:mm:ss")

  def main(args: Array[String]): Unit = {
    val input_path = args(0)
    val output_path = args(1)
    val start_time_str = args(2)
    val end_time_str = args(3)

    val session = SparkSession.builder().getOrCreate()
    val rdd = session.sparkContext.textFile(input_path)
    println(Timestamp.valueOf(start_time_str))

    import session.implicits._
    val df = rdd.map(_.split(";")).map(line => BUS_GPS(Timestamp.valueOf(line(0)),
      line(1), line(2), line(3).toDouble, line(4).toDouble, line(5).toDouble, line(6))).toDF()
    val start_time = Timestamp.valueOf(start_time_str)
    val end_time = Timestamp.valueOf(end_time_str)
    val resultDF = df.select("TrajectoryId", "Latitude", "Longitude", "LineID").where(df.col("Time").
      between(start_time, end_time)).sort(df.col("PlateNum"), df.col("Time"))
    //resultDF.show()

    resultDF.write.csv(output_path)
  }



  case class BUS_GPS(Time: Timestamp, PlateNum: String, LineID: String, Longitude: Double, Latitude: Double, Direction: Double, TrajectoryId: String)

}
