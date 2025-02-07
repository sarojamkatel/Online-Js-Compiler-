export interface IUser {
  email: string;
  password: string;
}
export interface INewUser {
  name: string;
  email: string;
  password: string;
}

export interface IUserId {
  userId: string;
  name: string;
  email: string;
}

export interface IupdateUser {
  oldPassword: string;
  newPassword: string;
}

export interface IFileData {
  fileName: string;
  fileData: string;
}

export interface IUserFile {
  data: IFileData[];
}
export interface IErrorResponse {
  message: string;
}

export interface ILocalUser {
  accesstoken: string;
  refreshtoken: string;
  name: string;
}

export interface PaginationMeta {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}
