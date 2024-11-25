import { Flex, Tag, Typography } from "antd";
const { Text } = Typography;

import styles from "./JobItemCard.module.css";
import Link from "antd/es/typography/Link";
import { convertTimeOffsetToHumanReadable } from "@/common/utils";

import dayjs from "dayjs";
import { Icon } from "@iconify/react";
import { useJob } from "../hooks/job";
import Paragraph from "antd/es/typography/Paragraph";
import Card from "antd/es/card/Card";

import "./JobItemCard.css";
import { JobData } from "./JobData";
import { QuestionCircleOutlined } from "@ant-design/icons";

const { platformLogo, platformFormat } = useJob();

const getTimeColorByOffsetTimeDay = (datetime) => {
  let offsetTimeDay = -1;
  if (datetime) {
    offsetTimeDay = dayjs().diff(dayjs(datetime), "day");
  }
  if (offsetTimeDay >= 0) {
    if (offsetTimeDay <= 7) {
      return "yellowgreen";
    } else if (offsetTimeDay <= 14) {
      return "green";
    } else if (offsetTimeDay <= 28) {
      return "orange";
    } else if (offsetTimeDay <= 56) {
      return "red";
    } else {
      return "gray";
    }
  } else {
    return "black";
  }
};

export type JobItemCardProps = {
  data: JobData;
  className: string;
  onCardClick?: (data: JobData) => void;
};
const JobItemCard: React.FC<JobItemCardProps> = (props) => {
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
  } = props.data;
  const { name: companyName, companyTagList, url: companyUrl } = company;
  return (
    <>
      <Card
        hoverable={props.onCardClick ? true : false}
        className={`${styles.main} ${props.className}`}
        onClick={() => {
          props.onCardClick(props.data);
        }}
      >
        <Flex className={styles.item}>
          <Link
            onClick={(event) => {
              event.stopPropagation();
            }}
            ellipsis
            underline
            className={styles.name}
            href={url}
            target="_blank"
          >
            {name}
          </Link>
          <Text type="warning" className={styles.salary}>
            {salaryMin} - {salaryMax}
          </Text>
        </Flex>
        <Flex className={styles.marginTop}>
          {companyTagList &&
            companyTagList.map((item, index) => (
              <Tag key={index} color="processing">
                {item.tagName}
              </Tag>
            ))}
        </Flex>
        <Flex className={styles.marginTop}>
          {companyUrl ? (
            <Link
              onClick={(event) => {
                event.stopPropagation();
              }}
              ellipsis
              type="warning"
              underline
              href={companyUrl}
              target="_blank"
            >
              {companyName}
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
        </Flex>
        <Flex className={styles.marginTop}>
          {jobTagList &&
            jobTagList.map((item, index) => (
              <Tag key={index} color="warning">
                {item.tagName}
              </Tag>
            ))}
        </Flex>
        <Flex className={`${styles.marginTop} ${styles.item}`}>
          <Text ellipsis className={styles.address}>
            {address}
          </Text>
          <Text>定位</Text>
        </Flex>
        <Flex className={`${styles.marginTop} ${styles.item}`}>
          <Paragraph ellipsis={{ rows: 3, expandable: false }} title={desc}>
            {desc}
          </Paragraph>
        </Flex>
        <Flex
          className={`${styles.marginTop} ${styles.item}`}
          flex={1}
          style={{ alignItems: "end" }}
        >
          <Tag
            icon={<Icon icon="formkit:datetime" />}
            style={{
              backgroundColor: getTimeColorByOffsetTimeDay(publishDatetime),
              color: "white",
            }}
          >
            {publishDatetime
              ? ` ${convertTimeOffsetToHumanReadable(publishDatetime)}发布`
              : ` 发布时间未知`}
          </Tag>
          <Flex
            flex={1}
            align="end"
            justify="end"
            style={{ overflow: "hidden" }}
          >
            <Text ellipsis>{`${bossName}【${bossPosition}】`}</Text>
            <img
              className={styles.platformLogo}
              src={platformLogo(platform)}
              alt="logo"
            />
            <Text className={styles.platformName}>
              {platformFormat(platform)}
            </Text>
          </Flex>
        </Flex>
      </Card>
    </>
  );
};

export default JobItemCard;
