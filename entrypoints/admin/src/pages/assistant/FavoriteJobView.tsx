import { AssistantApi } from "@/common/api";
import { SearchFaviousJobBO } from "@/common/data/bo/searchFaviousJobBO";
import { Descriptions, Flex, Modal, Pagination, Splitter } from "antd";
import React from "react";
import JobItemCard from "../../components/JobItemCard";

import Link from "antd/es/typography/Link";
import { JobData } from "../../components/JobData";
import styles from "./FavoriteJobView.module.css";
import JobItemTable from "../../components/JobItemTable";
import CompanyItemTable from "../../components/CompanyItemTable";
import { CompanyData } from "../../components/CompanyData";
import dayjs from "dayjs";

const FavoriteJobView: React.FC = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [jobModalData, setJobModalData] = useState<JobData>();
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [companyModalData, setCompanyModalData] = useState<CompanyData>();

  const getSearchParam = () => {
    let searchParam = new SearchFaviousJobBO();
    searchParam.pageNum = 1;
    searchParam.pageSize = 20;
    // searchParam.nameKeywordList = toRaw(form.nameKeywordList).flatMap(item => item.value);
    // searchParam.nameDislikeKeywordList = toRaw(form.nameDislikeKeywordList).flatMap(item => item.value);
    // searchParam.salary = Number.parseInt(toRaw(form.salary));
    // searchParam.addressKeywordList = toRaw(form.addressKeywordList).flatMap(item => item.value);
    // searchParam.descKeywordList = toRaw(form.descKeywordList).flatMap(item => item.value);
    // searchParam.descDislikeKeywordList = toRaw(form.descDislikeKeywordList).flatMap(item => item.value);
    // searchParam.dislikeCompanyTagList = toRaw(form.dislikeCompanyTagList).flatMap(item => item.code);
    // searchParam.likeJobTagList = toRaw(form.likeJobTagList).flatMap(item => item.code);
    // searchParam.dislikeJobTagList = toRaw(form.dislikeJobTagList).flatMap(item => item.code);
    // searchParam.publishDateOffset = toRaw(form.publishDateOffset);
    // searchParam.bossPositionDislikeKeywordList = toRaw(form.bossPositionDislikeKeywordList).flatMap(item => item.value);
    searchParam.orderByColumn =
      "createDatetime DESC, jobFirstPublishDatetime DESC";
    searchParam.orderBy = "";
    return searchParam;
  };

  useEffect(
    () => {
      const search = async () => {
        let searchResult = await AssistantApi.assistantSearchFaviousJob(
          getSearchParam()
        );
        setTotal(parseInt(searchResult.total));
        setData(searchResult.items);
      };
      search();
      return () => {};
    },
    [
      //这里的值改变时，会执行上面return的匿名函数
    ]
  );

  const onCardClickHandle = (data: JobData) => {
    setJobModalData(data);
    setIsJobModalOpen(true);
  };

  const handleJobModalCancel = () => {
    setIsJobModalOpen(false);
    setJobModalData(null);
  };

  const onCompanyClickHandle = (data: CompanyData) => {
    setCompanyModalData(data);
    setIsCompanyModalOpen(true);
  };

  const handleCompanyModalCancel = () => {
    setIsCompanyModalOpen(false);
    setCompanyModalData(null);
  };

  const convertToJobData = (item: any) => {
    const {
      companyStatus,
      companyStartDate,
      companyIndustry,
      companyUnifiedCode,
      companyTaxNo,
      companyLicenseNumber,
      companyLegalPerson,
      companyWebSite,
      companyInsuranceNum,
      companySelfRisk,
      companyUnionRisk,
      companyAddress,
      companyLongitude,
      companyLatitude,
      companyDesc,
    } = item.companyDTO ?? {};

    return {
      name: item.jobName,
      url: item.jobUrl,
      salaryMin: item.jobSalaryMin,
      salaryMax: item.jobSalaryMax,
      company: {
        name: item.jobCompanyName,
        companyTagList: item.companyTagDTOList,
        url: item.companyDTO?.sourceUrl,
        status: companyStatus,
        startDate: dayjs(companyStartDate),
        industry: companyIndustry,
        unifiedCode: companyUnifiedCode,
        taxNo: companyTaxNo,
        licenseNumber: companyLicenseNumber,
        legalPerson: companyLegalPerson,
        webSite: companyWebSite,
        insuranceNum: companyInsuranceNum,
        selfRisk: companySelfRisk,
        unionRisk: companyUnionRisk,
        address: companyAddress,
        longitude: companyLongitude,
        latitude: companyLatitude,
        desc: companyDesc,
      },
      jobTagList: item.jobTagDTOList,
      address: item.jobAddress,
      publishDatetime: item.jobFirstPublishDatetime,
      bossName: item.bossName,
      bossPosition: item.bossPosition,
      platform: item.jobPlatform,
      desc: item.jobDescription,
      degree: item.jobDegreeName,
      longitude: item.jobLongitude,
      latitude: item.jobLatitude,
    };
  };

  return (
    <>
      <Flex vertical className={styles.main}>
        <Flex
          flex={1}
          vertical={false}
          gap="small"
          wrap
          style={{ overflow: "hidden" }}
        >
          <Splitter style={{ boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)" }}>
            <Splitter.Panel
              collapsible
              defaultSize={380}
              min={380}
              style={{ overflow: "hidden" }}
            >
              <Flex wrap className={styles.itemList}>
                {data.map((item, index) => (
                  <JobItemCard
                    key={index}
                    data={convertToJobData(item)}
                    className={styles.item}
                    onCardClick={onCardClickHandle}
                  ></JobItemCard>
                ))}
              </Flex>
            </Splitter.Panel>
            <Splitter.Panel collapsible>
              <div>Map</div>
            </Splitter.Panel>
          </Splitter>
        </Flex>
        <Flex>
          <Pagination
            className={styles.pagging}
            total={total}
            showSizeChanger
            showTotal={(total) => `共 ${total} 条记录`}
          />
        </Flex>
      </Flex>
      <Modal
        open={isJobModalOpen}
        onCancel={handleJobModalCancel}
        footer={null}
        width="80%"
      >
        <JobItemTable
          data={jobModalData}
          onCompanyClick={onCompanyClickHandle}
        ></JobItemTable>
      </Modal>

      <Modal
        open={isCompanyModalOpen}
        onCancel={handleCompanyModalCancel}
        footer={null}
        width="80%"
      >
        <CompanyItemTable data={companyModalData}></CompanyItemTable>
      </Modal>
    </>
  );
};

export default FavoriteJobView;
