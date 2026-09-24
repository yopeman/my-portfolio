# Users
- id
- name
- email
- password hash
- role: owner, admin, member
- timestamp (created at, updated at, deleted at)

# Profile
- id
- bio
- headline
- Contacts:
  - name
  - title
  - link
- skills:
  - category
  - name
  - progress (int e.g 91%)
- Files:
  - name
  - path
  - size
  - mime type

# Projects
- id
- name
- slug
- description
- problem
- solution
- summary
- order (float)
- tags (comma separated string)
- Features:
  - name
  - description
- Stacks:
  - name
  - description
- Links:
  - type e.g. github, website, youtube
  - link
- Attachments:
  - name
  - path
  - size
  - mime type
- Comments:
  - name
  - content
  - like count
  - dislike count
  - love count
  - Replays:
    - name
    - content
    - like count
    - dislike count
    - love count

# Requests
- id
- name
- email
- phone
- message
- is read

# Subscribers
- id
- email

# Blogs
- id
- slug
- content
- tags
- like count
- dislike count
- love count
- Links:
  - type
  - link
- Attachments:
  - name
  - path
  - size
  - mime type
- Comments:
  - name
  - content
  - like count
  - dislike count
  - love count
  - Replays:
    - name
    - content
    - like count
    - dislike count
    - love count