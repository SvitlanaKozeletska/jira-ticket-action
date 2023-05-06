// interfaces
export interface JIRAIssueCreateMetadata {
  expand: string;
  projects: ProjectIssueCreateMetadata[];
}

export interface ProjectIssueCreateMetadata {
  id: string;
  issuetypes: IssueTypeIssueCreateMetadata[];
  key: string;
  name: string;
  [key: string]: any;
}

export interface IssueTypeIssueCreateMetadata {
  description: string;
  fields: FieldMetadata;
  id: string;
  name: string;
  [key: string]: any;
}

export interface FieldMetadata {
  allowedValues?: any[] | undefined;
  defaultValue?: any;
  hasDefaultValue?: boolean;
  key: string;
  name: string;
  operations: string[];
  required: boolean;
  schema: object;
}

// wrapper module type fetch response data
export function request<TResponse>(
  url: string,
  // `RequestInit` is a type for configuring
  // a `fetch` request. By default, an empty object.
  config: RequestInit = {}
): Promise<TResponse> {
  return fetch(url, config)
    // When got a response call a `json` method on it
    .then((response) => response.json())
    // and return the result data
    .then((data) => data as TResponse);

}
