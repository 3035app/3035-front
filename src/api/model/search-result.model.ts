import { BaseModel } from './base.model';
import {Processing} from "@api/model/processing.model";

export class SearchResult extends BaseModel {

  public id: Number;
  public type: string;
  public structure_name: string;
  public folder_name: string;
  public processing_name: string;

}
