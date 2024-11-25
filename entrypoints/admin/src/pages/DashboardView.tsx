import { Card, Col, Flex, Row, Statistic } from "antd";
import { JobApi, CompanyApi } from "@/common/api";
import {
  ArrowDownOutlined,
  ArrowRightOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";
import { Space, Typography } from "antd";
import { Icon } from "@iconify/react";
import {
  JobStatisticGrouByPublishDateBO,
  TYPE_ENUM_MONTH,
  TYPE_ENUM_WEEK,
  TYPE_ENUM_DAY,
  TYPE_ENUM_HOUR,
} from "@/common/data/bo/jobStatisticGrouByPublishDateBO";
import {
  PLATFORM_BOSS,
  PLATFORM_51JOB,
  PLATFORM_ZHILIAN,
  PLATFORM_LAGOU,
  PLATFORM_LIEPIN,
  PLATFORM_JOBSDB,
} from "@/common";
import { useJob } from "../hooks/job";

import "./DashboardView.css";

const { Text, Link } = Typography;

type StatisticCardProps = {
  name: string;
  count: number;
  unit: string;
  previousCount?: number;
  totalCount: number;
};
const StatisticCard: React.FC<StatisticCardProps> = (props) => {
  if (props.previousCount != null) {
    let color = null;
    let prefix = null;
    if (props.previousCount > props.count) {
      color = "#cf1322";
      prefix = <ArrowDownOutlined />;
    } else if (props.previousCount == props.count) {
      color = "#3f8600";
      prefix = <ArrowRightOutlined />;
    } else {
      color = "#3fBB00";
      prefix = <ArrowUpOutlined />;
    }
    return (
      <>
        <Col xs={12} sm={8} md={6} lg={6} xl={4} xxl={4}>
          <Card style={{ margin: 10 }} bordered={false}>
            <Statistic
              title={props.name}
              value={props.count}
              valueStyle={{ color }}
              prefix={prefix}
              suffix={props.unit}
            />
            <Flex justify="end">
              <Space>
                <Text type="secondary">总计</Text>
                <Text>{props.totalCount}</Text>
                <Text>{props.unit}</Text>
              </Space>
            </Flex>
          </Card>
        </Col>
      </>
    );
  } else {
    return (
      <>
        <Col xs={12} sm={8} md={6} lg={6} xl={4} xxl={4}>
          <Card style={{ margin: 10 }} bordered={false}>
            <Statistic
              title={props.name}
              value={props.count}
              valueStyle={{ color: "#3f8600" }}
              suffix={props.unit}
            />
          </Card>
        </Col>
      </>
    );
  }
};

type BasicChartData = {
  name: string;
  total: number;
};

type BasicChartProps = {
  title: string;
  data: BasicChartData[];
};

const BasicChart: React.FC<BasicChartProps> = (props) => {
  const config = {
    data: props.data,
    xField: "name",
    yField: "total",
    style: {
      // 圆角样式
      radiusTopLeft: 10,
      radiusTopRight: 10,
    },
    onReady: ({ chart }) => {
      try {
        const { height } = chart._container.getBoundingClientRect();
        const tooltipItem =
          props.data[Math.floor(Math.random() * props.data.length)];
        chart.on(
          "afterrender",
          () => {
            chart.emit("tooltip:show", {
              data: {
                data: tooltipItem,
              },
              offsetY: height / 2 - 60,
            });
          },
          true
        );
      } catch (e) {
        console.error(e);
      }
    },
  };
  return (
    <>
      <Card style={{ margin: 10 }}>
        <Column height={300} title={props.title} {...config} />
      </Card>
    </>
  );
};

import { logo } from "../assets";
import { Column } from "@ant-design/charts";

const jobWebsiteList = [
  {
    url: "https://www.zhipin.com/web/geek/job",
    label: "BOSS直聘",
    logo: logo.boss,
  },
  {
    url: "https://we.51job.com/pc/search ",
    label: "前程无忧",
    logo: logo.job51,
  },
  { url: "https://sou.zhaopin.com/", label: "智联招聘", logo: logo.zhilian },
  {
    url: "https://www.lagou.com/wn/zhaopin",
    label: "拉钩网",
    logo: logo.lagou,
  },
  { url: "https://www.liepin.com/zhaopin", label: "猎聘网", logo: logo.liepin },
  { url: "https://hk.jobsdb.com/", label: "Jobsdb-HK", logo: logo.jobsdb },
];

const companyWebsiteList = [
  { url: "https://aiqicha.baidu.com/s", label: "爱企查" },
  { url: "https://beian.miit.gov.cn", label: "工信部" },
  { url: "https://www.creditchina.gov.cn", label: "信用中国" },
  {
    url: "https://www.gsxt.gov.cn/corp-query-homepage.html",
    label: "企业信用",
  },
  { url: "http://zxgk.court.gov.cn/zhzxgk/", label: "执行信息" },
  { url: "https://wenshu.court.gov.cn", label: "裁判文书" },
  { url: "https://xwqy.gsxt.gov.cn", label: "个体私营" },
];

const genNumberArray = (start, count) => {
  let result = [];
  for (let i = start; i <= count; i++) {
    result.push(i.toString().padStart(2, "0"));
  }
  return result;
};
let MONTH_NAME_OBJECT = {
  "01": "一月",
  "02": "二月",
  "03": "三月",
  "04": "四月",
  "05": "五月",
  "06": "六月",
  "07": "七月",
  "08": "八月",
  "09": "九月",
  "10": "十月",
  "11": "十一月",
  "12": "十二月",
};
const MONTH_NAME_ARRAY = genNumberArray(1, 12);
const convertMonthName = (name) => {
  return MONTH_NAME_OBJECT[name] ?? name;
};

let WEEK_NAME_OBJECT = {
  "0": "星期日",
  "1": "星期一",
  "2": "星期二",
  "3": "星期三",
  "4": "星期四",
  "5": "星期五",
  "6": "星期六",
};
let WEEK_NAME_ARRAY = ["1", "2", "3", "4", "5", "6", "0"];
const convertWeekName = (name) => {
  return WEEK_NAME_OBJECT[name] ?? name;
};
const DAY_NAME_ARRAY = genNumberArray(1, 31);
const HOUR_NAME_ARRAY = genNumberArray(0, 23);

const PLATFORM_NAME_ARRAY = [
  PLATFORM_BOSS,
  PLATFORM_51JOB,
  PLATFORM_ZHILIAN,
  PLATFORM_LAGOU,
  PLATFORM_LIEPIN,
  PLATFORM_JOBSDB,
];

const { platformFormat } = useJob();

const COMPANY_START_DATE_NAME_ARRAY = [
  "<1",
  "1-3",
  "3-5",
  "5-10",
  "10-20",
  ">20",
];
const COMPANY_INSURANCE_NAME_ARRAY = [
  "-",
  "<10",
  "10-20",
  "20-50",
  "50-100",
  "100-500",
  "500-1000",
  ">1000",
];
let COMPANY_INSURANCE_OBJECT = {
  "-": "?",
};
const convertCompanyInsuranceName = (name) => {
  return COMPANY_INSURANCE_OBJECT[name] ?? name;
};

const convertToChartData = ({
  queryResult,
  convertNameFunction = null,
  defaultNameArray = null,
}) => {
  let result = [];
  let nameArray = [];
  let nameMap = new Map();
  if (defaultNameArray) {
    defaultNameArray.forEach((name) => {
      nameMap.set(name, null);
      nameArray.push(name);
    });
  }
  queryResult.forEach((item) => {
    if (!nameMap.has(item.name)) {
      nameArray.push(item.name);
    }
  });
  nameArray.forEach((name) => {
    let filterItem = queryResult.filter((item) => {
      return item.name == name;
    });
    result.push({
      name: convertNameFunction ? convertNameFunction(name) : name,
      total: filterItem.length > 0 ? filterItem[0].total : 0,
    });
  });
  return result;
};

const DashboardView: React.FC = () => {
  const [todayStatisticData, setTodayStatisticData] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(
    () => {
      const statistic = async () => {
        const statisticJobBrowse = await JobApi.statisticJobBrowse();
        const statisticCompany = await CompanyApi.statisticCompany();
        const statisticCompanyTag = await CompanyApi.statisticCompanyTag();
        let todayResult = [];
        todayResult.push({
          name: "今天查看职位",
          count: statisticJobBrowse.todayBrowseDetailCount,
          previousCount: statisticJobBrowse.yesterdayBrowseDetailCount,
          totalCount: statisticJobBrowse.totalBrowseDetailCount,
          unit: "个",
        });
        todayResult.push({
          name: "今天职位新增",
          count: statisticJobBrowse.todayJob,
          previousCount: statisticJobBrowse.yesterdayJob,
          totalCount: statisticJobBrowse.totalJob,
          unit: "个",
        });
        todayResult.push({
          name: "今天扫描职位",
          count: statisticJobBrowse.todayBrowseCount,
          previousCount: statisticJobBrowse.yesterdayBrowseCount,
          totalCount: statisticJobBrowse.totalBrowseCount,
          unit: "次",
        });
        todayResult.push({
          name: "今天公司新增",
          count: statisticCompany.todayAddCount,
          previousCount: statisticCompany.yesterdayAddCount,
          totalCount: statisticCompany.totalCompany,
          unit: "个",
        });
        todayResult.push({
          name: "今天标签公司新增",
          count: statisticCompanyTag.todayTagCompany,
          previousCount: statisticCompanyTag.yesterdayTagCompany,
          totalCount: statisticCompanyTag.totalTagCompany,
          unit: "间",
        });
        todayResult.push({
          name: "今天标签新增",
          count: statisticCompanyTag.todayTag,
          previousCount: statisticCompanyTag.yesterdayTag,
          totalCount: statisticCompanyTag.totalTag,
          unit: "个",
        });
        setTodayStatisticData(todayResult);
        let chartResult = [];
        chartResult.push({
          title: "职位发布时间分析(按月)",
          data: convertToChartData({
            queryResult: await JobApi.jobStatisticGrouByPublishDate(
              new JobStatisticGrouByPublishDateBO(TYPE_ENUM_MONTH)
            ),
            defaultNameArray: MONTH_NAME_ARRAY,
            convertNameFunction: convertMonthName,
          }),
        });
        chartResult.push({
          title: "职位发布时间分析(按周)",
          data: convertToChartData({
            queryResult: await JobApi.jobStatisticGrouByPublishDate(
              new JobStatisticGrouByPublishDateBO(TYPE_ENUM_WEEK)
            ),
            defaultNameArray: WEEK_NAME_ARRAY,
            convertNameFunction: convertWeekName,
          }),
        });
        chartResult.push({
          title: "职位发布时间分析(按日)",
          data: convertToChartData({
            queryResult: await JobApi.jobStatisticGrouByPublishDate(
              new JobStatisticGrouByPublishDateBO(TYPE_ENUM_DAY)
            ),
            defaultNameArray: DAY_NAME_ARRAY,
          }),
        });
        chartResult.push({
          title: "职位发布时间分析(按小时)",
          data: convertToChartData({
            queryResult: await JobApi.jobStatisticGrouByPublishDate(
              new JobStatisticGrouByPublishDateBO(TYPE_ENUM_HOUR)
            ),
            defaultNameArray: HOUR_NAME_ARRAY,
          }),
        });
        chartResult.push({
          title: "职位发布平台分析",
          data: convertToChartData({
            queryResult: await JobApi.jobStatisticGrouByPlatform(),
            defaultNameArray: PLATFORM_NAME_ARRAY,
            convertNameFunction: platformFormat,
          }),
        });
        chartResult.push({
          title: "公司成立年份分段分析",
          data: convertToChartData({
            queryResult: await CompanyApi.companyStatisticGrouByStartDate(),
            defaultNameArray: COMPANY_START_DATE_NAME_ARRAY,
          }),
        });
        chartResult.push({
          title: "公司社保人数分段分析",
          data: convertToChartData({
            queryResult: await CompanyApi.companyStatisticGrouByInsurance(),
            defaultNameArray: COMPANY_INSURANCE_NAME_ARRAY,
            convertNameFunction: convertCompanyInsuranceName,
          }),
        });
        setChartData(chartResult);
      };
      statistic();
      return () => {};
    },
    [
      //这里的值改变时，会执行上面return的匿名函数
    ]
  );

  return (
    <>
      <Row gutter={2}>
        {todayStatisticData.map((item, index) => (
          <StatisticCard
            key={index}
            name={item.name}
            count={item.count}
            previousCount={item.previousCount}
            totalCount={item.totalCount}
            unit={item.unit}
          ></StatisticCard>
        ))}
      </Row>
      <Row gutter={2}>
        <Col sm={24} xl={12}>
          <Card size="small" title="招聘网站" style={{ margin: 10 }}>
            <Row>
              {jobWebsiteList.map((item, index) => (
                <Col
                  key={index}
                  xs={12}
                  sm={8}
                  md={6}
                  lg={4}
                  className="cardItem flexCenter"
                >
                  <Link href={item.url} target="_blank" className="flexCenter">
                    <Row>
                      <Col xs={24} className="flexCenter">
                        <img
                          className="companyLogo"
                          src={item.logo}
                          alt="logo"
                        />
                      </Col>
                      <Col xs={24} className="cardLabel flexCenter">
                        <Flex>{item.label}</Flex>
                      </Col>
                    </Row>
                  </Link>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
        <Col sm={24} xl={12}>
          <Card size="small" title="公司查询" style={{ margin: 10 }}>
            <Row>
              {companyWebsiteList.map((item, index) => (
                <Col
                  key={index}
                  xs={12}
                  sm={8}
                  md={6}
                  lg={3}
                  className="cardItem flexCenter"
                >
                  <Link href={item.url} target="_blank" className="flexCenter">
                    <Row>
                      <Col xs={24} className="flexCenter">
                        <Icon className="companyLogo" icon="mdi:web" />
                      </Col>
                      <Col xs={24} className="cardLabel flexCenter">
                        <Flex>{item.label}</Flex>
                      </Col>
                    </Row>
                  </Link>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
      <Row>
        {chartData.map((item, index) => (
          <Col key={index} xs={24} sm={24} md={12} lg={12} xl={8} xxl={6}>
            <BasicChart title={item.title} data={item.data} />
          </Col>
        ))}
      </Row>
    </>
  );
};

export default DashboardView;
