## Backend docs

This folder contains generated and runtime API documentation assets.

### `swagger.json`

- **File**: `backend/docs/swagger.json`
- **Use**: served by the backend at `GET /swagger.json`

### API documentation UIs

When the backend is running (default port `3001`):

- **ReDoc**: `GET /api-docs`
- **Swagger UI**: `GET /api-test`

### Regenerating the spec

The backend image build runs:

- `npm run swagger:generate-docs`

That script should update `backend/docs/swagger.json`.

