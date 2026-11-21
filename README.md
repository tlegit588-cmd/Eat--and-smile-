# Eat & Smile

A responsive food-delivery storefront with a Node.js/Express backend.

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:3000`.

## API

- `GET /api/health` — service health
- `GET /api/menu` — menu; supports `?category=Mains` and `?search=chicken`
- `GET /api/menu/:id` — one menu item
- `POST /api/orders` — create an order
- `GET /api/orders` — list demo orders
- `GET /api/orders/:id` — retrieve an order

Example order:

```json
{
  "address": "123 Market Street",
  "customerName": "Alex",
  "items": [{"id": "crispy-chicken", "quantity": 2}]
}
```

Orders are stored locally in `data/orders.json`. This demo does not process payments or require authentication; add both before production use.
