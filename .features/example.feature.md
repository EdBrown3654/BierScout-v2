# Example Feature: Daily Summary Email

## Goal
Send users a short daily summary email at 8:00 AM local time.

## User Story
As a user, I want a daily summary email so I can catch up quickly.

## Scope
- Email includes top 5 items from the last 24 hours.
- Users can enable or disable the email in settings.

## Out of Scope
- Custom schedules beyond daily.
- Multiple time zones per account.

## Acceptance Criteria
- Users can toggle daily summary emails on or off.
- Emails are sent once per day at 8:00 AM local time.
- Emails are not sent to users who opted out.

## Notes
- Consider rate limiting and deliverability.
- Add basic tracking for delivery failures.
