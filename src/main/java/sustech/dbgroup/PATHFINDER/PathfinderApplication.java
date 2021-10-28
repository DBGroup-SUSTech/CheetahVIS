package sustech.dbgroup.PATHFINDER;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import sustech.dbgroup.PATHFINDER.dao.JDBCServiceImpl;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.util.List;
import java.util.Map;

@Controller
@SpringBootApplication
public class PathfinderApplication {

    @RequestMapping("/chengdu")
    public String chengdu(HttpServletRequest request, HttpSession httpSession, Model model) {
        return "leafletMap";
    }

    @RequestMapping("/")
    public String index(HttpServletRequest request, HttpSession httpSession, Model model) {
        return "szbus";
    }

    public static void main(String[] args) {

//        JDBCServiceImpl jdbcService = new JDBCServiceImpl();
//        List<Map<String, Object>> list = jdbcService.selectSubTraj("2016-01-01 09:00:00", "2016-01-01 09:10:00");
//        System.out.print(list);
//        Processor.calculateCHGraph();
        SpringApplication.run(PathfinderApplication.class, args);
    }

}
