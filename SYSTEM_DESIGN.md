# System Design Document: Ticket Booking System

## 1. High-Level Architecture

The system follows a typical **Client-Server Architecture** using a REST API.

### Components:
1.  **Client (Frontend)**: built with React & TypeScript. It handles user interactions, specific seat selection state, and communicates with the backend via HTTP.
2.  **Load Balancer (Hypothetical)**: In a production scaling scenario (RedBus level), Nginx or AWS ALB would distribute requests.
3.  **API Server (Backend)**: Built with Node.js & Express. It is stateless, allowing horizontal scaling. It handles authentication, booking logic, and race-condition prevention.
4.  **Database**: PostgreSQL. Acts as the single source of truth for seat availability.
5.  **Background Worker**: A lightweight process (implemented via `setInterval` or external Cron) that cleans up expired `PENDING` bookings.

```mermaid
graph TD
    User[User Browser]
    CDN[CDN (Assets)]
    LB[Load Balancer]
    API[Node.js API Cluster]
    DB[(PostgreSQL Primary)]
    Cache[(Redis - Optional)]

    User --> CDN
    User --> LB
    LB --> API
    API --> DB
    API -.-> Cache
```

## 2. Database Design & Scalability

### Schema
- **Shows**: Stores event metadata (Movie/Bus/Doctor).
- **Seats**: The granular unit of inventory.
    - `id`: PK
    - `show_id`: FK
    - `status`: Enum (AVAILABLE, PENDING, BOOKED)
    - `version`: Integer (for Optimistic Locking - optional)
    - `expires_at`: Timestamp (for cleanup)

### Scalability Strategy
To scale to millions of users (RedBus/BookMyShow level):
1.  **Read Replicas**: Most traffic is "viewing" shows. We would use 1 Primary DB for Writes (Bookings) and multiple Read Replicas for listing shows.
2.  **Sharding**:
    - **By Region**: Partition data by city/state.
    - **By Time**: Archive old shows to Cold Storage; keep only active shows in Hot DB.
3.  **Indexing**: Indices on `show_id` and `status` are crucial (already implemented).

## 3. Concurrency Control (The Core Challenge)

Preventing double-booking is the critical requirement.

### Strategy Used: Pessimistic Locking (Row-Level)
We use PostgreSQL's `SELECT ... FOR UPDATE` mechanism.

**Workflow:**
1.  **Transaction Start (`BEGIN`)**
2.  **Lock Rows**: `SELECT * FROM seats WHERE id IN (...) FOR UPDATE`.
    - This creates a hard lock on the specific seat rows.
    - If User B tries to book the same seats, their transaction waits until User A commits or rolls back.
3.  **Check Status**: Verify seats are still `AVAILABLE`.
4.  **Update**: Set status to `PENDING` with expiry.
5.  **Commit**.

**Why this approach?**
- **Pros**: Strong data consistency. Impossible to double-book if implemented correctly.
- **Cons**: Slightly lower throughput than Optimistic locking, but for ticket booking, correctness > speed.

### Alternative: Optimistic Locking
- Use a `version` column.
- `UPDATE seats SET ... WHERE id = $1 AND version = $2`
- If 0 rows updated, fail.
- *Trade-off*: Better performance for low contention, but high failure rate for users in high-contention (flash sales). Pessimistic is better for user experience (waiting is better than failing).

## 4. Caching Strategy
- **Shows List**: Highly cacheable. Store `GET /shows` response in Redis with a TTL of 1-5 minutes.
- **Seat Availability**: Hard to cache heavily because it changes strictly. We could cache the "Map" but fetch "Status" in real-time.

## 5. Message Queues (Decoupling)
In a larger system, we would use RabbitMQ or Kafka:
1.  **Booking Created** -> Publish Event `Booking.Held`.
2.  **Consumer 1**: Sends Email/SMS.
3.  **Consumer 2**: Starts Payment Gateway timer.
4.  **Consumer 3**: Analytics service.

## 6. Assumptions & Limitations of Proof-of-Concept
- **Auth**: We use a mock User ID. Production would use JWT/OAuth.
- **Payment**: Payment logic is simulated.
- **DB**: Current demo runs on `pg-mem` or local Postgres. Production would use AWS RDS.
