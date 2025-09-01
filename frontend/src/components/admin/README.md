# Admin Components

## BookingDetailsModal

A comprehensive modal component that displays detailed booking information when users click on calendar events in the admin interface.

### Features

- **Service Type Recognition**: Automatically detects and displays different information based on booking type (Karaoke, N64, Cafe)
- **Rich Information Display**: Shows customer details, booking times, duration, location, and financial information
- **Responsive Design**: Mobile-friendly layout with proper spacing and typography
- **Accessibility**: Keyboard navigation (ESC to close) and click-outside-to-close functionality
- **Error Handling**: Gracefully handles missing or invalid data

### Usage

The modal is automatically integrated into:

- **AllBookings page** (`/admin/all-bookings`) - Calendar tab
- **FinancePage** (`/admin/finance`) - Calendar tab

### Data Structure

The modal expects calendar event data with the following structure:

```javascript
{
  id: "booking_id",
  serviceType: "karaoke" | "n64" | "cafe",
  status: "confirmed" | "pending" | "cancelled" | "completed",
  revenue: 50.00,
  roomName: "Room Name or Table Info",
  customerName: "Customer Name",
  customerEmail: "customer@email.com",
  start: "2024-01-01T10:00:00Z",
  end: "2024-01-01T12:00:00Z",
  title: "Event Title"
}
```

### Service-Specific Features

#### Karaoke Bookings

- Room information
- Duration calculation
- Purple theme styling

#### N64 Bookings

- Booth information
- Duration calculation
- Blue theme styling

#### Cafe Bookings

- Table information
- Time display
- Green theme styling

### Styling

The modal uses Tailwind CSS classes and includes:

- Service-specific color themes
- Responsive grid layouts
- Hover effects and transitions
- Proper spacing and typography hierarchy

### Future Enhancements

- Edit booking functionality
- Delete booking confirmation
- Status update capabilities
- Customer contact actions
- Booking history timeline
