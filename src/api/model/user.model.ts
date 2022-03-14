import { BaseModel } from './base.model';

export class User extends BaseModel {
  public id: any;
  public firstname: string;
  public lastname: string;
  public roles: string[];
}