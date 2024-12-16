import { useState, useEffect, useRef } from "react";
import "./DatePicker.css"; // Optional for styling
// import ArrowLeftWideLineIcon from "remixicon-react/ArrowLeftWideLineIcon";
import ArrowLeftSFillIcon from "remixicon-react/ArrowLeftSFillIcon";
import ArrowRightSFillIcon from "remixicon-react/ArrowRightSFillIcon";

const HorizontalDatePicker = () => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const daysContainerRef = useRef(null); // Ref for the scrollable days container
  const selectedDayRef = useRef(null); // Ref for the selected/today date

  const monthArr = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Helper function: get all days in the current month
  const getDaysInMonth = (year, month) => {
    const days = [];
    const totalDays = new Date(year, month + 1, 0).getDate(); // Get last day of month
    for (let day = 1; day <= totalDays; day++) {
      days.push(new Date(year, month, day)); // Push each date into array
    }
    return days;
  };

  // Check if two dates are equal
  const isSameDate = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(parseInt(event.target.value, 10));
  };

  const handleYearChange = (event) => {
    setSelectedYear(parseInt(event.target.value, 10));
  };

  // Scroll the selected day into view on page load
  useEffect(() => {
    if (selectedDayRef.current && daysContainerRef.current) {
      const parent = daysContainerRef.current;
      const child = selectedDayRef.current;

      const childOffset = child.offsetLeft;
      const parentWidth = parent.offsetWidth;
      const childWidth = child.offsetWidth;

      parent.scrollTo({
        left: childOffset - parentWidth / 2 + childWidth / 2,
        behavior: "smooth",
      });
    }
  }, [selectedDate, selectedMonth, selectedYear]); // Trigger when selected date changes

  // Generate years for the dropdown (last 5 years + next 5 years)
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      years.push(i);
    }
    return years;
  };

  // Render days for the current month
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  // Scroll days container left or right
  const scrollDays = (direction) => {
    if (daysContainerRef.current) {
      daysContainerRef.current.scrollBy({
        left: direction === "left" ? -100 : 100,
        behavior: "smooth",
      });
    }
  };
  return (
    <div className="horizontal-date-picker">
      <div className="month-year-selector-container">
        {/* Month Dropdown */}
        <select
          className="month-select"
          value={selectedMonth}
          onChange={handleMonthChange}
        >
          {monthArr.map((month, index) => (
            <option key={index} value={index}>
              {month}
            </option>
          ))}
        </select>
        <div className="dot-seperator">{"."}</div>
        {/* Year Dropdown */}
        <select
          className="year-select"
          value={selectedYear}
          onChange={handleYearChange}
        >
          {generateYearOptions().map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      {/* Day Picker with Arrows */}
      <div className="days-navigation">
        <button className="scroll-arrow " onClick={() => scrollDays("left")}>
          <ArrowLeftSFillIcon />
        </button>

        <button className="scroll-arrow " onClick={() => scrollDays("right")}>
          <ArrowRightSFillIcon />
        </button>
      </div>
      <div className="days-in-month" ref={daysContainerRef}>
        {daysInMonth.map((date) => (
          <div
            key={date.getTime()} // Unique key for React
            className={`day ${isSameDate(date, today) ? "today" : ""} ${
              isSameDate(date, selectedDate) ? "selected" : ""
            }`}
            onClick={() => setSelectedDate(date)} // Update selected date
            ref={isSameDate(date, selectedDate) ? selectedDayRef : null} // Assign ref to the selected date
          >
            <p className="day-of-week">
              {date.toLocaleString("en-us", { weekday: "short" })}
            </p>
            <p className="date">{date.getDate()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HorizontalDatePicker;
