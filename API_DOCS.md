# API Docs

This document describes the backend API endpoints for the commerce agent.

Base URL for local development:

`http://localhost:8000`

## `GET /health`

### Purpose

Simple health check endpoint to confirm the backend is running.

### Request

No request body.

### Response

```json
{
  "status": "ok"
}
```

## `GET /products`

### Purpose

Returns the full predefined product catalog loaded from the CSV file.

### Request

No request body.

### Response

```json
[
  {
    "id": 1,
    "name": "Lumen Desk Lamp",
    "price": 98,
    "category": "Lighting",
    "tag": "Best Seller",
    "image_url": "https://example.com/lamp.jpg"
  }
]
```

### Notes

- data is loaded from `backend/data/products.csv`
- this endpoint is used by the browser page when the app first loads

## `POST /chat`

### Purpose

Sends the recent conversation and optional image to the AI assistant. The backend asks the model to return a text reply plus recommended catalog product IDs.

### Content type

`multipart/form-data`

### Form fields

- `messages_json` required: JSON string in the shape `{ "messages": [...] }`
- `image` optional: uploaded image file

### `messages_json` format

```json
{
  "messages": [
    {
      "role": "user",
      "content": "I need a lamp for a small desk."
    }
  ]
}
```

### Example request behavior

- if no image is included, the model handles general chat or text-based recommendation
- if an image is included, the backend sends the image into the AI workflow when supported by the SDK

### Response

```json
{
  "reply": "A compact desk lamp would fit well. I recommend the Lumen Desk Lamp.",
  "products": [
    {
      "id": 1,
      "name": "Lumen Desk Lamp",
      "price": 98,
      "category": "Lighting",
      "tag": "Best Seller",
      "image_url": "https://example.com/lamp.jpg"
    }
  ]
}
```

### Error cases

- `422 Unprocessable Entity`: invalid `messages_json`
- `502 Bad Gateway`: OpenAI request failed

### Notes

- the backend limits recommendations to products found in the predefined catalog
- the frontend sends only the 10 most recent messages for context to reduce payload size and keep requests lighter
- if the OpenAI client cannot be configured, the backend returns a fallback reply indicating that `OPENAI_API_KEY` is missing
