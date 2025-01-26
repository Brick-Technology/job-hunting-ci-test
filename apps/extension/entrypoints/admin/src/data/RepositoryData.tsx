export interface Owner {
	login: string;
	avatarUrl: string;
}

export interface RepositoryData {
	id: string;
	owner: Owner;
	name: string;
	createdAt: string;
	updatedAt: string;
	stargazerCount: number;
}