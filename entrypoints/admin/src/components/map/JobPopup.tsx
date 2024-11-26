import * as React from "react";
import { JobData } from "../../data/JobData";
import { Popup } from "@vis.gl/react-maplibre";
import { Flex, Tag, Typography } from "antd";
import Link from "antd/es/typography/Link";
const { Text } = Typography;
import { dateToStr } from "@/common/utils";
import { useJob } from "../../hooks/job";

const { platformFormat } = useJob();

export type JobPopupProps = {
  data: JobData;
  onClick?: (data) => void;
};
const JobPopup: React.FC<JobPopupProps> = ({ data, onClick }) => {
  const {
    longitude,
    latitude,
    name,
    desc,
    url,
    publishDatetime,
    salaryMin,
    salaryMax,
    degree,
    platform,
    address,
    jobTagList,
  } = data;
  const { name: companyName, companyTagList } = data.company;
  return (
    <>
      <Popup
        style={{ width: "400px" }}
        maxWidth="400px"
        anchor="bottom"
        longitude={Number(longitude)}
        latitude={Number(latitude)}
        onClose={() => onClick(data)}
      >
        <Flex vertical title={desc}>
          <Flex>
            <Text>职位名：</Text>
            <Link style={{ flex: 1 }} ellipsis target="_blank" href={url}>
              {name}
            </Link>
          </Flex>
          <Flex>
            <Text>发布时间：</Text>
            <Text ellipsis>{dateToStr(publishDatetime)}</Text>
          </Flex>
          <Flex>
            <Text>薪资：</Text>
            <Text ellipsis>
              💵{salaryMin} - 💵{salaryMax}
            </Text>
          </Flex>
          <Flex>
            <Text>学历：</Text>
            <Text ellipsis>{degree}</Text>
          </Flex>
          <Flex>
            <Text>招聘平台：</Text>
            <Text ellipsis>{platformFormat(platform)}</Text>
          </Flex>
          <Flex>
            <Text>地址：</Text>
            <Text ellipsis>{address}</Text>
          </Flex>
          <Flex>
            <Text>公司名：</Text>
            <Text ellipsis>{companyName}</Text>
          </Flex>
          <Flex style={{ marginTop: "5px" }}>
            {jobTagList != null ? (
              <>
                <Text>职位标签：</Text>
                {jobTagList.map((item, index) => (
                  <Tag color="#1677ff" key={`${index}`}>
                    {item.tagName}
                  </Tag>
                ))}
              </>
            ) : null}
          </Flex>
          <Flex wrap style={{ marginTop: "5px" }}>
            {companyTagList != null ? (
              <>
                <Text>公司标签：</Text>
                {companyTagList.map((item, index) => (
                  <Tag color="#faad14" key={`${index}`}>
                    {item.tagName}
                  </Tag>
                ))}
              </>
            ) : null}
          </Flex>
        </Flex>
      </Popup>
    </>
  );
};

export default JobPopup;
