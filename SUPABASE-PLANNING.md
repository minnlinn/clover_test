# Future Supabase plan (not implemented)

## Tables

| Table | Purpose and key relationships |
|---|---|
| `profiles` | One row per `auth.users` user; display name, leaf colour, accessibility preferences. |
| `clover_groups` | A shared Clover, created by a profile. |
| `group_members` | Join table: `group_id`, `profile_id`, role, joined timestamp. Unique pair. |
| `group_invitations` | Pending invitation tied to a group and email/inviter; expiry and accepted timestamp. |
| `diary_entries` | Owner profile, optional group, caption, occurred_at, visibility, status. |
| `diary_media` | Entry attachment metadata: storage path, media type, duration, sort order. |
| `entry_shares` | Explicit grants from an entry to a group or profile. |
| `appointments` | Creator, optional group, title, starts_at, location/notes, reminder configuration. |
| `appointment_access` | Appointment-level access grant for profile or group, with view/edit role. |
| `appointment_history` | Immutable log of appointment edits: actor, before/after JSON, timestamp. |
| `reminders` | Reminder target (entry/appointment/medication), schedule, delivery state. |
| `notifications` | Per-profile delivered notification, payload and read timestamp. |

## Relationship outline

`profiles` has many groups through `group_members`; groups have many members and invitations. Profiles own diary entries and appointments. An entry can be shared through `entry_shares`; shared group timelines query only entries with an appropriate group grant. Diary media belongs to an entry and points to a private Storage object. Appointments use `appointment_access` for family-assisted editing and write every material update to `appointment_history`.

## Security / RLS requirements

Enable RLS on every table. Policies must derive the requester from `auth.uid()`—never from a client-supplied profile id. Members can read only their own group membership rows and groups they belong to. Entry owners retain full control; shared entries are visible only to their owner and the specifically granted active group members. Appointment viewers/editors must have a matching active `appointment_access` record. Invitation acceptance must use a server-side transaction or trusted Edge Function. Storage policies must restrict paths by owner/entry and use signed URLs; do not make diary media public. Use Edge Functions for reminders, notification providers, AI calls and audit-sensitive mutations, keeping provider/API secrets out of the browser.

## Migration path

Keep the current React state interfaces (`entries`, `appointments`, `profile`) and replace their localStorage initialisation with repository functions in `src/services/`. Introduce Supabase only after schema migrations, RLS tests, consent flows, deletion/export handling and a threat review are complete.
