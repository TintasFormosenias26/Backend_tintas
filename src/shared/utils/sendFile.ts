import axios from "axios";
import fs from "fs";
import FromData from "form-data";


export const sendFile = async (path: string): Promise<{ path: string }> => {
  try {
    const form = new FromData();
    form.append("file", fs.createReadStream(path));

    const res = await axios.post<{ path: string }>("http://127.0.0.1:4590/upload", form, {
      headers: {
        ...form.getHeaders(),
      },
    });
    return res.data;
  } catch (error) {
    console.log(error);
    console.log();
    return { path: "" };
  }
};
