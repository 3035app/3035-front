import { BaseModel } from './base.model';
import {Processing} from "@api/model/processing.model";

export class Search extends BaseModel {

  public value: string;
  public results: Array<Processing>;

}
