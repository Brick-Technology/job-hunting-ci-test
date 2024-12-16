import { dateToStr } from "@/common/utils";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { Descriptions, DescriptionsProps, Tag, Typography } from "antd";
import Link from "antd/es/typography/Link";
import Markdown from "marked-react";
import { useJob } from "../hooks/job";
import { CompanyData } from "../data/CompanyData";
import { JobData } from "../data/JobData";
import styles from "./JobItemTable.module.css";
const { platformFormat } = useJob();
const { Text } = Typography;

export type JobItemTableProps = {
  data: JobData;
  onCompanyClick?: (data: CompanyData) => void;
};
const JobItemTable: React.FC<JobItemTableProps> = (props) => {
  const {
    name,
    url,
    salaryMin,
    salaryMax,
    company,
    jobTagList,
    address,
    publishDatetime,
    bossName,
    bossPosition,
    platform,
    desc,
    longitude,
    latitude,
    degree,
    skillTagList,
    welfareTagList,
  } = props.data;
  const { name: companyName, companyTagList, url: companyUrl } = company;

  const items: DescriptionsProps["items"] = [
    {
      key: "name",
      label: "名称",
      span: 1,
      children: (
        <>
          <Link
            onClick={(event) => {
              event.stopPropagation();
            }}
            ellipsis
            underline
            className={name}
            href={url}
            target="_blank"
          >
            <Text copyable className={styles.name}>
              {name}
            </Text>
          </Link>
        </>
      ),
    },
    {
      key: "degree",
      label: "学历",
      span: 1,
      children: <>{degree}</>,
    },
    {
      key: "platform",
      label: "招聘平台",
      span: 1,
      children: <>{platformFormat(platform)}</>,
    },
    {
      key: "Company",
      label: "公司",
      span: 1,
      children: (
        <>
          {companyUrl ? (
            <Link
              onClick={(event) => {
                event.stopPropagation();
              }}
              ellipsis
              type="warning"
              underline
              target="_blank"
            >
              <Text
                onClick={() => {
                  if (props.onCompanyClick) {
                    props.onCompanyClick(company);
                  }
                }}
                copyable
                ellipsis
                type="warning"
              >
                {companyName}
              </Text>
            </Link>
          ) : (
            <>
              <QuestionCircleOutlined />
              <Link
                onClick={(event) => {
                  event.stopPropagation();
                }}
                ellipsis
                type="warning"
                underline
                href={`https://aiqicha.baidu.com/s?q=${encodeURIComponent(
                  companyName
                )}`}
                target="_blank"
              >
                {companyName}
              </Link>
            </>
          )}
        </>
      ),
    },
    {
      key: "salar",
      label: "薪资",
      span: 1,
      children: (
        <>
          <Text strong type="danger">
            {salaryMin} - {salaryMax}
          </Text>
        </>
      ),
    },
    {
      key: "boss",
      label: "招聘人",
      span: 1,
      children: (
        <>
          <Text ellipsis>{`${bossName}【${bossPosition}】`}</Text>
        </>
      ),
    },
    {
      key: "address",
      label: "工作地址",
      span: 1,
      children: (
        <>
          <Text copyable ellipsis>
            {address}
          </Text>
        </>
      ),
    },
    {
      key: "longitude",
      label: "经纬度",
      span: 1,
      children: (
        <>
          <Text copyable>
            {longitude},{latitude}
          </Text>
        </>
      ),
    },
    {
      key: "publishDate",
      label: "发布时间",
      span: 1,
      children: (
        <>{publishDatetime ? dateToStr(publishDatetime, "YYYY-MM-DD") : `-`}</>
      ),
    },
    {
      key: "jobSkillTag",
      label: "技能标签",
      span: 3,
      children: (
        <>
          {skillTagList
            ? skillTagList.map((item, index) => (
                <Tag bordered={false} key={index} color="processing">
                  {item}
                </Tag>
              ))
            : `无`}
        </>
      ),
    },
    {
      key: "jobWelfareTag",
      label: "福利标签",
      span: 3,
      children: (
        <>
          {welfareTagList
            ? welfareTagList.map((item, index) => (
                <Tag bordered={false} key={index} color="gold">
                  {item}
                </Tag>
              ))
            : `无`}
        </>
      ),
    },
    {
      key: "jobTag",
      label: "职位标签",
      span: 3,
      children: (
        <>
          {jobTagList
            ? jobTagList.map((item, index) => (
                <Tag key={index} color="processing">
                  {item.tagName}
                </Tag>
              ))
            : `无`}
        </>
      ),
    },
    {
      key: "companyTag",
      label: "公司标签",
      span: 3,
      children: (
        <>
          {companyTagList
            ? companyTagList.map((item, index) => (
                <Tag key={index} color="warning">
                  {item.tagName}
                </Tag>
              ))
            : `无`}
        </>
      ),
    },
    {
      key: "desc",
      span: 3,
      label: "职位描述",
      children: (
        <>
          <Markdown gfm={true} breaks={true} isInline={true}>
            {desc}
          </Markdown>
        </>
      ),
    },
  ];

  return (
    <>
      <Descriptions
        size="small"
        title={`${name}-${company.name}`}
        layout="vertical"
        items={items}
      />
    </>
  );
};

export default JobItemTable;
