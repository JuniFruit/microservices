import { RequestHandler } from "express";
import { ApiException } from "../exception/api.exception";
import { downloadService } from "./download.service";
class DownloadContoller {
  download: RequestHandler = async (req, res, next) => {
    try {
      const id = req.params.id;
      if (!id) return next(ApiException.BadRequest("File id is not present request params"));

      downloadService.downloadMp3(id, (req as any).userData.username);
    } catch (error) {
      next(error);
    }
  };
}

export const downloadController = new DownloadContoller();
