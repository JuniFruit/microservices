import fileUpload from "express-fileupload";
import { UPLOAD_CONFIG } from "../config/upload";

const upload = fileUpload(UPLOAD_CONFIG);

export { upload };
