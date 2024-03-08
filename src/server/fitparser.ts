import { createRequire } from "module";
const require = createRequire(import.meta.url);
const FitFileParser = require("fit-file-parser").default;

export const parseFitFile = (fitFile: Buffer) => {
  new FitFileParser({ mode: "list" }).parse(fitFile, (error: any, data: any) => {
    if (error) {
      console.error(error);
    } else {
      console.log(data);
    }
  });
};
