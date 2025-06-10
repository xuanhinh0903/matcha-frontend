/** RTK Query Tag Types */
export type TagTypes = (typeof tagTypes)[number];
export const tagTypes = [
  'Auth',
  'Profile',
  'Discover',
  'Notifications',
  'Interests',
  'Likes',
] as const;

/** Base Query Types */
export type BaseQueryConfig = {
  baseUrl: string;
  prepareHeaders?: (headers: Headers) => Headers;
};
