import {
  Button,
  Flex,
  Form,
  FormProps,
  Input,
  Radio,
  Select,
  Space,
} from "antd";
import React from "react";
import { FavoriteJobSettingData } from "../../data/FavoriteJobSettingData";
import SubmitButton from "../../components/SubmitButton";

export type FavoriteJobSettingProps = {
  data: FavoriteJobSettingData;
  whitelist?: { value: string; label: string }[];
  onSave: (data: FavoriteJobSettingData) => void;
};

const publishDateOffsetOptions = [
  { label: "没要求", value: -1 },
  { label: "一周内", value: 604800000 },
  { label: "两周内", value: 1209600000 },
  { label: "一个月内", value: 2620800000 },
  { label: "两个月内", value: 5241600000 },
  { label: "三个月内", value: 7862400000 },
  { label: "半年内", value: 15724800000 },
  { label: "一年内", value: 31449600000 },
];

const sortModeOptions = [
  { label: "最近发现在前面", value: 0 },
  { label: "最近发布在前面", value: 1 },
];

const FavoriteJobSettingView: React.FC<FavoriteJobSettingProps> = (props) => {
  const [form] = Form.useForm();

  const onSave: FormProps<FavoriteJobSettingData>["onFinish"] = (values) => {
    props.onSave(values);
  };

  return (
    <>
      <Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        initialValues={{ ...props.data }}
        onFinish={onSave}
        autoComplete="off"
      >
        <Form.Item<FavoriteJobSettingData>
          label="职位名关键字"
          name="nameKeywordList"
        >
          <Select
            allowClear
            mode="tags"
            style={{ width: "100%" }}
            placeholder="请输入职位名关键字"
          />
        </Form.Item>
        <Form.Item<FavoriteJobSettingData>
          label="职位名排除关键字"
          name="nameDislikeKeywordList"
        >
          <Select
            allowClear
            mode="tags"
            style={{ width: "100%" }}
            placeholder="请输入职位名排除关键字"
          />
        </Form.Item>
        <Form.Item<FavoriteJobSettingData> label="预期工资/月" name="salary">
          <Input allowClear type="number" placeholder="请输入预期工资" />
        </Form.Item>
        <Form.Item<FavoriteJobSettingData>
          label="工作地点"
          name="addressKeywordList"
        >
          <Select
            allowClear
            mode="tags"
            style={{ width: "100%" }}
            placeholder="请输入工作地点关键字"
          />
        </Form.Item>
        <Form.Item<FavoriteJobSettingData>
          label="职位描述关键字"
          name="descKeywordList"
        >
          <Select
            allowClear
            mode="tags"
            style={{ width: "100%" }}
            placeholder="请输入职位描述关键字"
          />
        </Form.Item>
        <Form.Item<FavoriteJobSettingData>
          label="职位描述排除关键字"
          name="descDislikeKeywordList"
        >
          <Select
            allowClear
            mode="tags"
            style={{ width: "100%" }}
            placeholder="请输入职位描述排除关键字"
          />
        </Form.Item>
        <Form.Item<FavoriteJobSettingData>
          label="招聘人职位排除关键字"
          name="bossPositionDislikeKeywordList"
        >
          <Select
            allowClear
            mode="tags"
            style={{ width: "100%" }}
            placeholder="请输入招聘人职位排除关键字"
          />
        </Form.Item>
        <Form.Item<FavoriteJobSettingData>
          label="喜欢的职位标签"
          name="likeJobTagList"
        >
          <Select
            allowClear
            mode="tags"
            style={{ width: "100%" }}
            placeholder="请输入喜欢的职位标签"
            options={props.whitelist}
          />
        </Form.Item>
        <Form.Item<FavoriteJobSettingData>
          label="不喜欢的职位标签"
          name="dislikeJobTagList"
        >
          <Select
            allowClear
            mode="tags"
            style={{ width: "100%" }}
            placeholder="请输入不喜欢的职位标签"
            options={props.whitelist}
          />
        </Form.Item>
        <Form.Item<FavoriteJobSettingData>
          label="不喜欢的公司标签"
          name="dislikeCompanyTagList"
        >
          <Select
            mode="tags"
            style={{ width: "100%" }}
            placeholder="请输入不喜欢的公司标签"
            options={props.whitelist}
          />
        </Form.Item>
        <Form.Item<FavoriteJobSettingData>
          label="职位发布时间"
          name="publishDateOffset"
        >
          <Radio.Group>
            {publishDateOffsetOptions.map((item, index) => (
              <Radio key={index} value={item.value}>
                {item.label}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>
        <Form.Item<FavoriteJobSettingData> label="排序" name="sortMode">
          <Radio.Group>
            {sortModeOptions.map((item, index) => (
              <Radio key={index} value={item.value}>
                {item.label}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>
        <Form.Item label={null}>
          <Flex justify="end">
            <Space>
              <SubmitButton form={form}>保存</SubmitButton>
              <Button htmlType="reset">重置</Button>
            </Space>
          </Flex>
        </Form.Item>
      </Form>
    </>
  );
};

export default FavoriteJobSettingView;
