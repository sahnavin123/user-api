/* eslint-disable @typescript-eslint/no-explicit-any */
export default class ApiError extends Error {
  statusCode: number;
  data: null | any;
  message: string;
  success: boolean;
  errors: any[];

  constructor(
    statusCode: number,
    message = 'Something went wrong',
    errors: any[] = [],
    stack = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJson() {
    const json: { [key: string]: any } = {};
    json.message = this.message;
    Object.entries(this).forEach(([key, value]) => {
      json[key] = value;
    });

    return json;
  }
}
