import { Icon } from "@iconify/react";
import { Tag, Tooltip } from "antd";
import React from "react";
import { TagData } from "../data/TagData";
import styles from "./JobTag.module.css";

interface JobTagProps {
    color?: string,
    item: TagData,
}

const JobTag: React.FC<JobTagProps> = ({
    color, item
}) => {

    return (
        <Tooltip title={item.sourceList.filter(item => item.source != null).map(item => item.source).join(",")} color={color} key={item.tagId}>
            <Tag className={styles.tag} color={color}>{item.isPublic ? <Icon icon="material-symbols:public" /> : <Icon icon="material-symbols:private-connectivity" />}({item.sourceList.length}{item.self ? "*" : ""}){item.tagName}</Tag>
        </Tooltip>
    );
};

export default JobTag;