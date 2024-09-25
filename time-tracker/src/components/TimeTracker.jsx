import React, { useState } from 'react';
import { CSVLink } from 'react-csv';

const TimeTracker = () => {
  const [hours, setHours] = useState({
    Monday: '',
    Tuesday: '',
    Wednesday: '',
    Thursday: '',
    Friday: '',
    Saturday: '',
    Sunday: ''
  });

  const handleChange = (day, value) => {
    setHours((prev) => ({ ...prev, [day]: value }));
  };

  const headers = [
    { label: "Day", key: "day" },
    { label: "Hours Worked", key: "hours" }
  ];

  const data = Object.keys(hours).map(day => ({
    day,
    hours: hours[day]
  }));

  return (
    <div style={{ padding: '20px' }}>
      <h1>Weekly Time Tracker</h1>
      
      {Object.keys(hours).map(day => (
        <div key={day}>
          <label>{day}:</label>
          <input
            type="number"
            value={hours[day]}
            onChange={(e) => handleChange(day, e.target.value)}
            placeholder={`Enter hours for ${day}`}
          />
        </div>
      ))}

      <h3>Total Hours: {Object.values(hours).reduce((sum, curr) => sum + Number(curr || 0), 0)}</h3>

      <CSVLink 
        data={data} 
        headers={headers}
        filename="timesheet.csv"
        className="btn btn-primary"
        target="_blank"
      >
        Export to CSV
      </CSVLink>
    </div>
  );
};

export default TimeTracker;