/* eslint-disable @typescript-eslint/no-unsafe-assignment */
export interface IErrorReturnType {
    status: number;
    message: string;
}

export class ErrorReturnType {
    status: number;
    message: string;

    constructor(status: number, message: string) {
        this.status = status;
        this.message = message;
    }

    getStatus(): number {
        return this.status;
    }

    getMessage(): string {
        return this.message;
    }
}

export class ResponseReturnType {
    data: any;
    status: number;
    error: ErrorReturnType | null;

    constructor(data: any, status: number, error: ErrorReturnType | null) {
        this.data = data;
        this.status = status;
        this.error = error;
    }

    getData(): any {
        return this.data;
    }

    getStatus(): number {
        return this.status;
    }

    getMessage(): ErrorReturnType | null {
        return this.error;
    }
}

// Define a proper error interface to avoid 'any' type
interface ErrorWithMessage {
    message: string;
    stack?: string;
}

// Type guard to check if an error has a message property
function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
    return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as Record<string, unknown>).message === 'string'
    );
}

// Function to convert unknown error to ErrorWithMessage
export function toErrorWithMessage(error: unknown): ErrorWithMessage {
    if (isErrorWithMessage(error)) {
        return error;
    }

    try {
        return new Error(JSON.stringify(error));
    } catch {
        // fallback in case there's an error stringifying the error
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        return new Error(String(error));
    }
}