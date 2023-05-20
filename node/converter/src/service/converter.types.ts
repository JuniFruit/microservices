export type IConsumedMsg = {
  video_id: string;
  email: string;
  video_name: string;
  mp3_name: string | null;
  video_size: number;
  mp3_size: number;
  username: string;
};

export type IMetadata = {
  filename: string;
  mimeType: string;
  username: string;
};
