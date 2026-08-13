import React, { useState, useEffect } from 'react';
import './seat-picker.css';

const SeatPicker = ({ onSeatsSelected, initialSeats = [], maxSeatsAllowed = 10 }) => {
  // Seat layout configuration: 6 rows, A/B on left, aisle, C/D on right
  const rows = [1, 2, 3, 4, 5, 6];
  const colsLeft = ['A', 'B'];
  const colsRight = ['C', 'D'];

  // Pre-occupied seat IDs for realistic feel
  const occupiedSeats = ['1B', '2C', '4A', '5D'];
  const vipSeats = ['1A', '1D', '2A', '2D'];

  const [selectedSeats, setSelectedSeats] = useState(initialSeats);

  useEffect(() => {
    onSeatsSelected(selectedSeats);
  }, [selectedSeats, onSeatsSelected]);

  const handleSeatClick = (seatId) => {
    if (occupiedSeats.includes(seatId)) return;

    if (selectedSeats.includes(seatId)) {
      // Deselect seat
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      if (selectedSeats.length >= maxSeatsAllowed) {
        alert(`You can select up to ${maxSeatsAllowed} seats for this booking.`);
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleAutoPick = (count = 2) => {
    const available = [];
    rows.forEach(r => {
      [...colsLeft, ...colsRight].forEach(c => {
        const id = `${r}${c}`;
        if (!occupiedSeats.includes(id)) {
          available.push(id);
        }
      });
    });
    const picked = available.slice(0, count);
    setSelectedSeats(picked);
  };

  const handleClear = () => {
    setSelectedSeats([]);
  };

  const renderSeat = (seatId) => {
    const isOccupied = occupiedSeats.includes(seatId);
    const isSelected = selectedSeats.includes(seatId);
    const isVip = vipSeats.includes(seatId);

    let statusClass = 'seat-available';
    if (isOccupied) statusClass = 'seat-occupied';
    else if (isSelected) statusClass = 'seat-selected';
    else if (isVip) statusClass = 'seat-vip';

    return (
      <button
        key={seatId}
        type="button"
        disabled={isOccupied}
        onClick={() => handleSeatClick(seatId)}
        className={`seat-btn ${statusClass}`}
        title={isOccupied ? `Seat ${seatId} Occupied` : isVip ? `Seat ${seatId} (VIP Window)` : `Seat ${seatId}`}
      >
        <span className="seat-icon">
          <i className={isVip ? "ri-vip-crown-fill" : "ri-armchair-fill"}></i>
        </span>
        <span className="seat-num">{seatId}</span>
      </button>
    );
  };

  return (
    <div className="seat-picker-container">
      <div className="seat-picker-header d-flex align-items-center justify-content-between">
        <div>
          <h6 className="seat-picker-title mb-0">
            <i className="ri-bus-fill me-2 text-primary"></i> Select Your Seats
          </h6>
          <small className="text-muted">Interactive Coach Layout</small>
        </div>
        <div className="seat-picker-actions d-flex gap-2">
          <button 
            type="button" 
            className="btn btn-sm btn-outline-primary shadow-sm"
            onClick={() => handleAutoPick(2)}
          >
            <i className="ri-magic-line me-1"></i> Auto 2 Seats
          </button>
          {selectedSeats.length > 0 && (
            <button 
              type="button" 
              className="btn btn-sm btn-outline-danger shadow-sm"
              onClick={handleClear}
            >
              <i className="ri-refresh-line"></i> Clear
            </button>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="seat-legend d-flex flex-wrap align-items-center justify-content-center gap-3 my-3">
        <div className="legend-item">
          <span className="legend-box available"></span>
          <small>Available</small>
        </div>
        <div className="legend-item">
          <span className="legend-box selected"></span>
          <small>Selected</small>
        </div>
        <div className="legend-item">
          <span className="legend-box occupied"></span>
          <small>Booked</small>
        </div>
        <div className="legend-item">
          <span className="legend-box vip"></span>
          <small>VIP Window</small>
        </div>
      </div>

      {/* Coach Layout */}
      <div className="coach-wrapper">
        {/* Driver Cabin */}
        <div className="driver-cabin d-flex align-items-center justify-content-between mb-3 px-3 py-2">
          <span className="cabin-label"><i className="ri-steering-fill me-1"></i> Driver Deck</span>
          <span className="windshield-glass">Front View</span>
        </div>

        {/* Seats Grid */}
        <div className="seats-grid">
          {rows.map(rowNum => (
            <div key={rowNum} className="seat-row d-flex align-items-center justify-content-between mb-2">
              <div className="col-pair d-flex gap-2">
                {colsLeft.map(col => renderSeat(`${rowNum}${col}`))}
              </div>
              <div className="aisle-space">
                <span className="aisle-num">{rowNum}</span>
              </div>
              <div className="col-pair d-flex gap-2">
                {colsRight.map(col => renderSeat(`${rowNum}${col}`))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selection Summary Badge */}
      <div className="selected-summary-badge mt-3 p-2 text-center rounded-3">
        {selectedSeats.length > 0 ? (
          <div>
            <span className="badge bg-primary fs-6 me-2">
              {selectedSeats.length} Seat{selectedSeats.length > 1 ? 's' : ''} Selected
            </span>
            <span className="selected-seats-list text-dark fw-bold">
              [{selectedSeats.join(', ')}]
            </span>
          </div>
        ) : (
          <small className="text-muted">Tap on any available seat above to select your spots</small>
        )}
      </div>
    </div>
  );
};

export default SeatPicker;
