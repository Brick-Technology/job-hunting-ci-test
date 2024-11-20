export class JobStatisticGrouByPublishDateBO{
    /**
     * month,week,day,hour,
     */
    type;

    constructor(type){
        this.type = type;
    }
}

export const TYPE_ENUM_MONTH = "TYPE_ENUM_MONTH";
export const TYPE_ENUM_WEEK = "TYPE_ENUM_WEEK";
export const TYPE_ENUM_DAY = "TYPE_ENUM_DAY";
export const TYPE_ENUM_HOUR = "TYPE_ENUM_HOUR";