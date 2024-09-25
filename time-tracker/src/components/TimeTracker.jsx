import React, { useState, useEffect } from 'react';
import { CSVLink } from 'react-csv';
import dayjs from 'dayjs';

const TimeTracker = () => {
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [timeData, setTimeData] = useState({});
  const [totalTime, setTotalTime] = useState({});

  // Get the current month and number of days in it
  const currentMonth = dayjs().format('MMMM YYYY');
  const currentYear = dayjs().year();
  const currentMonthNumber = dayjs().month() + 1;

  useEffect(() => {
    const days = Array.from({ length: dayjs(`${currentYear}-${currentMonthNumber}-01`).daysInMonth() }, (_, i) => ({
      date: dayjs(`${currentYear}-${currentMonthNumber}-${i + 1}`),
      day: dayjs(`${currentYear}-${currentMonthNumber}-${i + 1}`).format('dddd'),
    }));
    setDaysInMonth(days);
  }, [currentYear, currentMonthNumber]);

  const handleTimeChange = (day, type, value) => {
    setTimeData((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: value,
      },
    }));
  };

  const calculateWorkedTime = (arrival, departure) => {
    // Ensure both arrival and departure times are provided
    if (!arrival || !departure) return 0;

    const arrivalTime = dayjs(arrival, 'HH:mm');
    const departureTime = dayjs(departure, 'HH:mm');

    // Ensure departure is after arrival, otherwise return 0
    if (!arrivalTime.isValid() || !departureTime.isValid() || departureTime.isBefore(arrivalTime)) {
      return 0;
    }

    const diffInMinutes = departureTime.diff(arrivalTime, 'minute');
    return diffInMinutes > 0 ? diffInMinutes : 0; // Ensure non-negative result
  };

  // Calculate total hours worked each week and for the month
  useEffect(() => {
    let totalMinutes = 0;
    let weeklyMinutes = [];
    let currentWeekMinutes = 0;

    daysInMonth.forEach((day, index) => {
      const { arrival = null, departure = null } = timeData[day.date.format('YYYY-MM-DD')] || {};
      const workedMinutes = calculateWorkedTime(arrival, departure);
      totalMinutes += workedMinutes;
      currentWeekMinutes += workedMinutes;

      // Check if the day is a Sunday or the last day of the month to summarize the week
      if (day.date.day() === 0 || index === daysInMonth.length - 1) {
        weeklyMinutes.push(currentWeekMinutes);
        currentWeekMinutes = 0;
      }
    });

    setTotalTime({
      totalHours: Math.floor(totalMinutes / 60),
      totalMinutes: totalMinutes % 60,
      weeklyMinutes,
    });
  }, [timeData, daysInMonth]);

  const headers = [
    { label: 'Date', key: 'date' },
    { label: 'Arrival', key: 'arrival' },
    { label: 'Departure', key: 'departure' },
    { label: 'Worked Hours', key: 'workedHours' },
  ];

  const data = daysInMonth.map((day) => {
    const { arrival = '', departure = '' } = timeData[day.date.format('YYYY-MM-DD')] || {};
    const workedMinutes = calculateWorkedTime(arrival, departure);
    const workedHours = `${Math.floor(workedMinutes / 60)}h ${workedMinutes % 60}m`;

    return {
      date: day.date.format('YYYY-MM-DD'),
      arrival,
      departure,
      workedHours,
    };
  });

  return (
    <div style={{ padding: '20px' }}>
      <h1>Time Tracker for {currentMonth}</h1>

      {daysInMonth.map((day) => (
        <div key={day.date.format('YYYY-MM-DD')} style={{ marginBottom: '10px' }}>
          <strong>{day.day}, {day.date.format('MMMM D')}</strong>
          <div>
            <label>Arrival Time:</label>
            <input
              type="time"
              value={timeData[day.date.format('YYYY-MM-DD')]?.arrival || ''}
              onChange={(e) => handleTimeChange(day.date.format('YYYY-MM-DD'), 'arrival', e.target.value)}
            />
            <label style={{ marginLeft: '10px' }}>Departure Time:</label>
            <input
              type="time"
              value={timeData[day.date.format('YYYY-MM-DD')]?.departure || ''}
              onChange={(e) => handleTimeChange(day.date.format('YYYY-MM-DD'), 'departure', e.target.value)}
            />
          </div>
        </div>
      ))}

      <h3>Total Time Worked: {totalTime.totalHours} hours and {totalTime.totalMinutes} minutes</h3>

      <h4>Weekly Summary:</h4>
      {totalTime.weeklyMinutes && totalTime.weeklyMinutes.map((minutes, index) => (
        <p key={index}>
          Week {index + 1}: {Math.floor(minutes / 60)} hours and {minutes % 60} minutes
        </p>
      ))}

      <CSVLink 
        data={data}
        headers={headers}
        filename={`timesheet_${currentMonth}.csv`}
        className="btn btn-primary"
        target="_blank"
      >
        Export Timesheet to CSV
      </CSVLink>
    </div>
  );
};

export default TimeTracker;