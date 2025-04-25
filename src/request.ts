import axios, { AxiosRequestConfig } from "axios";
import _ from "lodash";
import { CONTROL_PLANE_URL, TOKEN } from "./env.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

type RequestParams = AxiosRequestConfig<object> & {
  raw?: boolean;
  options?: {
    pick?: string;
    omit?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler?: (data: any) => any;
  };
};
axios.defaults.baseURL = CONTROL_PLANE_URL;
axios.defaults.headers.common["X-API-KEY"] = TOKEN;
axios.defaults.headers.common["Content-Type"] = "application/json";

async function makeAPIRequest({
  url,
  method = "GET",
  data,
  options,
  params,
  raw = false,
}: RequestParams) {
  try {
    const response = await axios({
      method,
      url,
      data,
      params,
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

    return raw
      ? processedData
      : {
          content: [
            {
              type: "text",
              text: JSON.stringify(processedData, null, 2),
            },
          ],
        };
  } catch (error) {
    if (raw) {
      throw error;
    }
    if (axios.isAxiosError(error)) {
      console.error(`Request failed: ${method} ${url}`);
      console.error(
        `Status: ${error.response?.status}, Error: ${error.message}`
      );
      if (error.response?.data) {
        try {
          const stringifiedData = JSON.stringify(error.response.data, null, 2);
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: stringifiedData,
              },
            ],
          } as CallToolResult;
        } catch {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: `Response data: [Cannot parse as JSON]`,
              },
            ],
          } as CallToolResult;
        }
      } else {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  status: error.response?.status,
                  message: error.message,
                  data: error.response?.data,
                },
                null,
                2
              ),
            },
          ],
        } as CallToolResult;
      }
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
