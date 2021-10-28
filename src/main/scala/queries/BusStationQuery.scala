package sustech.dbgroup.PATHFINDER.dao.queries_scala

import org.apache.spark.sql.SparkSession
import org.apache.spark.sql.DataFrame
import org.apache.spark.sql.DatasetHolder

object BusStationQuery {

  System.setProperty("HADOOP_USER_NAME", "spark")
  //val input_path = "hdfs://10.20.126.63:9000/data/sz_data_static/bus_lines_84"
  //val output_path = "hdfs://10.20.126.63:9000/tmp/bus_station_test"

  def main(args: Array[String]): Unit = {
    val input_path = args(0)
    val output_path = args(1)
    val session = SparkSession.builder().getOrCreate()
    //val txtDF = session.read.text(input_path)
    val rdd = session.sparkContext.textFile(input_path)
    import session.implicits._
    val resultDF = rdd.map(_.split(";")).map(line => BusStation84(line(0), line(1), line(2))).toDF()

    //resultDF.rdd.saveAsTextFile(output_path)
    resultDF.write.csv(output_path)
    //resultDF.write.json(output_path)


    //SparkUtils.moveTempToFinalPath(fileSystem,temp_path,userinfo_path)

/*

    resultDF.write.save("output/result.json")
    //resultDF.rdd.saveAsTextFile(output_path)
    //resultDF.repartition(1).coalesce(1).write.json("output/result.json")

    resultDF.show()

    session.close()

 */
  }




  case class BusStation84(LineName: String, FullName: String, Polyline: String)
}
