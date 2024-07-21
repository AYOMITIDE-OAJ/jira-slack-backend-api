export interface IResponse<T> {
  data: T;
  status: number;
  message: string;
}
