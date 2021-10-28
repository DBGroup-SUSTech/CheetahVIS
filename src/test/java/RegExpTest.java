import org.junit.Test;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class RegExpTest {


    @Test
    public void contentTest() {

        String content = "基础数据成功率：30%";
        Pattern p = Pattern.compile("基础数据成功率：(.*?)%");
        Matcher m = p.matcher(content);
        while(m.find()){
            System.out.println(m.group(1));
        }
    }


    @Test
    public void lineStringTest() {
        String content = "LINESTRING (113.858757 22.624567, 113.864845 22.622507, 113.870659 22.620073, 113.876305 22.615749, 113.880753 22.609774, 113.885345 22.60383, 113.891373 22.59927, 113.897415 22.594646, 113.902809 22.589375, 113.907883 22.583858, 113.913116 22.578238, 113.917206 22.573915, 113.921852 22.56884, 113.925385 22.566769, 113.954933 22.563484, 113.977135 22.55636, 113.983131 22.551609, 113.990013 22.547932, 114.009171 22.540012, 114.009628 22.539551, 114.010521 22.538445, 114.011177 22.536013)";

        /*
        Pattern p = Pattern.compile("LINESTRING \\(((.*?)\\)");
        Matcher m = p.matcher(content);
        while (m.find()) {
            System.out.println(m.group(1));
        }
         */
        System.out.println(content.substring(12, content.length()-1));



    }
}
