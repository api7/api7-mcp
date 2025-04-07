import axios from "axios";
import _ from "lodash";
import { CONTROL_PLANE_ADDRESS, TOKEN } from "./env.js";

import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

interface RequestOptions {
  pick?: string;
  omit?: string;
  handler?: (data: any) => any;
}

async function makeAPIRequest(path: string, method: string = "GET", data?: object, options?: RequestOptions): Promise<CallToolResult> {
  const baseUrl = CONTROL_PLANE_ADDRESS;
  const url = `${baseUrl}/api${path}`;

  try {
    const response = await axios({
      method,
      url,
      data,
      headers: {
        "X-API-KEY": TOKEN,
        "Content-Type": "application/json",
      },
    });

    let processedData = response.data;
    if (options?.pick) {
      processedData = _.get(response.data, options.pick);
    } else if (options?.omit) {
      processedData = _.omit(response.data, options.omit);
    }

    if (options?.handler) {
      processedData = options.handler(processedData);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(processedData, null, 2),
        },
      ],
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Request failed: ${method} ${url}`);
      console.error(`Status: ${error.response?.status}, Error: ${error.message}`);

      if (error.response?.data) {
        try {
          const stringifiedData = JSON.stringify(error.response.data);
          console.error(`Response data: ${stringifiedData}`);
        } catch {
          console.error(`Response data: [Cannot parse as JSON]`);
        }
      }

      return {
        isError: true,
        content: [
          {
            type: "text",
            text: JSON.stringify(
              `Status: ${error.response?.status}\nMessage: ${error.message}
Data:\n${JSON.stringify(error.response?.data || {}, null, 2)}`,
              null,
              2
            ),
          },
        ],
      };
    } else {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: JSON.stringify(error, null, 2),
          },
        ],
      };
    }
  }
}

export default makeAPIRequest;
