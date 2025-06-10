export enum IStepSignUP {
  EMAIL_FIELD = 'EMAIL_FIELD',
  NAME_FIELD = 'NAME_FIELD',
  BIRTHDAY_FIELD = 'BIRTHDAY_FIELD',
  CHOOSE_GENDER = 'CHOOSE_GENDER',
  UPDATE_AVATAR = 'UPDATE_AVATAR',
  INTERESTS = 'INTERESTS',
  UPLOAD_IMAGE = 'UPLOAD_IMAGE',
  WELL_COME_TO_MATCHA = 'WELL_COME_TO_MATCHA',
}

export interface IUser {
  name: string;
  lastName: string;
  age: string;
  email: string;
  password: string;
}