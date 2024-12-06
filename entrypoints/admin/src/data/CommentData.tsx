export interface Author {
    avatarUrl: string;
    login: string;
}

export interface CommentData {
    id: string;
    bodyUrl: string;
    author: Author;
    createdAt: string;
    lastEditedAt?: any;
    bodyText: string;
    bodyHTML: string;
}

const convertCommentList = (items): Array<CommentData> => {
    const result = [];
    items.forEach(item => {
        result.push(convertComment(item));
    });
    return result;
}

const convertComment = (value): CommentData => {
    const { html_url, created_at, updated_at, body, user, id } = value;
    const { avatar_url, login } = user;
    return {
        id,
        bodyUrl: html_url,
        author: {
            avatarUrl: avatar_url,
            login
        },
        createdAt: created_at,
        lastEditedAt: updated_at,
        bodyText: body,
        bodyHTML: body,
    }
}

export { convertComment, convertCommentList };