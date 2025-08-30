# Event Logs API Documentation

This document provides detailed information about the Event Logs API endpoints in the ClothME Analytics service.

## Endpoints

### Log Event

**Endpoint:** `POST /client/log-event`

Records a new event log in the system.

#### Request

- **Headers:**
  - `Content-Type: application/json` (required)
  - `Authorization: Bearer <token>` (required for authentication)
  - `X-token: <api-key>` (required for API key authentication)

- **Body:** LogEventDto object with the following structure:
  ```json
  {
    "userId": "user123",
    "sessionId": "session456",
    "timestamp": "2023-08-29T12:00:00Z",
    "location": "product-page",
    "eventType": "page_view",
    "eventSource": "mobile-app",
    "deviceInfo": {
      "deviceType": "mobile",
      "os": "iOS",
      "osVersion": "16.5",
      "browser": "Safari",
      "browserVersion": "16.5"
    },
    "networkType": "wifi"
  }
  ```

#### Response

- **Success (201 Created):**
  ```json
  {
    "status": 201,
    "error": null,
    "data": {
      "jobId": "job_12345",
      "accountId": "acc_12345",
      "createdAt": "2023-08-29T12:00:00Z"
    }
  }
  ```

- **Error (400 Bad Request):**
  ```json
  {
    "status": 400,
    "error": {
      "message": "Validation failed",
      "status": 400
    },
    "data": null
  }
  ```

### Get Event Logs

**Endpoint:** `GET /client/event-logs`

Retrieves event logs from the system based on query parameters.

#### Request

- **Headers:**
  - `Content-Type: application/json` (required)
  - `Authorization: Bearer <token>` (required for authentication)
  - `X-token: <api-key>` (required for API key authentication)

- **Query Parameters:**
  - `accountId` (required): Account ID to filter logs
  - `jobId` (optional): Job ID to retrieve a specific log
  - `userId` (optional): User ID to filter logs
  - `eventType` (optional): Event type to filter logs

#### Response

- **Success (200 OK) - Single Log:**
  ```json
  {
    "status": 200,
    "error": null,
    "data": [
      {
        "jobId": "job_12345",
        "accountId": "acc_12345",
        "createdAt": "2023-08-29T12:00:00Z",
        "payload": {
          "userId": "user123",
          "sessionId": "session456",
          "timestamp": "2023-08-29T12:00:00Z",
          "location": "product-page",
          "eventType": "page_view",
          "eventSource": "mobile-app",
          "deviceInfo": {
            "deviceType": "mobile",
            "os": "iOS",
            "osVersion": "16.5",
            "browser": "Safari",
            "browserVersion": "16.5"
          },
          "networkType": "wifi"
        }
      }
    ]
  }
  ```

- **Success (200 OK) - Multiple Logs:**
  ```json
  {
    "status": 200,
    "error": null,
    "data": [
      {
        "jobId": "job_12345",
        "accountId": "acc_12345",
        "createdAt": "2023-08-29T12:00:00Z",
        "payload": { /* LogEventDto object */ }
      },
      {
        "jobId": "job_67890",
        "accountId": "acc_12345",
        "createdAt": "2023-08-29T12:05:00Z",
        "payload": { /* LogEventDto object */ }
      }
    ]
  }
  ```

- **Error (400 Bad Request):**
  ```json
  {
    "status": 400,
    "error": {
      "message": "Account ID is required",
      "status": 400
    },
    "data": null
  }
  ```

- **Error (404 Not Found):**
  ```json
  {
    "status": 404,
    "error": {
      "message": "Event log with jobId job_12345 not found",
      "status": 404
    },
    "data": null
  }
  ```

## Implementation Details

### Redis Storage

Event logs are stored in Redis using BullMQ queues. Each log is stored as a job in the queue with the following structure:

```typescript
interface JobData {
  jobId: string;
  body: {
    accountId?: string;
    userId?: string;
    eventType?: string;
    payload?: Record<string, any>;
    createdAt?: string;
    body?: {
      accountId?: string;
      userId?: string;
      eventType?: string;
    };
  };
}
```

### Retrieval Methods

There are two main methods for retrieving event logs:

1. **By Job ID:** Direct retrieval using the job ID, which is the most efficient method.
2. **By Filters:** Retrieval using filters such as accountId, userId, and eventType, which requires scanning through all jobs.

### Best Practices

- Always use jobId for retrieving specific logs when available
- Include accountId in all requests
- Use specific filters to reduce the number of logs returned
- Consider pagination for large result sets (not yet implemented)

## Example Usage

### cURL Examples

**Log an event:**
```bash
curl -X POST "http://localhost:3000/client/log-event" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token" \
  -H "X-token: your_api_key" \
  -d '{
    "userId": "user123",
    "sessionId": "session456",
    "timestamp": "2023-08-29T12:00:00Z",
    "location": "product-page",
    "eventType": "page_view",
    "eventSource": "mobile-app",
    "deviceInfo": {
      "deviceType": "mobile",
      "os": "iOS",
      "osVersion": "16.5",
      "browser": "Safari",
      "browserVersion": "16.5"
    },
    "networkType": "wifi"
  }'
```

**Get a specific log by job ID:**
```bash
curl -X GET "http://localhost:3000/client/event-logs?accountId=acc_12345&jobId=job_12345" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token" \
  -H "X-token: your_api_key"
```

**Get all logs for an account:**
```bash
curl -X GET "http://localhost:3000/client/event-logs?accountId=acc_12345" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token" \
  -H "X-token: your_api_key"
```

**Get logs filtered by user ID and event type:**
```bash
curl -X GET "http://localhost:3000/client/event-logs?accountId=acc_12345&userId=user123&eventType=page_view" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token" \
  -H "X-token: your_api_key"
```
