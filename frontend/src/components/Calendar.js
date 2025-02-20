import React from "react";

const Calendar = ({ meetings, onDateSelect, onPopupToggle }) => {
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  // Extract all meeting dates
  const meetingDates = meetings.map((meeting) => meeting.date);

  return (
    <div className="calendar">
      <h3>February 2025</h3>
      <div className="calendar-grid">
        {[...Array(daysInMonth)].map((_, index) => {
          const day = index + 1;
          const dateStr = `2025-02-${day.toString().padStart(2, "0")}`;
          const isMeetingDay = meetingDates.includes(dateStr);

          return (
            <div
              key={day}
              className={`calendar-day ${isMeetingDay ? "meeting-day" : ""}`}
              onClick={() => {
                if (isMeetingDay) {
                  onDateSelect(dateStr);
                  onPopupToggle(true);
                }
              }}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
