export interface Author {
    avatarUrl: string;
    login: string;
}

export interface IssueData {
    id: string;
    number: number;
    title: string;
    bodyUrl: string;
    author: Author;
    createdAt: string;
    lastEditedAt?: any;
    bodyText: string;
    bodyHTML: string;
}