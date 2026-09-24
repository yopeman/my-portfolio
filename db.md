# My Portfolio Database Schema (MongoDB)
## Users
- name
- phone (unique)
- email (unique)
- additional contact information (str)
- bio
- password hash
- role: owner, admin, member, user
- Permission:
  - users: [READ, CREATE, UPDATE, DELETE]
  - about: [...]
  - projects: [...]
  - requests: [...]
  - subscribers: [...]
  - blogs: [...]
  - plans: [...]
- source
- timestamps (createdAt, updatedAt, deletedAt)

## About
- bio
- headline
- Contacts:
  - name
  - title
  - link
  - order
- skills:
  - category
  - name
  - progress (1-100)
  - order (float)
- timestamps (createdAt, updatedAt, deletedAt)

## Projects
- name
- slug (unique)
- description
- problem
- solution
- summary
- order
- tags []
- type: product, case study, tutorial
- Features:
  - name
  - description
  - order
- Stacks:
  - name
  - description
  - order
- Links:
  - type e.g. github, website, youtube
  - link
  - order
- timestamps (createdAt, updatedAt, deletedAt)

## Requests
- user id
- message
- is read
- attached project id
- status
- assigned to
- timeline
- requirements (str)
- min budget
- max budget
- timestamps (createdAt, readAt, repliedAt, deletedAt)

## Subscribers
- email (unique)
- timestamps (createdAt, unsubscribedAt, deletedAt)

## Blogs
- slug (unique)
- type: event, article, blog
- title
- content
- excerpt
- tags []
- author id
- status
- reading time
- Links:
  - type
  - link
- timestamps (createdAt, updatedAt, publishedAt, deletedAt)

## Plans
- slug (unique)
- visibility: [] value in (owner, admin, member, user, guest)
- period: year, half, quarter, month, week, day
- year (e.g. 2026)
- periodNumber
- parent plan (ObjectId → Plans, null for years)
- title
- description
- goal
- target
- Checklists:
  - title
  - description
  - status: pending, in progress, completed, cancelled, failed
  - order
  - timestamps (createdAt, updatedAt, deletedAt)
- start date
- end date
- assigned to: user ids[]
- timestamps (createdAt, updatedAt, deletedAt)

## Feedback:
  - parent entity: about, project, blog, plan
  - parent id
  - type: feedback, comment, reply
  - user id
  - content
  - timestamps (createdAt, updatedAt, deletedAt)

## Reactions:
  - parent entity: about, project, blog, plan, feedback
  - parent id
  - user id
  - type: like, dislike, love
  - timestamps (createdAt, updatedAt, deletedAt)

## Files:
  - parent entity: user, about, project, blog, plan
  - parent id
  - order
  - title
  - alt
  - name
  - path
  - size
  - mime type
  - uploaded by
  - timestamps (createdAt, updatedAt, deletedAt)

<!-- for all use Use partial unique indexes e.g., { email: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } } -->
