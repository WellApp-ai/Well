# Available Tools

Well MCP provides the following tools for interacting with your financial data.

## well_get_schema

Discover available data types and fields.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `root` | string | No | `invoices`, `companies`, `people`, `documents`, `connectors` |
| `depth` | number | No | 0=scalars, 1=relations (default), 2=nested |

**Example:**

```
well_get_schema({ root: "invoices", depth: 1 })
```

**Use cases:**
- "What fields are available for invoices?"
- "Show me the schema for companies"

---

## well_query_records

Query records from Well's database.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `root` | string | Yes | Entity type |
| `fields` | array | No* | Field paths as arrays |
| `allFields` | boolean | No* | Fetch all scalar fields |
| `limit` | number | No | Max records (default 50, max 500) |

*Either `fields` or `allFields: true` required

**Example:**

```
well_query_records({
  root: "invoices",
  fields: [
    ["invoices", "invoice_number"],
    ["invoices", "grand_total"],
    ["invoices", "issue_date"],
    ["invoices", "issuer", "name"]
  ],
  limit: 100
})
```

**Use cases:**
- "Show me all unpaid invoices over 1000 EUR"
- "List companies with their contact info"
- "Find invoices from last month"

---

## well_create_company

Create a new company.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Company name |
| `domain` | string | No | Website domain |
| `tax_id` | string | No | Tax ID |

**Example:**

```
well_create_company({
  name: "Acme Corp",
  domain: "acme.com"
})
```

**Use cases:**
- "Create a new company called Acme Corp"
- "Add a supplier with tax ID 12345"

---

## well_create_person

Create a new contact.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `first_name` | string | Yes | First name |
| `last_name` | string | No | Last name |
| `email` | string | No | Email address |
| `phone` | string | No | Phone (E.164 format) |

**Example:**

```
well_create_person({
  first_name: "John",
  last_name: "Doe",
  email: "john@acme.com"
})
```

**Use cases:**
- "Create a contact for John Doe at john@acme.com"
- "Add a new person with phone +1234567890"

---

## Coming Soon

The following data types are in development:

| Root | Description |
|------|-------------|
| `payments` | Query payment transactions |
| `payment_means` | Manage payment methods (cards, bank accounts) |
| `accounts` | Connected financial accounts |

Want early access? Contact support@wellapp.ai
