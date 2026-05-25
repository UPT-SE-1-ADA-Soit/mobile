# Application Architecture

## Big Picture

```
┌─────────────────────────────────────────┐
│           Mobile App (Expo)             │  ← YOU ARE HERE
│         React Native + TypeScript       │
└─────────────────┬───────────────────────┘
                  │ HTTP / WebSocket
┌─────────────────▼───────────────────────┐
│          AWS API Gateway                │
│         (single entry point)            │
└──┬──────────────┬───────────────┬───────┘
   │              │               │
┌──▼───┐   ┌──────▼─────┐  ┌─────▼──────┐
│ Auth │   │  Product   │  │ Messaging  │
│ Svc  │   │   Service  │  │  Service   │
└──┬───┘   └──────┬─────┘  └─────┬──────┘
   │              │               │
└──▼──────────────▼───────────────▼───────┘
               Supabase
       (Postgres DB + Storage + Realtime)
```

---

## Frontend — `d:\Denis\Programming\Faculty\ADA\mobile\`

### Screens — `app/`

Every file here is a route. Screens only compose components and call context/hooks — no business logic lives here.

| File | Route | Purpose |
|------|-------|---------|
| `landing.tsx` | `/landing` | Public browse page |
| `(auth)/login.tsx` | `/login` | Login form |
| `(auth)/register.tsx` | `/register` | Register form |
| `(tabs)/index.tsx` | `/` | Home (authenticated) |
| `(tabs)/search.tsx` | `/search` | Search + category browse |
| `(tabs)/sell.tsx` | `/sell` | Create listing form |
| `(tabs)/messages.tsx` | `/messages` | Conversation list |
| `(tabs)/profile.tsx` | `/profile` | User profile + tabs |
| `product/[id].tsx` | `/product/:id` | Product detail |
| `chat/[id].tsx` | `/chat/:id` | Chat screen |

### UI Components — `components/`

Reusable visual pieces. No API calls. No navigation logic.

| File | Used in |
|------|---------|
| `product-card.tsx` | Home, Search, Landing, Profile |
| `conversation-card.tsx` | Messages tab |
| `category-pill.tsx` | Home, Search, Landing |
| `condition-badge.tsx` | Product detail, Sell form |
| `input-field.tsx` | Login, Register |

### Global State — `context/`

Shared state that multiple screens need simultaneously.

| File | What it holds |
|------|---------------|
| `context/auth.tsx` | Logged-in user, login/register/logout functions |
| `context/likes.tsx` | Set of liked product IDs, toggleLike function |

### Mock Data — `mocks/`

Temporary. Every file here has a `// TODO: replace with GET /api/...` comment showing exactly which API endpoint replaces it.

```
mocks/
  products.ts   →  GET /api/products
  users.ts      →  GET /api/users
  categories.ts →  GET /api/categories
  messages.ts   →  GET /api/conversations
```

### Types — `types/index.ts`

Shared TypeScript types (`User`, `Product`, `Conversation`, `Message`, etc.). These must match exactly what the backend returns.

### Constants — `constants/theme.ts`

Colours, spacing — nothing dynamic.

---

## Where API Calls Live and How They Work

Currently every call is mocked with a `MOCK_*` array. When the backend is ready, each mock gets replaced in the same file, at the same line — nothing else changes.

**Pattern used throughout the app:**

```ts
// BEFORE (mock)
const products = MOCK_PRODUCTS.filter(p => p.category.id === selectedCategory);

// AFTER (real API)
// TODO: replace with GET /api/products?categoryId={selectedCategory}
const { data: products } = await supabase
  .from('products')
  .select('*')
  .eq('category_id', selectedCategory);
```

**Where each category of call should live:**

| Type | Where to put it | Example |
|------|-----------------|---------|
| Fetch data for a screen | Inside the screen file, directly | `app/(tabs)/index.tsx` fetches recommended products |
| Create / update / delete | Inside the screen that owns the action | `app/(tabs)/sell.tsx` POSTs a new product |
| Auth operations | `context/auth.tsx` only | login, register, logout |
| Liked/saved state | `context/likes.tsx` | `toggleLike` syncs with DB |
| Realtime (chat) | `app/chat/[id].tsx` | Supabase channel subscription |

> **Rule:** screens call the API directly (no service layer) because this is a teaching project — the fewer abstraction layers, the easier to follow. If the project grows and the same call appears in 3+ places, extract it to a custom hook in `hooks/`.

---

## Backend — (built by your teammate)

The mobile app never talks to Supabase directly for data (only for auth). All data requests go through the AWS API Gateway which routes to the correct microservice.

| Service | Responsibility | Relevant screens |
|---------|---------------|------------------|
| Auth Service | Sign up, sign in, token validation | `context/auth.tsx` |
| Product Service | CRUD products, search, recommendations | Home, Search, Product detail, Sell |
| Messaging Service | Conversations, messages, realtime | Messages tab, Chat screen |
| Supabase Storage | Product images, avatars | Sell form, Edit profile |

---

## Data Flow — Example: Opening a Product

```
User taps card
      ↓
ProductCard.onPress() → router.push('/product/p1')
      ↓
app/product/[id].tsx mounts
      ↓
MOCK_PRODUCTS.find(p => p.id === 'p1')        ← replace with GET /api/products/p1
      ↓
Renders UI using types/index.ts Product type
      ↓
User taps Message → checks useAuth() → if no user → /(auth)/login
                                     → if user    → GET /api/conversations?productId=p1
```
