import { Client } from './client'
import { Page } from './page'

export type PageParams =
  | { size: number; cursor: undefined }
  | { cursor: string; size: undefined }

export interface QueryParams {
  filter?: string
  filterParams?: Array<string | number>
  cursor?: string
}

export interface SumParams extends QueryParams {
  groupBy?: string[]
}

export interface CreateRequest {
  id?: string
  keyIds?: string[]
  quorum?: number
  tags?: { [s: string]: any }
}

export interface UpdateTagsRequest {
  id: string
  tags?: { [s: string]: any }
}

export interface Key {
  id: string
}
