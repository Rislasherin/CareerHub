export interface PaginatedAdminResult<T> {
  organizations?: T[];
  students?: T[];
  companies?: T[];
  interviewers?: T[];
  total: number;
  page: number;
  limit: number;
}
