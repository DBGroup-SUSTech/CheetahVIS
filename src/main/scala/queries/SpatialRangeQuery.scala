package sustech.dbgroup.PATHFINDER.dao.queries_scala

import com.vividsolutions.jts.geom.Envelope
import org.apache.spark.serializer.KryoSerializer
import org.apache.spark.storage.StorageLevel
import org.apache.spark.{SparkConf, SparkContext}
import org.datasyslab.geospark.enums.{FileDataSplitter, IndexType}
import org.datasyslab.geospark.serde.GeoSparkKryoRegistrator
import org.datasyslab.geospark.spatialOperator.RangeQuery
import org.datasyslab.geospark.spatialRDD.LineStringRDD


object SpatialRangeQuery {

  def main(args: Array[String]): Unit = {
    System.setProperty("HADOOP_USER_NAME", "spark")
    val input_path = args(0)
    val output_path = args(1)
    val querylist = args(2)

    val conf = new SparkConf().setAppName("Range Queries")
    conf.set("spark.serializer", classOf[KryoSerializer].getName)
    conf.set("spark.kryo.registrator", classOf[GeoSparkKryoRegistrator].getName)
    val sc = new SparkContext(conf)
    val lnlalist = querylist.split(";")
    var lnla = lnlalist(0).split(",")

    var rangeQueryWindow = new Envelope(lnla(0).toDouble, lnla(1).toDouble, lnla(2).toDouble, lnla(3).toDouble)
    val objectRDD = new LineStringRDD(sc, input_path, FileDataSplitter.WKT, false, 1024, StorageLevel.MEMORY_ONLY)
    objectRDD.buildIndex(IndexType.RTREE, false)
    objectRDD.indexedRawRDD.persist(StorageLevel.MEMORY_ONLY)
    var TrajRDD = RangeQuery.SpatialRangeQuery(objectRDD, rangeQueryWindow, true, false)
    var i = 1
    for (i <- 1 to lnlalist.length) {
      lnla = lnlalist(i).split(",")
      rangeQueryWindow = new Envelope(lnla(i).toDouble, lnla(i).toDouble, lnla(i).toDouble, lnla(i).toDouble)
      TrajRDD = TrajRDD.intersection(RangeQuery.SpatialRangeQuery(objectRDD, rangeQueryWindow, true, false))
    }
    TrajRDD.saveAsTextFile(output_path)
  }
}
